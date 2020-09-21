class Metrics {
  constructor() {}

  static getMetrics() {
    return new Promise((resolve, reject) => {
      buildfire.publicData.get("metrics", async (err, data) => {
        if (err) reject(err);
        else {
          // Check if there is already objects in the database
          if (!data.data.metrics) {
            // If there is no object, then create the parent object
            await buildfire.publicData.save(
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

  // Control Panel Only
  static insert({ nodeSelector, metricsId }, metric) {
    metric.id = helpers.uuidv4();
    metric.createdOn = new Date();
    metric.lastUpdatedOn = new Date();

    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!metricsId) reject("metricsId not provided");

      buildfire.publicData.update(
        metricsId,
        { $set: { [`${nodeSelector}.${metric.id}`]: metric } },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else {
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
  static update({ nodeSelector, metricsId }, data, id) {
    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!metricsId) reject("metricsId not provided");

      let _set = {};
      for (let key in data) {
        _set[`${nodeSelector}.${id}.${key}`] = data[key];
      }

      buildfire.publicData.update(
        metricsId,
        { $set: _set },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else {
            resolve(data);
          }
        }
      );
    });
  }

  // Control Panel Only
  static delete({ nodeSelector, metricsId }, id) {
    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!metricsId) reject("metricsId not provided");

      buildfire.publicData.update(
        metricsId,
        {
          $unset: {
            [`${nodeSelector}.${id}`]: "",
          },
        },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else {
            resolve(data);
          }
        }
      );
    });
  }
  // TODO: implement order function for metrics
  static order(metrics) {}
}
