class Metric {
  constructor(data = {}) {
    this.id = data.id || "";
    this.title = data.title || "";
    this.icon = data.icon || "";
    this.min = data.min || 0;
    this.max = data.max || 0;
    this.actionItem = data.actionItem || {};
    this.type = data.type || "";
    this.order = data.order || null;
    // this.value = data.value || null;
    this.metrics = data.metrics || {};
    this.history = data.history || [];
    this.createdOn = data.createdOn || null;
    this.createdBy = data.createdBy || null;
    this.lastUpdatedOn = data.lastUpdatedOn || null;
    this.lastUpdatedBy = data.lastUpdatedBy || null;
  }
  // A recurcive function that calculates the average of each metric history
  static getHistoryValue(metric) {
    if (metric.type === "metric") {
      let val = metric.history[metric.history.length - 1]
        ? metric.history[metric.history.length - 1].value
        : 0;
      // Get metric Previous value
      let previousVal = metric.history[metric.history.length - 2]
        ? metric.history[metric.history.length - 2].value
        : 0;
      // TODO: check if we can delete value from Metric class if not needed
      metric.value = val;
      metric.previousVal = previousVal;
      return val;
    } else if (metric.type === "parent" || !metric.type) {
      if (metric.metrics) {
        let sum = 0;
        for (let key in metric.metrics) {
          sum += this.getHistoryValue(metric.metrics[key]);
        }
        let avg = sum / Object.keys(metric.metrics).length;
        metric.value = avg;
        return avg;
      }
    }
  }
}

// static getHistoryValue(metric) {
//   if (metric.type === "metric") {
//     let val = metric.history[metric.history.length - 1]
//       ? metric.history[metric.history.length - 1].value
//       : 0;
//     metric.value = val;
//     return val;
//   } else if (metric.type === "parent" || !metric.type) {
//     // if (Object.keys(metric.metrics).length === 0) return 0;
//     if (metric.metrics) {
//       let sum = 0;
//       for (let key in metric.metrics) {
//         sum += this.getHistoryValue(metric.metrics[key]);
//       }
//       let avg = sum / Object.keys(metric.metrics).length;
//       metric.value = avg;
//       return avg;
//     }
//   }
// }
