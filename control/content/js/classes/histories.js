class Histories {
  constructor() {}

  // Get the big Object (history object)
  static getHistories(clientProfile) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.get(
        `history${clientProfile}`,
        (err, result) => {
          if (err) reject(err);
          else {
            // Check if there is already objects in the database
            if (!result.data.metrics) {
              // If there is no object, then create the parent object
              buildfire.publicData.save(
                { metrics: {} },
                `history${clientProfile}`,
                (err, result) => {
                  if (err) reject(err);
                  else {
                    this.getHistories().then((result) => {
                      resolve(result);
                    });
                  }
                }
              );
            } else {
              result.data.id = result.id;
              resolve(result.data);
            }
          }
        }
      );
    });
  }
}
