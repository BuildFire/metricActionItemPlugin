class Settings {
  constructor() {}

  static load() {
    return new Promise((resolve, reject) => {
      buildfire.datastore.get("settings", (err, result) => {
        if (err) reject(err);
        else {
          this.tags = result.data.tags || [];
          this.showSummary = result.data.showSummary === false ? false : true;
          resolve(result);
        }
      });
    });
  }

  static save() {
    let settings = {
      tags: this.tags,
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
