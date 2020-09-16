class Analytics {
  constructor() {}
  // Track an action based on the key
  static trackAction(key, data = {}) {
    buildfire.analytics.trackAction(key, data);
  }
}
