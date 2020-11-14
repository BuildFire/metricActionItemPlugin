class Metrics {
  constructor() {}

  static getMetrics() {
    return new Promise((resolve, reject) => {
      buildfire.publicData.get("metrics", (err, result) => {
        if (err) reject(err);
        else {
          // Check if there is already objects in the database
          if (!result.data.metrics) {
            // If there is no object, then create the parent object
            buildfire.publicData.save(
              { metrics: {}, sortBy: "manual" },
              "metrics",
              (err, result) => {
                if (err) reject(err);
                else {
                  this.getMetrics().then((result) => {
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

  static updateMetricHistory({ nodeSelector, metricsId }, data) {
    const absoluteDate = helpers.getAbsoluteDate();
    const dateOnly = helpers.getAbsoluteDate().slice(0, 10);

    return new Promise((resolve, reject) => {
      if (!nodeSelector) return reject("nodeSelector not provided");
      if (!metricsId) return reject("metricsId not provided");
      if (
        nodeSelector.slice(-7) === "metrics" ||
        nodeSelector.slice(-8) === "metrics."
      )
        return reject("nodeSelector is not right");
      buildfire.publicData.searchAndUpdate(
        { [`${nodeSelector}.history.date`]: { $regex: `.*${dateOnly}.*` } },
        {
          $set: {
            [`${nodeSelector}.history.$.value`]: data.value,
            [`${nodeSelector}.history.$.lastUpdatedOn`]: new Date(),
            [`${nodeSelector}.history.$.lastUpdatedBy`]: data.username,
          },
        },
        "metrics",
        (err, res) => {
          if (err) reject(err);
          if (res.nModified === 0) {
            buildfire.publicData.update(
              metricsId,
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
              "metrics",
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

  // static getHistoryValue(metric, inde) {
  //   if (metric.type === "metric") {
  //     let todayDate = new Date();
  //     for (var i = 1; i <= 7; i++) {
  //       if (metric.history[metric.history.length - i]) {
  //         let metricHistoryDate = new Date(
  //           metric.history[metric.history.length - i].date
  //         );
  //         const diffTime = Math.abs(todayDate - metricHistoryDate);
  //         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //         if (diffDays >= inde) {
  //           let val = metric.history[metric.history.length - i].value;
  //           if (inde === 1) {
  //             metric.value = val || 0;
  //           } else if (inde === 2) {
  //             metric.previousValue = val || 0;
  //           }
  //           return val;
  //         }
  //       }
  //     }
  //     return "No value";
  //   } else if (metric.type === "parent" || !metric.type) {
  //     if (metric.metrics && Object.keys(metric.metrics).length === 0) {
  //       return "No value";
  //     }
  //     if (metric.metrics) {
  //       let sum = 0;
  //       let numberChildren = 0;
  //       for (let key in metric.metrics) {
  //         let result = Metrics.getHistoryValue(metric.metrics[key], inde);
  //         if (!isNaN(result)) {
  //           numberChildren++;
  //           sum += Metrics.getHistoryValue(metric.metrics[key], inde);
  //         }
  //       }
  //       let avg = sum / numberChildren;
  //       if (inde === 1) {
  //         metric.value = parseFloat(avg.toPrecision(3)) || 0;
  //       } else if (inde === 2) {
  //         metric.previousValue = parseFloat(avg.toPrecision(3)) || 0;
  //       }
  //       return avg;
  //     }
  //     return 0;
  //   }
  // }

  static extractHistoryValues(metric) {
    if (metric.type === "metric") {
      // Get the metric history array
      let history = metric.history;

      // Creates the set to be able to calculate the average in this format:
      // [{"date":"11/14/2020","value":0},{"date":"11/13/2020","value":0}, .....]
      let dataset = helpers.getLast7Days();

      // To track which value from the history to take;
      let index = 1;

      // Loop throw the set created above
      dataset.forEach((set) => {
        if (!history[history.length - index]) {
          // This means that this has no value change at this date
          set.value = "No value";
        } else {
          // Convert the ISO date from the coming from the database to local date
          let historyDate = new Date(
            history[history.length - index].date
          ).toLocaleDateString();

          // TODO: make sure this if condetion is needed;
          // If the saved date was one day ahead of the current date, don't take the current value, take the previous one;
          if (set.date < historyDate) {
            set.value = history[history.length - index - 1].value || 0;
            index++;
          } else if (set.date === historyDate) {
            set.value = history[history.length - index].value || 0;
            index++;
          } else {
            set.value = history[history.length - index].value
              ? history[history.length - index].value
              : 0;
          }
        }
      });
      // Assign current and previous average for the child metric
      metric.value =
        dataset[0] && !isNaN(dataset[0].value) ? dataset[0].value : 0;
      metric.previousValue =
        dataset[1] && !isNaN(dataset[1].value) ? dataset[1].value : 0;

      return dataset;
    } else if (metric.type === "parent" || !metric.type) {
      if (metric.metrics && Object.keys(metric.metrics).length === 0) {
        return "No value";
      } else if (metric.metrics) {
        // Creates the set to be able to calculate the average in this format:
        // [{"date":"11/14/2020","value":0},{"date":"11/13/2020","value":0}, .....]
        let historyDataset = helpers.getLast7Days();
        for (let key in metric.metrics) {
          let metricHistory = Metrics.extractHistoryValues(metric.metrics[key]);
          historyDataset.forEach((day, i) => {
            if (!isNaN(metricHistory[i].value)) {
              day.value += metricHistory[i].value;

              // Add-increase the value of children which have values (type number) to calculate the average
              // based on the sum of the calculated children
              if (!day.increased) {
                day.increased = 1;
              } else day.increased++;
            }
          });
        }
        // Calculate the average
        historyDataset.forEach((input) => {
          if (input.increased) {
            input.value = input.value / input.increased;
          }
        });
        // Assign current and previous average for the parent metric
        metric.value = parseFloat(historyDataset[0].value.toPrecision(3)) || 0;
        metric.previousValue =
          parseFloat(historyDataset[1].value.toPrecision(3)) || 0;

        return historyDataset;
      }
    }
  }

  static getHistoryValues(metrics) {
    // Reverse the data to be displayed on the chart
    const historyDataset = Metrics.extractHistoryValues(metrics).reverse();

    // Extract the values only from the history
    let historyData = historyDataset.map((elem) =>
      parseFloat(elem.value.toPrecision(3))
    );
    // Format the dates which will appear on the chart
    let historyDays = historyDataset.map((elem) => {
      let date = elem.date.split("/");
      date.pop();
      return date.join("/");
    });

    return {
      historyData,
      historyDays,
    };
  }
}
