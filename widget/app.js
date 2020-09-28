let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
let currentUser;
let listViewContainer;
authManager.getCurrentUser().then((user) => {
  currentUser = user;
});

var e = buildfire.publicData.onUpdate((event) => {
  if (event.data && event.id) {
    metrics = event.data;
    renderInit();
  }
});

Metrics.getMetrics().then(async (data) => {
  metrics = data;

  console.log("laslalss", metrics);
  await Settings.load().then(() => {
    if (typeof ListView !== "undefined") {
      renderInit();
    }

    buildfire.history.push("Home", {
      nodeSelector,
      showLabelInTitlebar: true,
      elementToShow: "#2014Top10",
    });
  });
});
buildfire.messaging.onReceivedMessage = (msg) => {
  if (msg.cmd == "refresh")
    /// message comes from the strings page on the control side
    location.reload();
};
if (typeof ListView !== "undefined") {
  listViewContainer = new ListView("listViewContainer", {
    enableAddButton: true,
    Title: "",
  });

  listViewContainer.onItemClicked = (item) => {
    if (Object.keys(item.actionItem).length > 0) {
      buildfire.actionItems.execute(item.actionItem, () => {
        console.log("DONE DSADSA");
      });
    }
  };
}

const renderInit = () => {
  listViewContainer.innerHTML = "";

  let currentMetricList = [];
  let sum = 0;
  console.log("metrics widget", metrics);
  for (let metricId in metrics.metrics) {
    metrics.metrics[metricId].id = metricId;
    let newMetric = new Metric(metrics.metrics[metricId]);
    Metric.getHistoryValue(newMetric);
    console.log;
    sum += newMetric.value || 0;
    currentMetricList.push(newMetric);
  }

  document.getElementById("summaryValue").innerText = `${
    sum / Object.keys(metrics.metrics).length
  }%`;

  listViewContainer.loadListViewItems(currentMetricList);
};
