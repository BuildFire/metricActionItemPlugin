class Histories {
  constructor() {}

  // Get the big Object (history object)
  static getHistories(clientProfile) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.get(
        `history${clientProfile || ""}`,
        (err, result) => {
          if (err) reject(err);
          else {
            // Check if there is already objects in the database
            if (!result.data.metrics) {
              // If there is no object, then create the parent object
              buildfire.publicData.save(
                { metrics: {} },
                `history${clientProfile || ""}`,
                (err, result) => {
                  if (err) reject(err);
                  else {
                    this.getHistories().then((result) => {
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
        }
      );
    });
  }

  static updateMetricHistory({ clientProfile, nodeSelector, historyId }, data) {
    const absoluteDate = helpers.getAbsoluteDate();
    const dateOnly = helpers.getAbsoluteDate().slice(0, 10);

    return new Promise((resolve, reject) => {
      if (!nodeSelector) return reject("nodeSelector not provided");
      if (!historyId) return reject("historyId not provided");
      if (
        nodeSelector.slice(-7) === "metrics" ||
        nodeSelector.slice(-8) === "metrics."
      ) {
        return reject("nodeSelector is not right");
      }

      buildfire.publicData.searchAndUpdate(
        { [`${nodeSelector}.history.date`]: { $regex: `.*${dateOnly}.*` } },
        {
          $set: {
            [`${nodeSelector}.history.$.value`]: data.value,
            [`${nodeSelector}.history.$.lastUpdatedOn`]: new Date(),
            [`${nodeSelector}.history.$.lastUpdatedBy`]: data.username,
          },
        },
        `history${clientProfile || ""}`,
        (err, res) => {
          if (err) reject(err);
          if (res.nModified === 0) {
            buildfire.publicData.update(
              historyId,
              {
                $push: {
                  [`${nodeSelector}.history`]: {
                    date: absoluteDate,
                    createdOn: new Date(),
                    createdBy: data.username,
                    lastUpdatedOn: new Date(),
                    lastUpdatedBy: data.username,
                    value: data.value,
                  },
                },
              },
              `history${clientProfile || ""}`,
              (err, result) => {
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

          Metrics.getMetrics().then((result) => {
            resolve(result);
          });
        }
      );
    });
  }
}
