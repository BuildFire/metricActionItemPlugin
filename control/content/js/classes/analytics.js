class Analytics {
  constructor() {}
  // Register plugin events for analytics
  static registerEvent = (event, options, callback) => {
    if (event.title && event.key) {
      let _options = options.silentNotification || true;
      buildfire.analytics.registerEvent(event, _options, (err, res) => {
        if (err) return callback(err, null);
        {
          return callback(null, res)
        };
      });
    }
  };

  static unregisterEvent(id) {
    buildfire.analytics.unregisterEvent(`METRIC_${id}_HISTORY_UPDATE`);
  }

  static init = () => {
    AnalyticsKey.eventType.forEach((e) => {
      Analytics.registerEvent(
        {
          title: e.title,
          key: e.key,
          description: e.description,
        },
        { silentNotification: false },
        (err, res) => {
          if (err) console.error(err);
          else return res;
        }
      );
    });
  }
};
