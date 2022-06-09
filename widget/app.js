// The big object that contains all the metrics
let metrics = {};

// Object containes a specific client history
let histories = {};

// Client profile (client query)
let clientProfile = "";
let isQeuryProvided = false;

// Check if a query string was provided
let queryString = buildfire.parseQueryString();
if (queryString && queryString.clientProfile) {
  clientProfile = queryString.clientProfile;
  isQeuryProvided = true;
}

// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";

let currentUser;

// Reference to the progress bar in (update histroy value page)
let bar = {};

// Reference to hammer in (update histroy value page)
let hammer = {};

// Reference to the metric's chart in metrics lists' page
let metricChart = {};

// A variable that is used to set how many times to pop the breadcrumb when the control side go back multiple levels at once
let numberOfPops = 0;

// Get the app's theme to utilize its colors in design
let appThemeObj = {};

// Get the App's Theme properties in order to inherit them in the widget design
buildfire.appearance.getAppTheme((err, appTheme) => {
  appThemeObj = appTheme;
});

// hide metric screen on init;
helpers.hideElem("#metricsScreen");

// Login and Logout listners
buildfire.auth.onLogin((user) => {
  currentUser = user;
  loadApp();
});

buildfire.auth.onLogout(() => {
  currentUser = null;
  loadApp();
});

let isDeeplink = false;
buildfire.deeplink.getData((data) => {
  if (data && data.link) {
    isDeeplink = true;
    let itemPath = data.link.split(".");
    itemPath.pop();
    nodeSelector = itemPath.join(".");
  }
});

// buildfire.navigation.onAppLauncherActive(() => {
//   if (nodeSelector !== "metrics") {
//     nodeSelector = "metrics";
//     buildfire.messaging.sendMessageToControl({ nodeSelector });
//     loadApp();
//   }
// }, false);

const getBreadCrumps = () => {
  return new Promise((resolve, reject) => {
    buildfire.history.get(
      {
        pluginBreadcrumbsOnly: false,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

// Get all user bookmarks
// let bookmarks = {};

// const getBookmarks = () => {
//   buildfire.bookmarks.getAll((bookmarks) => {
//     if (bookmarks) {
//       bookmarks.forEach((bookmark) => {
//         bookmarks[bookmark.id] = bookmark.id;
//       });
//     }
//   });
// };

// To sync between the widget and the control when any change (in metrics) happened in the control side
buildfire.datastore.onUpdate((event) => {
  if (event.data && event.tag) {
    if (event.data && event.id && event.tag === "metrics") {
      metrics = event.data;
      metrics.id = event.id;
      renderInit();
    } else if (event.tag === "settings") {
      loadApp();
    }
  }
});

// Load the data again once the history is updated
buildfire.publicData.onUpdate((event) => {
  if (event.status && event.nModified) {
    Histories.getHistories(clientProfile).then((result) => {
      histories = result;
      renderInit();
    });
  } else if (event.tag && event.tag.indexOf("history") > -1) {
    Histories.getHistories(clientProfile).then((result) => {
      histories = result;
      renderInit();
    });
  }
});

const loadMetrics = () => {
  // To get all metrics and start rendering
  Metrics.getMetrics().then((result) => {
    metrics = result;
    // Initialize clinet history
    Histories.getHistories(clientProfile).then((result) => {
      if (
        !currentUser &&
        !isQeuryProvided &&
        Settings.dataPolicyType === "private"
      ) {
        histories = { metrics: {} };
      } else {
        histories = result;
      }

      initMaterialComponents();
      renderInit();
    });
  });
};

const loadApp = () => {
  authManager.getCurrentUser().then((user) => {
    currentUser = user;
    Settings.load().then(() => {
      if (isQeuryProvided) {
        return loadMetrics();
      } else if (Settings.dataPolicyType === "private") {
        Settings.tags = [];
        if (user) {
          // This means that the user is logged in and the dataPolicy is private
          clientProfile = encodeURIComponent(`user${user.userToken}`);
        }
        return loadMetrics();
      } else {
        // This means the data policy type is public and clientProfile should be empty
        clientProfile = "";
        return loadMetrics();
      }
    });
  });
};

loadApp();

// To initialize and prepare metrics to be rendered
const renderInit = () => {
  try {
    // Filter Metrics before rendering
    helpers.filterClientMetrics(metrics).then((filteredMetrics) => {
      metrics.metrics = filteredMetrics;

      listViewContainer.innerHTML = "";
      // Extract the desired metrics (children) from the big object using nodeSelector
      let readyMetrics = helpers.nodeSplitter(nodeSelector, metrics);
      // Hide the summary in the Home Page if the settings is set to hide it
      if (nodeSelector === "metrics" && !Settings.showSummary) {
        helpers.hideElem("#summary");
      } else {
        helpers.showElem("#summary");
      }

      // Get metrics that should be rendered
      let metricsChildren = readyMetrics.metricsChildren;
      // Init metrics values' chart
      initChart(readyMetrics.metricsParent);

      helpers.showElem("#metricsScreen");
      helpers.hideElem("#updateHistoryContainer, #updateHistoryButton");

      if (readyMetrics.metricsParent.description) {
        description.style.display = "block";
        document.getElementById("metricDescription").innerHTML =
          readyMetrics.metricsParent.description;
      } else {
        description.style.display = "none";
      }

      let currentMetricList = [];
      // Prepare metrics to be rendered in the ListView component
      for (let metricId in metricsChildren) {
        metricsChildren[metricId].id = metricId;
        let newMetric = new Metric(metricsChildren[metricId]);
        let InitMetricAsItem = metricAsItemInit(newMetric);
        currentMetricList.push(InitMetricAsItem);
      }
      // Add the summary value of the parent metric
      summaryValue.innerText = `${readyMetrics.metricsParent.value || 0}%`;

      checkIncreaseOrDecrease(readyMetrics);

      currentMetricList = helpers.sortMetrics(
        currentMetricList,
        readyMetrics.metricsSortBy
      );
      renderMetrics(currentMetricList);
    });
  } catch (err) {
    console.error(err);
  }
};

// Render metrics using ListView component
const renderMetrics = (metrics) => {
  let listViewDiv = new ListView("listViewContainer", {
    enableAddButton: true,
    Title: "",
  });
  listViewDiv.loadListViewItems(metrics);
};

const checkIncreaseOrDecrease = (metrics) => {
  // Calculate the percentage increase or decreased compared to the previous value for the metric;
  let situation;
  let situationClass;
  if (metrics.metricsParent.value > metrics.metricsParent.previousValue) {
    situation = "trending_up";
    situationClass = "mdc-theme--secondary";
  } else if (
    metrics.metricsParent.value < metrics.metricsParent.previousValue
  ) {
    situation = "trending_down";
    situationClass = "mdc-theme--error";
  } else {
    situation = "remove";
    situationClass = "mdc-theme--text-primary-on-background";
  }
  let percentage =
    metrics.metricsParent.value - metrics.metricsParent.previousValue;

  percentage = percentage.toPrecision(3);

  (percentage === "100") ? Analytics.trackAction(AnalyticsKey.eventType[1].key) : false;

  summaryPreviousValueContainer.innerHTML = `
      <i
      class="material-icons mdc-button__icon ${situationClass} trending-icon">${situation}</i >
      <span id="summaryPreviousValue">${percentage || 0}%</span>
      `;

  // Add the metric title to the summary card;
  summaryTitle.innerHTML = metrics.metricsParent.title || "";
};

// Initialize metics to be rendered using list view library
const metricAsItemInit = (newMetric) => {
  let listItem = new ListViewItem(newMetric);
  listItem.onIconTitleClick = (item) => {
    if (Object.keys(item.actionItem).length > 0) {
      buildfire.actionItems.execute(item.actionItem, () => {});
    }
  };
  listItem.onToolbarClicked = (e) => {
    if (newMetric.type === "parent") {
      nodeSelector += `.${newMetric.id}.metrics`;
      buildfire.history.push(newMetric.title, {
        nodeSelector,
        // metricType: newMetric.type,
        showLabelInTitlebar: true,
      });
      buildfire.messaging.sendMessageToControl({
        title: newMetric.title,
        nodeSelector,
      });

      renderInit();
    } else {
      if (isUserAuthorized()) {
        helpers.hideElem("#metricsScreen");
        helpers.showElem("#updateHistoryContainer, #updateHistoryButton");
        historyCloseBtn.style.background = appThemeObj.colors.warningTheme;

        nodeSelector += `.${newMetric.id}`;

        buildfire.history.push(`Update ${newMetric.title}`, {
          nodeSelector,
          showLabelInTitlebar: true,
        });

        // helpers.getElem("#bookmark").querySelector("button").onclick = () => {
        //   if (!bookmarks[newMetric.id]) {
        //     const options = {
        //       id: newMetric.id,
        //       title: newMetric.title,
        //       icon: newMetric.icon,
        //       payload: {
        //         data: { link: nodeSelector },
        //       },
        //     };

        //     buildfire.bookmarks.add(options, () => {
        //       // Change bookmarks button icon
        //       helpers.getElem("#bookmarks button").innerText = "star";
        //       // Add the bookmarked item to the global bookmarks object
        //       bookmarks[newMetric.id] = newMetric.id;
        //     });
        //   } else {
        //     buildfire.bookmarks.delete(newMetric.id, () => {
        //       // Change bookmarks button icon
        //       helpers.getElem("#bookmarks button").innerText = "star_outlined";
        //       // Remove the bookmarked item to the global bookmarks object
        //       delete bookmarks[newMetric.id];
        //     });
        //   }
        // };

        // Add onclick handler to add notes icon inorder to add notes
        helpers.getElem("#notes").querySelector("button").onclick = () => {
          // Get the parent path for the metric

          const options = {
            itemId: nodeSelector,
            title: newMetric.title,
            imageUrl: newMetric.icon,
          };

          buildfire.notes.openDialog(options, () => {});
        };

        // helpers.getElem("#share").querySelector("button").onclick = () => {
        //   const options = {
        //     itemId: nodeSelector,
        //     title: newMetric.title,
        //     imageUrl: newMetric.icon,
        //   };

        //   buildfire.notes.openDialog(options, () => {});
        // };

        updateHistoryBtn.onclick = (event) => {
          const value = Math.round(bar.value() * 100); // the value of the progressbar
          Histories.updateMetricHistory(
            { clientProfile, nodeSelector, historyId: histories.id },
            {
              value,
              username:
                currentUser && currentUser.username
                  ? currentUser.username
                  : null,
            }
          )
            .then((result) => {
              // metrics = result;
              buildfire.history.pop();
            })
            .catch((err) => {
              console.log(err);
            });
        };
        updateHistoryBtn.style.backgroundColor =
          appThemeObj.colors.successTheme;
        initProgressBar(newMetric);
        document.body.scrollTop = 0;
      }
    }
  };
  return listItem;
};

const initChart = (metric) => {
  // To destroy (delete) any chart in the screen if exists
  if (Object.keys(metricChart).length !== 0) {
    metricChart.destroy();
  }

  let title = !metric.title ? `Home History` : `${metric.title} History`;

  let history = Metrics.getHistoryValues(metric);

  let historyValues = history.historyData;
  let historyDates = history.historyDays;

  let datasets = [
    {
      label: title,
      data: historyValues,
      backgroundColor: "rgba(101, 116, 205, 0.1)",
      borderColor: appThemeObj.colors.primaryTheme,
      pointBackgroundColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      borderWidth: 2,
      fill: true,
    },
  ];
  renderChart(datasets, historyDates);
};

const renderChart = (datasets, historyDates) => {
  const ctx = document.getElementById("chart").getContext("2d");

  metricChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: historyDates,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      spanGaps: false,
      legend: {
        display: false,
      },
      elements: {
        point: {
          radius: 4,
          borderWidth: 2,
          hitRadius: 15,
          hoverRadius: 7,
          hoverBorderWidth: 2,
        },
        line: {
          tension: 0,
        },
      },
      layout: {
        padding: {
          top: 10,
          left: 8,
          right: 8,
          bottom: 0,
        },
      },
      scales: {
        xAxes: [
          {
            display: true,
            gridLines: {
              display: false,
            },
          },
        ],
        yAxes: [
          {
            display: false,
          },
        ],
      },
    },
  });
};

const initProgressBar = (newMetric) => {
  if (Object.keys(bar).length !== 0) {
    bar.destroy();
  }
  // updateMetricHistory progress bar
  bar = new ProgressBar.SemiCircle("#progressbar-container", {
    strokeWidth: 10,
    color: "#FFEA82",
    trailColor: "#eee",
    trailWidth: 10,
    easing: "easeInOut",
    duration: 500,
    svgStyle: null,
    text: {
      value: "",
      alignToBottom: true,
    },
    from: { color: appThemeObj.colors.dangerTheme },
    to: { color: appThemeObj.colors.successTheme },
    // Set default step function for all animate calls
    step: (state, bar) => {
      bar.path.setAttribute("stroke", state.color);
      var value = Math.round(bar.value() * (newMetric.max - newMetric.min));
      if (value === 0) {
        bar.setText(0);
      } else {
        bar.setText(value);
      }
      bar.text.style.color = state.color;
    },
  });

  bar.set(Math.round(newMetric.value) / 100);
  let progressText = document.getElementsByClassName("progressbar-text")[0];
  progressText.innerHTML = parseInt(progressText.innerHTML) + newMetric.min;
  minMax.innerHTML = `Min ${newMetric.min} - Max ${newMetric.max}`;

  bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
  bar.text.style.fontSize = "2rem";

  InitHammerJS(newMetric);
};

const InitHammerJS = (newMetric) => {
  if (Object.keys(hammer).length !== 0) {
    hammer.destroy();
  }

  // Init hammerJs gesture detection on element
  let updateHistoryContainer = document.getElementById(
    "updateHistoryContainer"
  );
  // create an instance of Hammer
  hammer = new Hammer(updateHistoryContainer);
  hammer
    .get("pan")
    .set({ direction: Hammer.DIRECTION_VERTICAL, threshold: 25 });

  // listen to events...
  hammer.on("panup pandown", (ev) => {
    if (Math.round(ev.distance) % 1 === 0) {
      changeProgressbarValue(ev.type, newMetric);
    }
  });
};

const changeProgressbarValue = (direction, newMetric) => {
  let progressText = document.getElementsByClassName("progressbar-text")[0];
  if (direction === "pandown" && bar.value() > 0) {
    bar.set(bar.value() - 0.01);
    progressText.innerHTML = parseInt(progressText.innerHTML) + newMetric.min;
  } else if (direction === "panup" && bar.value() < 1) {
    bar.set(bar.value() + 0.01);
    progressText.innerHTML = parseInt(progressText.innerHTML) + newMetric.min;
  }
};

const isUserAuthorized = () => {
  let authorized = false;
  let currentTags = {};
  if (
    !currentUser &&
    !isQeuryProvided &&
    Settings.dataPolicyType === "private"
  ) {
    buildfire.components.toast.showToastMessage(
      {
        text: "Login is required.",
        action: {
          title: "Login",
        },
      },
      () => authManager.login()
    );
    return false;
  } else if (Settings.tags.length === 0) {
    authorized = true;
  } else {
    if (!currentUser) {
      buildfire.components.toast.showToastMessage(
        {
          text: "Login is required.",
          action: {
            title: "Login",
          },
        },
        () => authManager.login()
      );
      return false;
    }

    Settings.tags.forEach((tag) => {
      currentTags[tag.tagName] = tag.tagName;
    });

    if (currentUser && currentUser.tags) {
      currentUser.tags[Object.keys(currentUser.tags)[0]].forEach((tag) => {
        if (currentTags[tag.tagName]) {
          authorized = true;
        }
      });
    }
  }
  if (!authorized) {
    buildfire.components.toast.showToastMessage(
      {
        text: "You do not have access to update.",
      },
      () => {}
    );
  }
  return authorized;
};

const initMaterialComponents = () => {
  document.querySelectorAll(".mdc-button").forEach((btn) => {
    mdc.ripple.MDCRipple.attachTo(btn);
  });

  document.querySelectorAll(".mdc-fab").forEach((btn) => {
    mdc.ripple.MDCRipple.attachTo(btn);
  });
};

buildfire.history.onPop((breadcrumb) => {
  // It is a way to go back multiple times in widget when the control side go back multiple levels at once
  if (numberOfPops) {
    --numberOfPops;
    nodeSelector = breadcrumb.options.nodeSelector || "metrics";

    helpers.showElem("#metricsScreen");
    helpers.hideElem("#updateHistoryContainer, #updateHistoryButton");

    if (numberOfPops) {
      buildfire.history.pop();
    } else {
      renderInit();
    }
  } else {
    //  This condition is for preventing the control side from going back (when clicking back in widget)
    // when we are at the home, which would lead to an error
    helpers.showElem("#metricsScreen");
    helpers.hideElem("#updateHistoryContainer, #updateHistoryButton");

    nodeSelector = breadcrumb.options.nodeSelector || "metrics";
    buildfire.messaging.sendMessageToControl({ nodeSelector });
    renderInit();
  }
});

buildfire.messaging.onReceivedMessage = (message) => {
  // To reload the widget side when the user navigate between tabs then return to the content tab, where we should reset everything
  if (message.cmd == "refresh") {
    if (nodeSelector != "metrics") {
      location.reload();
    }
  } else if (message.numberOfPops) {
    numberOfPops = message.numberOfPops;
    // To check if the the screens in both sides (control & widget) are the same
    // (For example, if the widget on the update history value screen (which is not existed in the cotrol);
    // So we have to pop another time to sync between the two sides
    if (message.nodeSelector !== nodeSelector) {
      numberOfPops++;
    }
    buildfire.history.pop();
  } else {
    nodeSelector = message.nodeSelector;
    buildfire.history.push(message.title, {
      nodeSelector,
      showLabelInTitlebar: true,
    });
    renderInit();
    helpers.showElem("#metricsScreen");
    helpers.hideElem("#updateHistoryContainer, #updateHistoryButton");
  }
};

// To close the metric update value's screen (without saving) and return to metrics page
const closeUpdateHistory = () => {
  return buildfire.history.pop();
};
