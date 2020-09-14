class MetricsDAO {
  constructor() {
    this.metrics = {};
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
            resolve(data);
          }
        }
      });
    });
  }

  static save(metric) {
    metric.createdOn = new Date();
    metric.lastUpdatedOn = new Date();

    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        this.metrics.id,
        { $set: { [`${metric.pointer}.${metric.id}`]: metric } },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });
  }

  static update(updateObject) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        this.metrics.id,
        { $set: updateObject },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });
  }

  static delete(metric) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        this.metrics.id,
        {
          $unset: {
            [`${metric.pointer}.${metric.id}`]: "",
          },
        },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });
  }

  // This will add/update metric history
  static updateMetricHistory(pointer, value) {
    const absoluteDate = helpers.getAbsoluteDate();

    return new Promise((resolve, reject) => {
      buildfire.publicData.searchAndUpdate(
        { [`${pointer}.date`]: absoluteDate },
        {
          $set: {
            [`${pointer}.$.value`]: value,
            [`${pointer}.$.lastUpdatedOn`]: new Date(),
            [`${pointer}.$.lastUpdatedBy`]: "currentUser.username",
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
                  [pointer]: {
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
          resolve(data);
        }
      );
    });
  }
}

const metric = new Metric({
  title: "ana",
  icon: "amjad",
  pointer:
    "metrics.5f5fcc05251adf03a5d96a3e.metrics.5f5fd61dfe04456dd93f4073.metrics",
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

MetricsDAO.getMetrics().then((data) => {
  // newMetric.update(metric, "value").then(() => {
  //   newMetric.getMetrics().then((data) => {
  //     console.log("ALL DATA after Delete", data);
  //   });
  // });

  // MetricsDAO.save(metric).then((data2) => {
  //   console.log("saved DATA", data2);
  // });
  rep(data.data);
  console.log("ALL DATA", data);
});

// MetricsDAO.addMetricHistory("metrics.5f5fbaca70805ba300168eb3.history", 88)
//   .then((data) => {
//     console.log("addMetricHistory DATA", data);
//   })
//   .catch((err) => {
//     console.log("addMetricHistory ERROR", err);
//   });

// function del() {
//   return new Promise((resolve, reject) => {
//     buildfire.publicData.delete(
//       "5f5faecc72fd48066a251b99",
//       "metrics",
//       (err, data) => {
//         if (err) reject(err);
//         else resolve(data);
//       }
//     );
//   });
// }
// del().then(() => {
//   MetricsDAO.getMetrics().then((data) => {
//     console.log("ALL DATA", data);
//   });
// });