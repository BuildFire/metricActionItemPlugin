let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";

let currentUser;

let listViewDiv;

let metricsSortBy = "manual";

let progressbarVal = 0;

let bar = {};
let numberOfPops = 0;
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
  listViewContainer.innerHTML = "";
  console.log("Hello everybody", nodeSelector, metrics);
  let metricsChildren = helpers.nodeSplitter(nodeSelector, metrics);
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
        renderInit();
        // pushBreadcrumb(item.title, { nodeSelector });
      } else {
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
            buildfire.history.pop();
          });
        };
        bar.animate(Math.round(newMetric.value) / 100);

        // Assign global progressbar value
        progressbarVal = Math.round(newMetric.value) / 100;
      }
    };
    currentMetricList.push(listItem);
  }

  if (Object.keys(metricsChildren).length !== 0) {
    let avg = (sum / Object.keys(metricsChildren).length).toPrecision(3);
    summaryValue.innerText = `${avg}%`;
  } else {
    summaryValue.innerText = "0%";
  }

  console.log("currentMetricList", currentMetricList);

  if (metricsSortBy === "highest") {
    currentMetricList.sort((a, b) => b.value - a.value);
  } else if (metricsSortBy === "lowest") {
    currentMetricList.sort((a, b) => a.value - b.value);
  } else {
    currentMetricList.sort((a, b) => a.order - b.order);
  }

  listViewDiv.loadListViewItems(currentMetricList);
};

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
      var value = Math.round(bar.value() * 300);
      if (value === 0) {
        bar.setText(0);
      } else {
        bar.setText(value);
      }

      bar.text.style.color = state.color;
    },
  });
  bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
  bar.text.style.fontSize = "2rem";

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
    if (direction === "pandown" && progressbarVal >= 0) {
      bar.set(progressbarVal - 0.01);
      progressbarVal -= 0.01;
    } else if (direction === "panup" && progressbarVal <= 1) {
      bar.set(progressbarVal + 0.01);
      progressbarVal += 0.01;
    }
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
}
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
