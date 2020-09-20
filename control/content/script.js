let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";

Metrics.getMetrics().then(() => {
  Metrics.getHistoryValue(metrics);
});

const renderMetrics = (metrics) => {
  for (let metric in metrics) {
    console.log("child", new Metric(metrics[metric]));
    // TODO: call the function that will render metrics (UI)
  }
};