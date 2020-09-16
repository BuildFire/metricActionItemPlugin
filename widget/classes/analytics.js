class Analytics {
  // Register plugin events for analytics
  static registerEvent(title, key, description, silentNotification = true) {
    buildfire.analytics.registerEvent(
      {
        title: title,
        key: key,
        description: description,
      },
      { silentNotification }
    );
  }

  // Track an action based on the key
  static trackAction(key, data = {}) {
    buildfire.analytics.trackAction(key, data);
  }
}
