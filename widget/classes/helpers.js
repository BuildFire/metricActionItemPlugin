class Helper {
  static get EVENTS() {
    return {
      METRIC_CRETAED: "METRIC_CRETAED",
      METRIC_UPDATED: "METRIC_UPDATED",
      METRIC_DELETED: "METRIC_DELETED",
    };
  }

  static trackAction(key, aggregationValue) {
    let metData = {};
    if (aggregationValue) {
      metData._buildfire = { aggregationValue };
    }
    buildfire.analytics.trackAction(key, metData);
  }

  static uuidv4() {
    return (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
      s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h));
  }
}
