class Metrics {
  constructor() {}

  static getMetrics() {
    return new Promise((resolve, reject) => {
      buildfire.publicData.get("metrics", async (err, result) => {
        if (err) reject(err);
        else {
          // Check if there is already objects in the database
          if (!result.data.metrics) {
            // If there is no object, then create the parent object
            await buildfire.publicData.save(
              { metrics: {}, sortBy: "manual" },
              "metrics",
              async (err, result) => {
                if (err) reject(err);
                else {
                  await this.getMetrics().then((result) => {
                    resolve(result);
                  });
                }
              }
            );
          } else {
            result.data.id = result.id;
            resolve(result.data);
          }
        }
      });
    });
  }

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
        async (err, data) => {
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
              async (err, result) => {
                if (err) reject(err);
                else {
                  result.data.id = result.id;
                  resolve(result.data);
                }
              }
            );
          }
          // Extract metric id from nodeSelector
          let updatedMetricId = nodeSelector.split(".");
          updatedMetricId = updatedMetricId[updatedMetricId.length - 1];
          // Track action
          Analytics.trackAction(`METRIC_${updatedMetricId}_HISTORY_UPDATE`);

          await Metrics.getMetrics().then((result) => {
            resolve(result);
          });
        }
      );
    });
  }
}
