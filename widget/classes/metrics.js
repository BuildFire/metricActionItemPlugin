class MetricsDAO {
  constructor() {}

  static metric = {};

  static getMetrics() {
    return new Promise((resolve, reject) => {
      buildfire.publicData.get("metrics", (err, data) => {
        if (err) reject(err);
        else {
          // Check if there is already objects in the database
          if (!data.data.metrics) {
            // If there is no object, then create the parent object
            buildfire.publicData.save(
              { metrics: {} },
              "metrics",
              (err, result) => {
                if (err) reject(err);
                else {
                  MetricsDAO.getMetrics();
                  resolve(result);
                }
              }
            );
          } else {
            this.metrics = data;
            console.log("All Data", data);
            // Calculates the average of each metric history
            MetricsDAO.getHistoryValue(this.metrics);
            resolve(data);
          }
        }
      });
    });
  }

  // A recurcive function that calculates the average of each metric history
  static getHistoryValue() {
    if (this.metrics.type === "metric") {
      let val = this.metrics.history[this.metrics.history.length - 1].value;
      this.metrics.value = val;
      return val;
    } else if (this.metrics.type === "parent" || !this.metrics.type) {
      if (this.metrics.metrics) {
        let sum = 0;
        for (let key in this.metrics.metrics) {
          sum += MetricsDAO.getHistoryValue(this.metrics.metrics[key]);
        }
        let avg = sum / Object.keys(this.metrics.metrics).length;
        this.metrics.value = avg;
        return avg;
      }
    }
  }

  // Control Panel and Widget
  // This will add/update metric history
  static updateMetricHistory(value, currentNode) {
    const absoluteDate = helpers.getAbsoluteDate();

    return new Promise((resolve, reject) => {
      buildfire.publicData.searchAndUpdate(
        { [`${currentNode}.history.date`]: absoluteDate },
        {
          $set: {
            [`${currentNode}.history.$.value`]: value,
            [`${currentNode}.history.$.lastUpdatedOn`]: new Date(),
            [`${currentNode}.history.$.lastUpdatedBy`]: "currentUser.username",
          },
        },
        "metrics",
        (err, data) => {
          if (err) reject(err);

          if (data.nModified === 0) {
            buildfire.publicData.update(
              this.metrics.id,
              {
                $push: {
                  [`${currentNode}.history`]: {
                    date: helpers.getAbsoluteDate(),
                    createdOn: new Date(),
                    createdBy: "currentUser.username",
                    lastUpdatedOn: new Date(),
                    lastUpdatedBy: "currentUser.username",
                    value,
                  },
                },
              },
              "metrics",
              (err, data) => {
                if (err) reject(err);
              }
            );
          }
          // Extract metric id from currentNode
          let metricId = currentNode.split(".");
          metricId = metricId[metricId.length - 1];
          // Track Action
          Analytics.trackAction(`METRIC_${metricId}_HISTORY_UPDATE`);
          // Update the metrics object
          this.getMetrics();
          resolve(data);
        }
      );
    });
  }
}
