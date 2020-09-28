class Metrics {
  constructor() {}

  // Get the big Object (metrics object)
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

  // Add new metrics in the big object (Control Panel Only)
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
        (err, result) => {
          console.log("every data", result);
          if (err) reject(err);
          else {
            Analytics.registerEvent(
              metric.title,
              `METRIC_${metric.id}_HISTORY_UPDATE`,
              "Number of times the metric history updated"
            );
            result.data.id = metricsId;
            resolve(result);
          }
        }
      );
    });
  }

  // To update any metric properties but not historys' values (Control Panel Only)
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
        (err, result) => {
          if (err) reject(err);
          else {
            result.data.id = metricsId;
            resolve(result);
          }
        }
      );
    });
  }

  // To delete any metrics (Control Panel Only)
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
        (err, result) => {
          if (err) reject(err);
          else {
            result.data.id = metricsId;
            resolve(result);
          }
        }
      );
    });
  }

  // For testing only (It should be just in the widget's code)
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
                    date: absoluteDate,
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

  static order({ nodeSelector, metricsId }, orderObj) {
    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!metricsId) reject("metricsId not provided");

      let _set = {};
      for (let id in orderObj) {
        _set[`${nodeSelector}.${id}.order`] = orderObj[id];
      }

      buildfire.publicData.update(
        metricsId,
        { $set: _set },
        "metrics",
        (err, result) => {
          if (err) reject(err);
          else {
            result.data.id = metricsId;
            resolve(result);
          }
        }
      );
    });
  }
}
