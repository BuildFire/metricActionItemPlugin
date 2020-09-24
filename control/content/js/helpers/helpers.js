// A helper function to extract the date: Format: "year/month/day"
const helpers = {
  uuidv4: (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h)),
  // Return absolute date
  getAbsoluteDate: () => new Date(new Date().setHours(0, 0, 0, 0)),
  nodeSplitter: (nodeSelector, metrics) => {
    let splittedNode = nodeSelector.split(".");

    let metricsChildren = metrics;
    splittedNode.forEach((item) => {
      metricsChildren = metricsChildren[item];
    });
    return metricsChildren;
  },
};
