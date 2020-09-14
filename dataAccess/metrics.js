class MetricsDAO {
  constructor() {
    this.metrics = {};
  }

  static getMetrics() {
    return new Promise((resolve, reject) => {
      buildfire.publicData.get("metrics", (err, data) => {
        if (err) reject(err);
        else {
          // Check if there is already objects in the database
          if (!data.data.metrics) {
            // If there is no object, then create the parent object
            buildfire.publicData.save(
              { metrics: {} },
              "metrics",
              (err, result) => {
                if (err) reject(err);
                else {
                  MetricsDAO.getMetrics();
                  resolve(result);
                }
              }
            );
          } else {
            this.metrics = data;
            resolve(data);
          }
        }
      });
    });
  }

  static save(metric) {
    metric.createdOn = new Date();
    metric.lastUpdatedOn = new Date();

    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        this.metrics.id,
        { $set: { [`${metric.pointer}.${metric.id}`]: metric } },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });
  }

  static update(updateObject) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        this.metrics.id,
        { $set: updateObject },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });
  }

  static delete(metric) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.update(
        this.metrics.id,
        {
          $unset: {
            [`${metric.pointer}.${metric.id}`]: "",
          },
        },
        "metrics",
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });
  }

  static addMetricHistory(pointer, value) {
    const currentDate = helpers.getAbsoluteDate();
    return new Promise((resolve, reject) => {
      console.log("pointer", pointer);
      console.log("value", value);
      resolve(true);
    });
  }
}

const metric = new Metric({
  id: "5f5e38f564fb6d379babba90",
  title: "tyu",
  icon: "tyu",
  pointer: "metrics.5f5e33894cd39ab4948c4914.metrics",
  min: 45,
  max: 87,
  value: 78,
  action_item: {},
  type: "parent",
  history: [
    {
      value: 50,
      createdOn: helpers.getAbsoluteDate(),
      createdBy: null,
      lastUpdatedOn: helpers.getAbsoluteDate(),
      lastUpdatedBy: null,
    },
  ],
});

MetricsDAO.getMetrics().then((data) => {
  // newMetric.update(metric, "value").then(() => {
  //   newMetric.getMetrics().then((data) => {
  //     console.log("ALL DATA after Delete", data);
  //   });
  // });
  rep(data.data);
  console.log("ALL DATA", data.data);
});

function rep(obj) {
  for (var ob in obj.metrics) {
    console.log("ob", ob);
    obj.metrics[ob].parent = obj;
    console.log(new Metric(obj.metrics[ob]));
    // console.log("obj.metrics[ob]", obj.metrics[ob]);
    if (obj.metrics[ob].metrics) {
      //   console.log("obj.metrics[ob].metrics", obj.metrics[ob]);
      rep(obj.metrics[ob]);
    }
  }
}
