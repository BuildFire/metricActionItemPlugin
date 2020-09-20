let metrics = {};

Metrics.getMetrics()
  .then((data) => {
    metrics = data;
  })
  .finally(() => {
    Metrics.getHistoryValue(metrics);
  });

let nodeSelector = "metrics";

// Calculates the average of each metric history

function renderMetrics(metrics) {
  for (let metric in metrics) {
    console.log("child", new Metric(metrics[metric]));
    // TODO: call the function that will render metrics (UI)
  }
}
