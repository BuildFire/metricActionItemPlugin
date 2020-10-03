class Analytics {
  constructor() {}
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
}
