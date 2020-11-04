class Settings {
  constructor() {
    this.showSummary;
    this.tags;
  }

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
}
