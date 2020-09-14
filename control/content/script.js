// Get helper functions
const Helpers = helpers;

class Metric {
  constructor(data = {}) {
    this.id = data.id || "";
    this.title = data.title || "";
    this.icon = data.icon || "";
    this.min = data.min || 0;
    this.max = data.max || 0;
    this.value = data.value || 0;
    this.action_item = data.action_item || {};
    this.type = data.type || "";
    this.parent_id = data.parent_id || "";
    this.history = [new History({ value: data.value || 0 })];
    this.createdOn = data.createdOn || null;
    this.createdBy = data.createdBy || null;
    this.lastUpdatedOn = data.lastUpdatedOn || null;
    this.lastUpdatedBy = data.lastUpdatedBy || null;
    this.deletedBy = data.deletedBy || null;
    this.deletedOn = data.deletedOn || null;
  }

  static getMatrics() {
    return new Promise((resolve, reject) => {
      buildfire.publicData.search({}, "metrics", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  getRowData() {
    let data = {
      createdOn: this.createdOn,
      createdBy: this.createdBy,
      lastUpdatedOn: this.lastUpdatedOn,
      lastUpdatedBy: this.lastUpdatedBy,
      deletedOn: this.deletedOn,
      deletedBy: this.deletedBy,
    };
    if (this.type === "metric") {
      data = {
        ...data,
        title: this.title,
        icon: this.icon,
        min: this.min,
        max: this.max,
        value: this.value,
        action_item: this.action_item,
        type: this.type,
        parent_id: this.parent_id,
      };
    } else if (this.type === "parent") {
      data = {
        title: this.title,
        icon: this.icon,
        action_item: this.action_item,
        type: this.type,
        parent_id: this.parent_id,
      };
    }
    if (!data.parent_id) return data;
    else if (data.parent_id) {
      return {
        ...data,
        _buildfire: {
          index: {
            string1: this.parent_id,
          },
        },
      };
    }
  }

  save() {
    let metric = this.getRowData();
    metric.createdOn = new Date();
    return new Promise((resolve, reject) => {
      buildfire.publicData.insert(metric, "metrics", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  update() {
    let metric = this.getRowData();
    metric.lastUpdatedOn = new Date();

    // Parent, it doesn't have a value or history;
    if (this.type === "parent") {
      return new Promise((resolve, reject) => {
        buildfire.publicData.update(this.id, metric, "metrics", (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    } else {
      // Give buildfire index with the generated date
      // find it in the database and update it 2020/8/9
      // if didn't find it push a new value
      return new Promise((resolve, reject) => {
        buildfire.publicData.getById(metric.id, "metrics", (err, data) => {
          if (err) reject(err);
          else {
            const currentDate = Helpers.formatDate();
            // Get the last updated date
            let lastUpdatedDate = data.history[data.history.length - 1].date;

            // Check if it equels the current date
            if (Helpers.formatDate(lastUpdatedDate) === currentDate) {
              // If it does, change the value to the new value
              data.history[data.history.length - 1].value = metric.value;
            } else {
              // If it doesn't, it means there are no records of the current date
              // so we add a new record with the current date
              data.history.push({ date: new Date(), value: metric.value });
            }
            // We add the updated history to the metric data that we want to update
            metric.history = data.history;
            // Then we update the record in the database
            buildfire.publicData.update(
              this.id,
              metric,
              "metrics",
              (err, data) => {
                if (err) reject(err);
                else resolve(data);
              }
            );
          }
        });
      });
    }
  }

  deleteMetric() {
    return new Promise((resolve, reject) => {
      buildfire.publicData.delete(this.id, "metrics", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}

const me = new Metric({
  title: "gdtr",
  icon: "dfhgfjj",
  min: 456,
  max: 123,
  value: 2435435,
  action_item: {},
  type: "metric",
  parent_id: "asdaf",
});

class History {
  constructor(data = {}) {
    this.value = data.value;
    this.date = new Date();
    this.createdOn = data.createdOn || null;
    this.createdBy = data.createdBy || null;
    this.lastUpdatedOn = data.lastUpdatedOn || null;
    this.lastUpdatedBy = data.lastUpdatedBy || null;
  }
}
