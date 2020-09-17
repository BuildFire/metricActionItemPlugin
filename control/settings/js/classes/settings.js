class Settings {
  constructor(data = {}) {
    this.tags = data.tags || [];
    this.sortBy = data.sortBy || "";
    this.showSummary = data.showSummary;
  }

  static get() {
    return new Promise((resolve, reject) => {
      buildfire.datastore.get("settings", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  save() {
    let settings = {
      tags: this.tags,
      sortBy: this.sortBy,
      showSummary: this.showSummary,
    };
    return new Promise((resolve, reject) => {
      buildfire.datastore.save(settings, "settings", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}
