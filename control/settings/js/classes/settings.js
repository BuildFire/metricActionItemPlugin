class Settings {
  constructor(data = {}) {
    this.sortBy = data.sortBy || "";
    this.showSummary = data.showSummary || true;
    this.tags = data.tags || [];
  }

  static get() {
    return new Promise((resolve, reject) => {
      buildfire.datastore.get("settings", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  static set(data) {
    this.sortBy = data.sortBy;
    this.showSummary = data.showSummary;
    this.tags = data.tags;
  }

  static save() {
    let settings = {
      tags: this.tags,
      sortBy: this.sortBy,
      showSummary: this.showSummary,
    };

    console.log("settings", settings);
    return new Promise((resolve, reject) => {
      buildfire.datastore.save(settings, "settings", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}
