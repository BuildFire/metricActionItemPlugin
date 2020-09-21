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

  // Control Panel and Widget
  // This will add/update metric history
  // TODO: Check if this is required
  static updateMetricHistory({ nodeSelector, metricsId }, value) {
    const absoluteDate = helpers.getAbsoluteDate();

    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!metricsId) reject("metricsId not provided");

      buildfire.publicData.searchAndUpdate(
        { [`${nodeSelector}.history.date`]: absoluteDate },
        {
          $set: {
            [`${nodeSelector}.history.$.value`]: value,
            [`${nodeSelector}.history.$.lastUpdatedOn`]: new Date(),
            [`${nodeSelector}.history.$.lastUpdatedBy`]: "currentUser.username",
          },
        },
        "metrics",
        (err, data) => {
          if (err) reject(err);

          if (data.nModified === 0) {
            buildfire.publicData.update(
              metricsId,
              {
                $push: {
                  [`${nodeSelector}.history`]: {
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
                else resolve(data);
              }
            );
          }
          // Extract metric id from nodeSelector
          let updatedMetricId = nodeSelector.split(".");
          updatedMetricId = updatedMetricId[updatedMetricId.length - 1];
          // Track action
          Analytics.trackAction(`METRIC_${updatedMetricId}_HISTORY_UPDATE`);
          resolve(data);
        }
      );
    });
  }
}
