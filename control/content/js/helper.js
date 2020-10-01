// A helper function to extract the date: Format: "year/month/day"
const helpers = {
  uuidv4: (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h)),
  // Return absolute date
  getAbsoluteDate: () => new Date(new Date().setHours(0, 0, 0, 0)),
  nodeSplitter: (nodeSelector, metrics) => {
    let splittedNode = nodeSelector.split(".");
    let metricsChildren = metrics;

    splittedNode.forEach((item, i) => {
      // If we are at the home page (top of the object)
      if (nodeSelector === "metrics") {
        metricsSortBy = metrics.sortBy;
        document.getElementById("sortBy").value = metricsSortBy;
      }
      // Assign the parent metric sortBy value (If we are in parent metric);
      if (nodeSelector !== "metrics" && i === splittedNode.length - 2) {
        metricsSortBy = metricsChildren[item].sortBy;
        document.getElementById("sortBy").value = metricsSortBy;
      }

      metricsChildren = metricsChildren[item];
    });

    return metricsChildren;
  },
  inputAlert: (message) => {
    buildfire.notifications.alert({ message });
  },
};
