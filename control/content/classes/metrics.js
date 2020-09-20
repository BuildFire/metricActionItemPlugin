class Metrics {
  constructor() {}

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
                  await this.getMetrics().then((data) => {
                    resolve(data);
                  });
                }
              }
            );
          } else {
            console.log("All Data", data);

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
  static save(metric, currentNode) {
    metric.id = helpers.uuidv4();
    metric.createdOn = new Date();
    metric.lastUpdatedOn = new Date();

    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        metrics.id,
        { $set: { [`${currentNode}.${metric.id}`]: metric } },
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
        metrics.id,
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
  static delete(id, currentNode) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        metrics.id,
        {
          $unset: {
            [`${currentNode}.${id}`]: "",
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
              metrics.id,
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
          // Track action
          Analytics.trackAction(`METRIC_${metricId}_HISTORY_UPDATE`);
          // Update the metrics object
          this.getMetrics();
          resolve(data);
        }
      );
    });
  }

  // TODO: implement order function for metrics
  static order(metrics) {}
}

const metric1 = new Metric({
  title: "ana",
  icon: "here",
  min: 9,
  max: 2,
  action_item: {},
  type: "metric",
  history: [
    {
      value: 50,
      date: helpers.getAbsoluteDate(),
      createdOn: null,
      createmetric2dBy: null,
      lastUpdatedOn: null,
      lastUpdatedBy: null,
    },
  ],
});

let metric123 = new Metric({
  id: "5f677e73daf1138b9b627dbf",
  actionItem: {},
  createdBy: "currentUser.username",
  createdOn: new Date(),
  history: [
    {
      date: helpers.getAbsoluteDate(),
      value: 78,
      createdOn: new Date(),
      createdBy: "currentUser.username",
      lastUpdatedOn: new Date(),
      lastUpdatedBy: "currentUser.username",
    },
  ],
  icon: "metric1",
  lastUpdatedBy: "currentUser.username",
  lastUpdatedOn: new Date(),
  max: 96,
  min: 15,
  order: null,
  title: "metric",
  type: "metric",
  value: 56,
});

// var test = Metrics.getMetrics().then((data) => {
//   console.log("No No no", data.data.metrics);
// });

// Metrics.getMetrics().then((data) => {
//   Metrics.save(metric123, "metrics.5f635a3b62f0aff6f82856d0.metrics").then(
//     (result) => {
//       Metrics.getMetrics().then((data) => {
//         console.log("No No no", data);
//       });
//     }
//   );
// });
