let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";

let currentUser;

let listViewDiv;

let metricsSortBy = "manual";

let progressbarVal = 0;

let bar = {};

let newChart = {};

let numberOfPops = 0;

let userPass = false;

authManager.getCurrentUser().then((user) => {
  currentUser = user;
});

if (typeof ListView !== "undefined") {
  let publicDataUpdate = buildfire.publicData.onUpdate((event) => {
    if (event.data && event.id) {
      metrics = event.data;
      metrics.id = event.id;
      renderInit();
    }
  });

  let dataStoreUpdate = buildfire.datastore.onUpdate((event) => {
    if (event.tag === "settings") {
      Settings.load().then(() => {
        renderInit();
      });
    }
  });
}
Metrics.getMetrics().then(async (data) => {
  metrics = data;

  await Settings.load().then(() => {
    if (typeof ListView !== "undefined") {
      checkUser();

      renderInit();
    }

    buildfire.history.push("Home", {
      nodeSelector,
      showLabelInTitlebar: true,
    });
  });
});

if (typeof ListView !== "undefined") {
  listViewDiv = new ListView("listViewContainer", {
    enableAddButton: true,
    Title: "",
  });

  listViewDiv.onItemClicked = (item) => {
    if (Object.keys(item.actionItem).length > 0) {
      buildfire.actionItems.execute(item.actionItem, () => {
        console.log("DONE DSADSA");
      });
    }
  };
}

const renderInit = () => {
  if (nodeSelector.slice(-7) !== "metrics") {
    return;
  }
  if (nodeSelector === "metrics" && !Settings.showSummary) {
    summary.style.display = "none";
  } else {
    summary.style.display = "block";
  }
  listViewContainer.innerHTML = "";
  console.log("Hello everybody", nodeSelector, metrics);
  let readyMetrics = helpers.nodeSplitter(nodeSelector, metrics);
  let metricsChildren = readyMetrics.metricsChildren;
  metricsSortBy = readyMetrics.metricsSortBy;
  if (Object.keys(newChart).length !== 0) {
    console.log("new Chart", newChart);
    newChart.destroy();
  }

  initChart2(readyMetrics.metricsParent);

  let currentMetricList = [];
  console.log("please", metricsChildren);

  let sum = 0;
  console.log("metrics widget", metrics);
  if (Object.keys(metricsChildren).length === 0) {
    listViewContainer.innerHTML = `<div style="text-align:center" >No metrics have been added yet</div>`;
  }
  for (let metricId in metricsChildren) {
    metricsChildren[metricId].id = metricId;
    let newMetric = new Metric(metricsChildren[metricId]);
    Metric.getHistoryValue(newMetric);

    sum += newMetric.value || 0;
    let listItem = new ListViewItem(newMetric);
    listItem.onToolbarClicked = (e) => {
      // newChart.destroy();

      if (metricsChildren[metricId].type === "parent") {
        nodeSelector += `.${metricId}.metrics`;
        buildfire.history.push(metricsChildren[metricId].title, {
          nodeSelector,
          // metricType: metricsChildren[metricId].type,
          showLabelInTitlebar: true,
        });
        buildfire.messaging.sendMessageToControl({
          title: metricsChildren[metricId].title,
          nodeSelector,
        });
        console.log("nodeSelector", nodeSelector);
        // newChart.destroy();
        renderInit();
        // pushBreadcrumb(item.title, { nodeSelector });
      } else {
        if (currentUser && userPass) {
          metricsScreen.style.display = "none";
          updateHistoryContainer.style.display = "block";

          console.log("metrics wowowowo", metrics);
          // nodeSelector += `.${metricId}.metrics`;

          buildfire.history.push(`Update ${metricsChildren[metricId].title}`, {
            nodeSelector,
            // metricType: metricsChildren[metricId].type,
            showLabelInTitlebar: true,
          });
          nodeSelector += `.${metricId}`;

          updateHistoryBtn.onclick = function (event) {
            console.log("metrics lalalalala", metrics);

            const value = Math.round(bar.value() * 100); // the value of the progressbar
            console.log("value", value);
            console.log("bar.value()", bar.value());
            // return;
            console.log(
              "qwqweeqweqweqeqweqweqweqwe",
              nodeSelector,
              metrics.id,
              value,
              newMetric.id
            );

            Metrics.updateMetricHistory(
              { nodeSelector, metricsId: metrics.id },
              value
            ).then((result) => {
              metrics = result;
              console.log("AFTER UPDATE nodeSelector", nodeSelector);
              // let tempNode = nodeSelector.split(".");
              // tempNode.split(".").pop();
              // nodeSelector = tempNode.join(".");

              console.log("AFTER UPDATE nodeSelector", nodeSelector);
              // newChart.destroy();

              buildfire.history.pop();
            });
          };
          if (Object.keys(bar).length !== 0) {
            console.log("Bar On Pop", bar);
            bar.destroy();
          }
          initProgressBar(newMetric);
        }
      }
    };
    currentMetricList.push(listItem);
  }

  console.log("CONSOLE>LOG metricsChildren", metricsChildren);

  if (Object.keys(metricsChildren).length !== 0) {
    let avg = (sum / Object.keys(metricsChildren).length).toPrecision(3);
    summaryValue.innerText = `${avg}%`;
  } else {
    summaryValue.innerText = "0%";
  }

  console.log("currentMetricList", currentMetricList);

  currentMetricList = helpers.sortMetrics(currentMetricList, metricsSortBy);

  listViewDiv.loadListViewItems(currentMetricList);
};

const getRandomColor = () => {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const initChart = (datasets) => {
  const ctx = document.getElementById("chart").getContext("2d");

  newChart = new Chart(ctx, {
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

const initChart2 = (metric) => {
  let datasets = [];
  let title = !metric.title ? `Home History` : `${metric.title} History`;
  let historyValues = [];
  for (var i = 7; i > 0; i--) {
    historyValues.push(historyValue(metric, i));
  }
  // for (var i = 1; i <= 7; i++) {
  //   historyValues.unshift(historyValue(metric, i));
  // }
  console.log("aksflakflsklgekhtr", historyValues, metric);
  datasets.push({
    label: title,
    data: historyValues,
    backgroundColor: "transparent",
    borderColor: getRandomColor(),
    borderWidth: 2,
  });
  initChart(datasets);
};
const initProgressBar = (newMetric) => {
  if (typeof ProgressBar !== "undefined") {
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
    // Assign global progressbar value
    progressbarVal = Math.round(newMetric.value) / 100;

    bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    bar.text.style.fontSize = "2rem";
  }

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
      changeProgressbarValue(ev.type);
    }
  });

  const changeProgressbarValue = (direction) => {
    let progressText = document.getElementsByClassName("progressbar-text")[0];
    if (direction === "pandown" && progressbarVal >= 0.000001) {
      bar.set(progressbarVal - 0.01);
      progressbarVal -= 0.01;
      progressText.innerHTML = parseInt(progressText.innerHTML) + newMetric.min;
    } else if (direction === "panup" && progressbarVal <= 0.9999999) {
      bar.set(progressbarVal + 0.01);
      progressbarVal += 0.01;
      progressText.innerHTML = parseInt(progressText.innerHTML) + newMetric.min;
    }
  };
};

const checkUser = () => {
  let currentTags = {};
  Settings.tags.forEach((tag) => {
    currentTags[tag.tagName] = tag.tagName;
  });

  currentUser.tags[Object.keys(currentUser.tags)[0]].forEach((tag) => {
    if (currentTags[tag.tagName]) {
      userPass = true;
    }
  });
};

buildfire.history.onPop((breadcrumb) => {
  // Show / Hide views

  if (numberOfPops) {
    --numberOfPops;
    nodeSelector = breadcrumb.options.nodeSelector;

    metricsScreen.style.display = "block";
    updateHistoryContainer.style.display = "none";
    renderInit();

    if (numberOfPops) {
      buildfire.history.pop();
    }
  } else {
    console.log("it shouldn't be");
    //  This condition is for preventing the control side from going back (when clicking back in widget)
    // when we are at the home, which would lead to an error
    if (Object.keys(breadcrumb.options).length > 0) {
      metricsScreen.style.display = "block";
      updateHistoryContainer.style.display = "none";
      nodeSelector = breadcrumb.options.nodeSelector;
      buildfire.messaging.sendMessageToControl({ nodeSelector });

      renderInit();
    }
  }
});

buildfire.messaging.onReceivedMessage = (message) => {
  console.log("Message has been received", message);
  console.log(
    "message.nodeSelector, nodeSelector",
    message.nodeSelector,
    "lallloooosh",
    nodeSelector
  );

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

function historyValue(metric, inde) {
  if (metric.type === "metric") {
    let todayDate = helpers.getAbsoluteDate();

    // console.log(
    //   "whole time of pain",
    //   todayDate.getDate(),
    //   new Date(metric.history[0].date),
    //   inde
    // );
    for (var i = 1; i <= 7; i++) {
      if (metric.history[metric.history.length - i]) {
        // if (inde === 3) {
        //   console.log(
        //     "laloosh0",
        //     new Date(
        //       todayDate -
        //         new Date(metric.history[metric.history.length - i].date)
        //     ).getDate(),
        //     inde
        //   );
        // }
        if (
          new Date(
            todayDate - new Date(metric.history[metric.history.length - i].date)
          ).getDate() >= inde
        ) {
          let val = metric.history[metric.history.length - i].value;
          return val;
        }
      }
    }
    // let val = metric.history[metric.history.length - inde]
    //   ? metric.history[metric.history.length - inde].value
    //   : "false";

    return "false";
  } else if (metric.type === "parent" || !metric.type) {
    if (Object.keys(metric.metrics).length === 0) {
      return 0;
    }
    if (metric.metrics) {
      let sum = 0;
      let numberChildren = 0;
      for (let key in metric.metrics) {
        if (historyValue(metric.metrics[key], inde) !== "false") {
          numberChildren++;

          sum += historyValue(metric.metrics[key], inde);
        }
      }
      let avg = sum / numberChildren;

      return avg;
    }
  }
}

// function historyValue(metric, inde) {
//   if (metric.type === "metric") {
//     let val = metric.history[metric.history.length - inde]
//       ? metric.history[metric.history.length - inde].value
//       : 0;

//     return val;
//   } else if (metric.type === "parent" || !metric.type) {
//     if (Object.keys(metric.metrics).length === 0) {
//       return 0;
//     }
//     if (metric.metrics) {
//       let sum = 0;
//       for (let key in metric.metrics) {
//         sum += historyValue(metric.metrics[key], inde);
//       }
//       let avg = sum / Object.keys(metric.metrics).length;
//       return avg;
//     }
//   }
// }
