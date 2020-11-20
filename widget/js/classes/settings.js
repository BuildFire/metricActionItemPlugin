class Settings {
  constructor() {
    this.showSummary;
    this.tags;
    this.dataPolicyType;
  }

  static load() {
    return new Promise((resolve, reject) => {
      buildfire.datastore.get("settings", (err, result) => {
        if (err) reject(err);
        else {
          this.tags = result.data.tags || [];
          this.showSummary = result.data.showSummary === false ? false : true;
          this.dataPolicyType = result.data.dataPolicyType || "public";
          resolve(result);
        }
      });
    });
  }
}
