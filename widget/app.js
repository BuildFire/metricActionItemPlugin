// The big object that contains all the metrics
let metrics = {};

// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";

let currentUser;

// Reference to the progress bar in (update histroy value page)
let bar = {};

// Reference to the values chart in metrics lists' page 
let valuesChart = {};

// A variable that is used to set how many times to pop the breadcrumb when the control side go back multiple levels at once 
let numberOfPops = 0;


// Get the logged in user
const getCurrentUser = () => {
  return authManager.getCurrentUser().then((user) => {
    currentUser = user;
  });
};

getCurrentUser();

// Login and Logout listners
buildfire.auth.onLogin(() => getCurrentUser());
buildfire.auth.onLogout(() => (currentUser = null));

if (typeof ListView !== "undefined") {

// To sync betwwen the widget and the control when any change (in metrics) happened in the control side
buildfire.publicData.onUpdate((event) => {
  if (event.data && event.id) {
    metrics = event.data;
    metrics.id = event.id;
    renderInit();
  }
});

// To sync betwwen the widget and the control when any change (in settings) happened in the control side
buildfire.datastore.onUpdate((event) => {
  if (event.tag === "settings") {
    Settings.load().then(() => {
      renderInit();
    });
  }
});
}
// To get all metrics and start rendering
Metrics.getMetrics().then(async (result) => {
  metrics = result;

  await Settings.load().then(() => {
    // To prevent Functional Tests from Applying these lines where it will cause some errors
    if (typeof ListView !== "undefined") {
      // Check if the user have the permission to update metrics
      isUserAuthorized();
      
      renderInit();
    }
  });
});

// To initialize and prepare metrics to be rendered
const renderInit = () => {
  listViewContainer.innerHTML = "";
  console.log("Hello everybody", nodeSelector, metrics);
  // Extract the desired metrics (children) from the big object using nodeSelector
  let readyMetrics = helpers.nodeSplitter(nodeSelector, metrics);
  // Hide the summary in the Home Page if the settings is set to hide it
  if (nodeSelector === "metrics" && !Settings.showSummary) {
    summary.style.display = "none";
  } else {
    summary.style.display = "block";
  }
  // Get metrics that should be rendered
  let metricsChildren = readyMetrics.metricsChildren;
  console.log("please", metricsChildren);
  // Init metrics values' chart 
  initChart(readyMetrics.metricsParent);
  console.log("metrics widget", metrics);

  let currentMetricList = [];
    // Prepare metrics to be rendered in the ListView component
  for (let metricId in metricsChildren) {
    metricsChildren[metricId].id = metricId;
    let newMetric = new Metric(metricsChildren[metricId]);
    let InitMetricAsItem = metricAsItemInit(newMetric);
    currentMetricList.push(InitMetricAsItem);
  }
 // Add the summary value of the parent metric
 summaryValue.innerText = readyMetrics.metricsParent.value
 ? `${readyMetrics.metricsParent.value}%`
 : "0%";

  currentMetricList = helpers.sortMetrics(currentMetricList, readyMetrics.metricsSortBy);
  renderMetrics(currentMetricList);
};

// Render metrics using ListView component
const renderMetrics = (metrics) => {
  listViewDiv = new ListView("listViewContainer", {
    enableAddButton: true,
    Title: "",
  });
listViewDiv.loadListViewItems(metrics);
}

// 
const metricAsItemInit = (newMetric) => {
  let listItem = new ListViewItem(newMetric);
  listItem.onIconTitleClick = (item) => {
    if (Object.keys(item.actionItem).length > 0) {
      buildfire.actionItems.execute(item.actionItem, () => {
        console.log("Action Done");
      });
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
      if (currentUser && isUserAuthorized()) {
        metricsScreen.style.display = "none";
        updateHistoryContainer.style.display = "block";

        nodeSelector += `.${newMetric.id}`;

        buildfire.history.push(`Update ${newMetric.title}`, {
          nodeSelector,
          showLabelInTitlebar: true,
        });

        updateHistoryBtn.onclick =  (event) => {
          const value = Math.round(bar.value() * 100); // the value of the progressbar
        
          Metrics.updateMetricHistory(
            { nodeSelector, metricsId: metrics.id },
            value,
            `${currentUser.firstName} ${currentUser.lastName}`
          ).then((result) => {
            metrics = result;
            buildfire.history.pop();
          });
        };
        if (Object.keys(bar).length !== 0) {
          bar.destroy();
        }
        initProgressBar(newMetric);
        document.body.scrollTop = 0;
      }
    }
  };
  return listItem;
}

// Get a different a color of the chart every time the chart is rendered
const getRandomColor = () => {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const initChart = (metric) => {
  // To destroy (delete) any chart in the screen if exists
  if (Object.keys(valuesChart).length !== 0) {
    valuesChart.destroy();
  }

  let title = !metric.title ? `Home History` : `${metric.title} History`;
  let historyValues = [];
  // This for loop calculate and set all the values of all metrics for the last 7 days
  for (let i = 7; i > 0; i--) {
    let value = Metrics.getHistoryValue(metric, i) || 0;
    historyValues.push(value);
  }
  
  let datasets = [{
    label: title,
    data: historyValues,
    backgroundColor: "transparent",
    borderColor: getRandomColor(),
    borderWidth: 2,
  }];
  renderChart(datasets);
};

const renderChart = (datasets) => {
  const ctx = document.getElementById("chart").getContext("2d");

  valuesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: helpers.getLast7Days(),
      datasets,
    },
    options: {
      responsive: true,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
};

const initProgressBar = (newMetric) => {
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
      from: { color: "#FFEA82" },
      to: { color: "#ED6A5A" },
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
  // Init hammerJs gesture detection on element
  let updateHistoryContainer = document.getElementById(
    "updateHistoryContainer"
  );
  // create a simple instance of Hammer
  let hammer = new Hammer(updateHistoryContainer);
  hammer
    .get("pan")
    .set({ direction: Hammer.DIRECTION_VERTICAL, threshold: 25 });

  // listen to events...
  hammer.on("panup pandown", (ev) => {
    if (Math.round(ev.distance) % 1 === 0) {
      // console.log(Math.round(ev.distance));
      changeProgressbarValue(ev.type, newMetric);
    }
  });
}

const changeProgressbarValue = (direction, newMetric) => {
  let progressText = document.getElementsByClassName("progressbar-text")[0];
  if (direction === "pandown" && bar.value() >= 0.0000000001) {
    bar.set(bar.value() - 0.01);
    progressText.innerHTML = parseInt(progressText.innerHTML) + newMetric.min;
  } else if (direction === "panup" && bar.value() <= 0.99999999999) {
    bar.set(bar.value() + 0.01);
    progressText.innerHTML = parseInt(progressText.innerHTML) + newMetric.min;
  }
};

const isUserAuthorized = () => {
  let authorized = false;
  let currentTags = {};
  if (Settings.tags.length === 0) {
    authorized = true;
  } else {
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
  return authorized;
};

buildfire.history.onPop((breadcrumb) => {
  // It is a way to go back multiple times in widget when the control side go back multiple levels at once
  if (numberOfPops) {
    --numberOfPops;
    nodeSelector = breadcrumb.options.nodeSelector || "metrics";

    metricsScreen.style.display = "block";
    updateHistoryContainer.style.display = "none";
    renderInit();

    if (numberOfPops) {
      buildfire.history.pop();
    }
  } else {
    //  This condition is for preventing the control side from going back (when clicking back in widget)
    // when we are at the home, which would lead to an error
    // if (Object.keys(breadcrumb.options).length > 0) {
      metricsScreen.style.display = "block";
      updateHistoryContainer.style.display = "none";
      nodeSelector = breadcrumb.options.nodeSelector || "metrics";
      buildfire.messaging.sendMessageToControl({ nodeSelector });
      renderInit();
    // }
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
    metricsScreen.style.display = "block";
    updateHistoryContainer.style.display = "none";
  }
};

const closeUpdateHistory = () => {
  return buildfire.history.pop();
};
