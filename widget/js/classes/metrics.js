class Metrics {
  constructor() {}

  static getMetrics() {
    return new Promise((resolve, reject) => {
      buildfire.datastore.get("metrics", (err, result) => {
        if (err) reject(err);
        else {
          if (!result || !result.data) {
            result = { data: { metrics: {} } };
          }
          result.data.id = result.id;
          resolve(result.data);
        }
      });
    });
  }

  static updateMetricHistory({ nodeSelector, metricsId }, data) {
    const dateOnly = helpers.getAbsoluteDate();

    return new Promise((resolve, reject) => {
      if (!nodeSelector) return reject("nodeSelector not provided");
      if (!metricsId) return reject("metricsId not provided");
      if (
        nodeSelector.slice(-7) === "metrics" ||
        nodeSelector.slice(-8) === "metrics."
      )
        return reject("nodeSelector is not right");
      buildfire.datastore.searchAndUpdate(
        { [`${nodeSelector}.history.date`]: dateOnly },
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
            buildfire.datastore.update(
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
          let historyDate = history[history.length - index].date;

          // If the saved date was one day ahead of the current date, don't take the current value, take the previous one;
          if (set.keyDate < historyDate) {
            index++;
            set.value = history[history.length - index].value || 0;

            // Check if there is another element in the history
            if (
              history[history.length - index] &&
              history[history.length - index].date
            ) {
              let lastDate = history[history.length - index].date;
              // If the previous value's date === the the current set.keyDate we just used then we need to move on to the next value,
              // other wise we skip
              if (set.keyDate === lastDate) {
                index++;
              }
            } else {
              set.value = history[history.length - index].value
                ? history[history.length - index].value
                : 0;
            }
          } else if (set.keyDate === historyDate) {
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
        return helpers.getLast7Days(true);
      } else if (metric.metrics) {
        // Creates the set to be able to calculate the average in this format:
        let historyDataset = helpers.getLast7Days(true);
        // [{"date":"11/14/2020","value":0},{"date":"11/13/2020","value":0}, .....]
        for (let key in metric.metrics) {
          let metricHistory = Metrics.extractHistoryValues(metric.metrics[key]);

          historyDataset.forEach((day, i) => {
            if (!isNaN(metricHistory[i].value)) {
              if (isNaN(day.value)) day.value = 0;
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
        metric.value = !isNaN(historyDataset[0].value)
          ? parseFloat(historyDataset[0].value.toPrecision(3))
          : 0;
        metric.previousValue = !isNaN(historyDataset[1].value)
          ? parseFloat(historyDataset[1].value.toPrecision(3))
          : 0;

        return historyDataset;
      }
    } return helpers.getLast7Days(true);
  }

  static getHistoryValues(metrics) {
    // Reverse the data to be displayed on the chart
    let historyDataset = Metrics.extractHistoryValues(metrics).reverse();

    // Extract the values only from the history
    let historyData = historyDataset.map((elem) => {
      if (isNaN(elem.value)) return 0;
      return parseFloat(elem.value.toPrecision(3));
    });
    // Format the dates which will appear on the chart
    let historyDays = historyDataset.map((elem) => {
      return `${elem.date.getMonth() + 1}/${elem.date.getDate()}`;
    });

    return {
      historyData,
      historyDays,
    };
  }
}
