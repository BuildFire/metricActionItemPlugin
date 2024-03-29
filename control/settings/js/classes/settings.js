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

  static save(username) {
    let settings = {
      tags: this.tags,
      showSummary: this.showSummary,
      dataPolicyType: this.dataPolicyType,
      lastUpdatedBy: username,
    };

    return new Promise((resolve, reject) => {
      buildfire.datastore.save(settings, "settings", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}
