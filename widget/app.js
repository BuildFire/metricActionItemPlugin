let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
let currentUser;
let listViewDiv;
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

  let metricsChildren = helpers.nodeSplitter(nodeSelector, metrics);
  let currentMetricList = [];
  console.log("please", metricsChildren);

  let sum = 0;
  console.log("metrics widget", metrics);

  for (let metricId in metricsChildren) {
    metricsChildren[metricId].id = metricId;
    let newMetric = new Metric(metricsChildren[metricId]);
    Metric.getHistoryValue(newMetric);

    sum += newMetric.value || 0;
    let listItem = new ListViewItem(newMetric);
    listItem.onToolbarClicked = (e) => {
      console.log("metricsChildren[metricId]", metricsChildren[metricId]);

      if (metricsChildren[metricId].type === "parent") {
        nodeSelector += `.${metricId}.metrics`;
        console.log("nodeSelector", nodeSelector);
        renderInit();
        // pushBreadcrumb(item.title, { nodeSelector });
      }
    };
    currentMetricList.push(listItem);
  }

  document.getElementById("summaryValue").innerText = `${
    sum / Object.keys(metricsChildren).length
  }%`;

  listViewDiv.loadListViewItems(currentMetricList);
};
