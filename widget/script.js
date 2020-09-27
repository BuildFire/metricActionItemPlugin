let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
let currentUser;

authManager.getCurrentUser().then((user) => {
  console.log("authManager.currentUser", user);
  currentUser = user;
});

Metrics.getMetrics().then(async (data) => {
  metrics = data.data;
  metrics.id = data.id;

  console.log("laslalss", metrics);
  await Setting.load().then(() => {
    renderInit();
    // pushBreadcrumb("Home", { nodeSelector });
  });
});
buildfire.messaging.onReceivedMessage = (msg) => {
  if (msg.cmd == "refresh")
    /// message comes from the strings page on the control side
    location.reload();
};

let lv = new ListView("listViewContainer", {
  enableAddButton: true,
  Title: "",
});
lv.onAddButtonClicked = () => {
  let item = new ListViewItem({
    title: "Title 1",
    description:
      "Here is my really long description. Here is my really long description. Here is my really long description. ",
    imageUrl: "https://img.icons8.com/officel/2x/worldwide-location.png",
  });

  lv.addItem(item);
};

lv.onItemClicked = (item) => {
  //open and maybe edit
  item.title = "Updated " + new Date().toLocaleTimeString();
  item.update();
};

function renderInit() {
  let currentMetricList = [];
  console.log("metrics widget", metrics);
  for (let metricId in metrics.metrics) {
    metrics.metrics[metricId].id = metricId;
    let newMetric = new Metric(metrics.metrics[metricId]);
    newMetric.getHistoryValue(newMetric);
    currentMetricList.push(newMetric);
  }

  lv.loadListViewItems(currentMetricList);
}
