class MetricsDAO {
  constructor() {}

  static metrics = {};
  static currentNode = "metrics";

  static setCurrentNode(node) {
    this.currentNode = node;
  }
  static getCurrentNode() {
    return currentNode;
  }

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
              async (err, result) => {
                if (err) reject(err);
                else {
                  await this.getMetrics();
                  resolve(result);
                }
              }
            );
          } else {
            this.metrics = data;
            console.log("All Data", data);
            // Calculates the average of each metric history
            this.getHistoryValue(this.metrics.data);
            resolve(data);
          }
        }
      });
    });
  }

  // A recurcive function that calculates the average of each metric history
  static getHistoryValue(metric) {
    if (metric.type === "metric") {
      let val = metric.history[metric.history.length - 1].value;
      metric.value = val;
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

  // Control Panel Only
  static save(metric) {
    metric.createdOn = new Date();
    metric.lastUpdatedOn = new Date();

    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        this.metrics.id,
        { $set: { [`${this.currentNode}.${metric.id}`]: metric } },
        "metrics",
        async (err, data) => {
          if (err) reject(err);
          else {
            await this.getMetrics();
            Analytics.registerEvent(
              metric.title,
              `METRIC_${metric.id}_HISTORY_UPDATE`,
              "Number of times the metric history updated"
            );
            resolve(data);
          }
        }
      );
    });
  }

  // Control Panel Only
  static update(updateObject) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        this.metrics.id,
        { $set: updateObject },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else {
            this.getMetrics();
            resolve(data);
          }
        }
      );
    });
  }

  // Control Panel Only
  static delete(id) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        this.metrics.id,
        {
          $unset: {
            [`${this.currentNode}.${id}`]: "",
          },
        },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else {
            this.getMetrics();
            resolve(data);
          }
        }
      );
    });
  }

  // Control Panel and Widget
  // This will add/update metric history
  // TODO: Check if this is required
  static updateMetricHistory(value, metricId) {
    const absoluteDate = helpers.getAbsoluteDate();

    return new Promise((resolve, reject) => {
      buildfire.publicData.searchAndUpdate(
        { [`${this.currentNode}.history.date`]: absoluteDate },
        {
          $set: {
            [`${this.currentNode}.history.$.value`]: value,
            [`${this.currentNode}.history.$.lastUpdatedOn`]: new Date(),
            [`${this.currentNode}.history.$.lastUpdatedBy`]: "currentUser.username",
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
                  [`${this.currentNode}.history`]: {
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
          // TODO: Check if this is required
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

const metric = new Metric({
  title: "ana",
  icon: "amjad",
  min: 9,
  max: 2,
  value: 6,
  action_item: {},
  type: "metric",
  history: [
    {
      value: 50,
      date: helpers.getAbsoluteDate(),
      createdOn: null,
      createdBy: null,
      lastUpdatedOn: null,
      lastUpdatedBy: null,
    },
  ],
});

// MetricsDAO.getMetrics().then((data) => {
// newMetric.update(metric, "value").then(() => {
//   newMetric.getMetrics().then((data) => {
//     console.log("ALL DATA after Delete", data);
//   });
// });

// MetricsDAO.save(metric).then((data2) => {
//   console.log("saved DATA", data2);
// });
//   console.log("ALL DATA", data);
// });

// MetricsDAO.addMetricHistory("metrics.5f5fbaca70805ba300168eb3.history", 88)
//   .then((data) => {
//     console.log("addMetricHistory DATA", data);
//   })
//   .catch((err) => {
//     console.log("addMetricHistory ERROR", err);
//   });
