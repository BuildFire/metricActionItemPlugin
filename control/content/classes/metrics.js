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
                    metrics = data;
                    resolve(data);
                  });
                }
              }
            );
          } else {
            metrics = data;
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
  static insert(metric, currentNode) {
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
  static update(options, data) {
    let _set = {};
    for (let key in data) {
      _set[`${options.nodeSelector}.${options.metricId}.${key}`] = data[key];
    }

    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        metrics.id,
        { $set: _set },
        "metrics",
        async (err, data) => {
          if (err) reject(err);
          else {
            await this.getMetrics();
            resolve(data);
          }
        }
      );
    });
  }

  // Control Panel Only
  static delete(options, id) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        metrics.id,
        {
          $unset: {
            [`${options.nodeSelector}.${id}`]: "",
          },
        },
        "metrics",
        async (err, data) => {
          if (err) reject(err);
          else {
            await this.getMetrics();
            resolve(data);
          }
        }
      );
    });
  }
  // Control Panel and Widget
  // This will add/update metric history
  // TODO: Check if this is required
  static updateMetricHistory(options, value) {
    const absoluteDate = helpers.getAbsoluteDate();

    return new Promise((resolve, reject) => {
      buildfire.publicData.searchAndUpdate(
        { [`${options.nodeSelector}.history.date`]: absoluteDate },
        {
          $set: {
            [`${options.nodeSelector}.history.$.value`]: value,
            [`${options.nodeSelector}.history.$.lastUpdatedOn`]: new Date(),
            [`${options.nodeSelector}.history.$.lastUpdatedBy`]: "currentUser.username",
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
                  [`${options.nodeSelector}.history`]: {
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
              async (err, data) => {
                if (err) reject(err);
                else await this.getMetrics();
              }
            );
          }
          // Extract metric id from options.nodeSelector
          let metricId = options.nodeSelector.split(".");
          metricId = metricId[metricId.length - 1];
          // Track action
          Analytics.trackAction(`METRIC_${metricId}_HISTORY_UPDATE`);
          resolve(data);
        }
      );
    });
  }

  // TODO: implement order function for metrics
  static order(metrics) {}
}
