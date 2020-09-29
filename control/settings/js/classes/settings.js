class Settings {
  constructor() {
    this.sortBy;
    this.showSummary;
    this.tags;
  }

  static load() {
    return new Promise((resolve, reject) => {
      buildfire.datastore.get("settings", (err, result) => {
        if (err) reject(err);
        else {
          this.sortBy = result.data.sortBy;
          this.tags = result.data.tags;
          this.showSummary =
            result.data.showSummary === false ? result.data.showSummary : true;
          resolve(result);
        }
      });
    });
  }

  static save() {
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
