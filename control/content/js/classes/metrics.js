class Metrics {
  constructor() {}

  // Get the big Object (metrics object)
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

  // Add new metrics in the big object (Control Panel Only)
  static insert({ nodeSelector, metricsId }, metric) {
    // metric.id = helpers.uuidv4();
    metric.createdOn = new Date();
    metric.lastUpdatedOn = new Date();

    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!metricsId) reject("metricsId not provided");

      buildfire.publicData.update(
        metricsId,
        { $set: { [`${nodeSelector}.${metric.id}`]: metric } },
        "metrics",
        (err, result) => {
          if (err) reject(err);
          else {
            Analytics.registerEvent(
              metric.title,
              `METRIC_${metric.id}_HISTORY_UPDATE`,
              "Number of times the metric history updated"
            );
            result.data.id = metricsId;
            resolve(result.data);
          }
        }
      );
    });
  }

  // To update any metric properties but not historys' values (Control Panel Only)
  static update({ nodeSelector, metricsId }, data, id) {
    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!metricsId) reject("metricsId not provided");

      let _set = {};
      for (let key in data) {
        _set[`${nodeSelector}.${id}.${key}`] = data[key];
      }

      _set[`${nodeSelector}.${id}.lastUpdatedOn`] = new Date();
      _set[`${nodeSelector}.${id}.lastUpdatedBy`] = data.lastUpdatedBy;

      buildfire.publicData.update(
        metricsId,
        { $set: _set },
        "metrics",
        (err, result) => {
          if (err) reject(err);
          else {
            result.data.id = metricsId;
            resolve(result.data);
          }
        }
      );
    });
  }

  // To delete any metrics (Control Panel Only)
  static delete({ nodeSelector, metricsId }, id) {
    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!metricsId) reject("metricsId not provided");

      buildfire.publicData.update(
        metricsId,
        {
          $unset: {
            [`${nodeSelector}.${id}`]: "",
          },
        },
        "metrics",
        (err, result) => {
          if (err) reject(err);
          else {
            Analytics.unregisterEvent(id);
            result.data.id = metricsId;
            resolve(result.data);
          }
        }
      );
    });
  }

  // To save the new order of the metrics (when sorting manually)
  static order({ nodeSelector, metricsId }, orderObj) {
    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!metricsId) reject("metricsId not provided");

      let _set = {};
      for (let id in orderObj) {
        _set[`${nodeSelector}.${id}.order`] = orderObj[id];
      }

      buildfire.publicData.update(
        metricsId,
        { $set: _set },
        "metrics",
        (err, result) => {
          if (err) reject(err);
          else {
            result.data.id = metricsId;
            resolve(result.data);
          }
        }
      );
    });
  }

  // Updates the root metric and metrics of type parent only,
  // takes two types of values: sortBy and description
  // which are placed in the root of the metric object
  static updateParent({ nodeSelector, metricsId }, value, type) {
    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!metricsId) reject("metricsId not provided");

      let _set = {};
      if (nodeSelector === "metrics") {
        // If it's the main metrics
        type === "sortBy" ? (_set.sortBy = value) : (_set.description = value);
      } else {
        // If the metrics was a parent
        let selector = nodeSelector.split(".");
        selector = selector.slice(0, selector.length - 1).join(".");
        type === "sortBy"
          ? (_set[`${selector}.sortBy`] = value)
          : (_set[`${selector}.description`] = value);
      }

      buildfire.publicData.update(
        metricsId,
        { $set: _set },
        "metrics",
        (err, result) => {
          if (err) reject(err);
          else {
            result.data.id = metricsId;
            resolve(result.data);
          }
        }
      );
    });
  }
}
