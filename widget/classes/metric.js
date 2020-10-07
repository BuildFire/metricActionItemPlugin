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
    this.metrics = data.metrics || {};
    this.value = data.value || 0;
    this.previousValue = data.previousValue || 0;

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
      let previousValue = metric.history[metric.history.length - 2]
        ? metric.history[metric.history.length - 2].value
        : 0;

      metric.value = val;

      metric.previousValue = previousValue;

      return { val, previousValue };
    } else if (metric.type === "parent" || !metric.type) {
      if (Object.keys(metric.metrics).length === 0) {
        metric.value = 0;
        return 0;
      }
      if (metric.metrics) {
        let sum = 0;
        let prevSum = 0;
        for (let key in metric.metrics) {
          sum += this.getHistoryValue(metric.metrics[key]).val;
          prevSum += this.getHistoryValue(metric.metrics[key]).previousValue;
        }
        let avg = sum / Object.keys(metric.metrics).length;
        let avgPrev = prevSum / Object.keys(metric.metrics).length;

        metric.value = parseFloat(avg.toPrecision(3));
        metric.previousValue = parseFloat(avgPrev.toPrecision(3));

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
