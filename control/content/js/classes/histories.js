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

  // Add new history in the big object (Control Panel Only)
  static insert({ clientProfile, nodeSelector, historyId }, history) {
    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!historyId) reject("historyId not provided");

      buildfire.publicData.update(
        historyId,
        { $set: { [`${nodeSelector}.${history.id}`]: history } },
        `history${clientProfile}`,
        (err, result) => {
          if (err) reject(err);
          else {
            result.data.id = historyId;
            resolve(result.data);
          }
        }
      );
    });
  }

  // To delete any history (Control Panel Only)
  static delete({ clientProfile, nodeSelector, historyId }, id) {
    return new Promise((resolve, reject) => {
      if (!nodeSelector) reject("nodeSelector not provided");
      if (!historyId) reject("historyId not provided");

      buildfire.publicData.update(
        historyId,
        {
          $unset: {
            [`${nodeSelector}.${id}`]: "",
          },
        },
        `history${clientProfile}`,
        (err, result) => {
          if (err) reject(err);
          else {
            result.data.id = historyId;
            resolve(result.data);
          }
        }
      );
    });
  }
}
