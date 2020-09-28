class Settings {
  constructor() {
    this.sortBy;
    this.showSummary;
    this.tags;
  }

  static load() {
    return new Promise((resolve, reject) => {
      buildfire.datastore.get("settings", (err, data) => {
        if (err) reject(err);
        else {
          this.sortBy = data.data.sortBy;
          this.tags = data.data.tags;
          this.showSummary =
            data.data.showSummary === false ? data.data.showSummary : true;
          resolve(data);
        }
      });
    });
  }
}
