// A helper function to extract the date: Format: "year/month/day"
const helpers = {
  uuidv4: (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h)),
  // Return absolute date
  getAbsoluteDate: () => new Date().toISOString(),
  nodeSplitter: (nodeSelector, metrics) => {
    let splittedNode = nodeSelector.split(".");
    if (splittedNode[splittedNode.length - 1] !== "metrics") {
      splittedNode.pop();
      nodeSelector = splittedNode.join(".");
      buildfire.history.pop();
    }
    let metricsChildren = metrics;
    let metricsParent = null;
    let metricsSortBy = "";

    try {
      splittedNode.forEach((item, i) => {
        // If we are at the home page (top of the object)
        if (nodeSelector === "metrics") {
          metricsParent = metrics;
          metricsSortBy = metrics.sortBy;
        }
        // Assign the parent metric sortBy value (If we are in parent metric);
        if (nodeSelector !== "metrics" && i === splittedNode.length - 2) {
          metricsParent = metricsChildren[item];
          metricsSortBy = metricsChildren[item].sortBy;
        }

        metricsChildren = metricsChildren[item];
      });
    } catch (err) {
      snackbarMessages.noNote.open();

      setTimeout(() => {
        buildfire.navigation._goBackOne();
      }, 2000);
    }

    return { metricsChildren, metricsSortBy, metricsParent };
  },
  sortMetrics: (currentMetricList, sortBy) => {
    // Sort metrics based sortBy value
    if (sortBy === "highest") {
      currentMetricList.sort((a, b) => b.value - a.value);
    } else if (sortBy === "lowest") {
      currentMetricList.sort((a, b) => a.value - b.value);
    } else {
      currentMetricList.sort((a, b) => a.order - b.order);
    }
    return currentMetricList;
  },
  // getLast7Days: () => {
  //   let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  //   let result = [];
  //   let date = new Date();
  //   result.push(`${date.getMonth()}-${date.getDate()}`);

  //   for (let i = 1; i <= 6; i++) {
  //     let copiedDate = new Date(date);
  //     copiedDate.setDate(date.getDate() - i);
  //     result.push(`${copiedDate.getMonth()}/${copiedDate.getDate()}`);
  //   }
  //   return result.reverse();
  // },

  hideElem: (selector) => {
    let elements = document.querySelectorAll(selector);
    elements.forEach((elem) => {
      elem.style.display = "none";
    });
  },
  showElem: (selector, displayType = null) => {
    let elements = document.querySelectorAll(selector);
    elements.forEach((elem) => {
      elem.style.display = displayType || "block";
    });
  },
  getElem: (selector) => {
    return document.querySelector(selector);
  },
  // Filter Metrics based on the provided customer
  filterCustomerMetrics: (metrics, clientProfile) => {
    return new Promise((resolve, reject) => {
      // Get client history data;
      Histories.getHistories(clientProfile).then((result) => {
        histories = result;
        // Add the history data to each metric
        helpers.addHistoryToMetrics(metrics, histories);

        resolve(metrics.metrics);
      });
    });
  },
  // Loop recursively on the metrics object and add the history value from histories object
  addHistoryToMetrics: (metrics, histories) => {
    if (Object.keys(metrics.metrics).length > 0) {
      for (var key in metrics.metrics) {
        if (
          histories.metrics[key] &&
          metrics.metrics[key].type === "parent" &&
          Object.keys(metrics.metrics[key].metrics).length > 0
        ) {
          helpers.addHistoryToMetrics(
            metrics.metrics[key],
            histories.metrics[key]
          );
        } else {
          if (histories.metrics[key] && histories.metrics[key].history) {
            metrics.metrics[key].history = histories.metrics[key].history;
          } else {
            metrics.metrics[key].history = [];
          }
        }
      }
    }
  },

  getLast7Days: () => {
    let result = [];
    let date = new Date();
    result.push({ date: date.toLocaleDateString(), value: 0 });

    for (let i = 1; i <= 6; i++) {
      let copiedDate = new Date(date);
      copiedDate.setDate(date.getDate() - i);
      result.push({
        date: copiedDate.toLocaleDateString(),
        value: 0,
      });
    }
    return result;
  },
};
