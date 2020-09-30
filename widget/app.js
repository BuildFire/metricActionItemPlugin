let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
let currentUser;
let listViewDiv;
authManager.getCurrentUser().then((user) => {
  currentUser = user;
});

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

Metrics.getMetrics().then(async (data) => {
  metrics = data;
  console.log("!!!!!!!!!!!!!!!!!!!!!!", metrics);

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
buildfire.messaging.onReceivedMessage = (msg) => {
  if (msg.cmd == "refresh")
    /// message comes from the strings page on the control side
    location.reload();
};
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

  for (let metricId in metricsChildren) {
    metricsChildren[metricId].id = metricId;
    let newMetric = new Metric(metricsChildren[metricId]);
    Metric.getHistoryValue(newMetric);
    console.log("newMetric", newMetric);

    sum += newMetric.value || 0;
    let listItem = new ListViewItem(newMetric);
    listItem.onToolbarClicked = (e) => {
      if (metricsChildren[metricId].type === "parent") {
        nodeSelector += `.${metricId}.metrics`;
        buildfire.history.push(metricsChildren[metricId].title, {
          nodeSelector,
          metricType: metricsChildren[metricId].type,
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
        progressbarContainer.style.display = "block";
        console.log("metrics wowowowo", metrics);
        nodeSelector += `.${metricId}.metrics`;

        buildfire.history.push(`Update ${metricsChildren[metricId].title}`, {
          nodeSelector,
          metricType: metricsChildren[metricId].type,
          showLabelInTitlebar: true,
        });
        // nodeSelector += `.${metricId}`;

        updateHistoryBtn.onclick = function (event) {
          console.log("metrics lalalalala", metrics);

          console.log("newMetric", newMetric);
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
            value,
            newMetric.id
          ).then((result) => {
            metrics = result;
            console.log("AFTER UPDATE nodeSelector", nodeSelector);
            // let tempNode = nodeSelector.split(".");
            // tempNode.split(".").pop();
            // nodeSelector = tempNode.join(".");

            console.log("AFTER UPDATE nodeSelector", nodeSelector);

            renderInit();
            metricsScreen.style.display = "block";
            progressbarContainer.style.display = "none";
          });
        };
        bar.animate(Math.round(newMetric.value) / 100);
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

  if (Settings.sortBy === "highest") {
    currentMetricList.sort((a, b) => b.value - a.value);
  } else if (Settings.sortBy === "lowest") {
    currentMetricList.sort((a, b) => a.value - b.value);
  } else {
    currentMetricList.sort((a, b) => a.order - b.order);
  }

  listViewDiv.loadListViewItems(currentMetricList);
};

// updateMetricHistory progress bar
let bar = new ProgressBar.SemiCircle("#updateHistoryContainer", {
  strokeWidth: 10,
  color: "#FFEA82",
  trailColor: "#eee",
  trailWidth: 10,
  easing: "easeInOut",
  duration: 1400,
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
    var value = Math.round(bar.value() * 100);
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

buildfire.history.onPop((breadcrumb) => {
  // Show / Hide views
  // if (breadcrumb.options.metricType === "metric") {
  //   renderInit();
  console.log("bredacrumb ;lalalala", breadcrumb);
  if (Object.keys(breadcrumb.options).length > 0) {
    metricsScreen.style.display = "block";
    progressbarContainer.style.display = "none";
    nodeSelector = breadcrumb.options.nodeSelector;
    buildfire.messaging.sendMessageToControl({ nodeSelector });

    renderInit();
  }
});

buildfire.messaging.onReceivedMessage = (message) => {
  console.log("Message has been received", message);
  nodeSelector = message.nodeSelector;
  renderInit();
  metricsScreen.style.display = "block";
  progressbarContainer.style.display = "none";
};
