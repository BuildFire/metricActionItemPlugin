class Metric {
  constructor(data = {}) {
    this.id = data.id || helpers.uuidv4();
    this.title = data.title || "";
    this.icon = data.icon || "";
    this.min = data.min || 0;
    this.max = data.max || 0;
    this.actionItem = data.actionItem || {};
    this.type = data.type || "";
    this.order = data.order === 0 ? 0 : data.order || null;
    this.metrics = data.metrics || {};
    this.history = data.history || [];
    this.sortBy = this.sortBy || "manual";
    this.description = data.description || "";
    this.createdOn = data.createdOn || null;
    this.createdBy = data.createdBy || null;
    this.lastUpdatedOn = data.lastUpdatedOn || null;
    this.lastUpdatedBy = data.lastUpdatedBy || null;
  }

  static getHistoryValue(metric) {
    if (metric.type === "metric") {
      let val = metric.history[metric.history.length - 1]
        ? metric.history[metric.history.length - 1].value
        : 0;
      metric.value = val;
      return val;
    } else if (
      metric.type === "parent" ||
      !metric.type /*That is mean it is the master object */
    ) {
      if (metric.metrics && Object.keys(metric.metrics).length === 0) {
        metric.value = 0;
        return 0;
      }
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
    // TODO: check if it affect the avg claculations
    return 0;
  }
}
