// For tests purposes only
Metrics.updateMetricHistory = ({ nodeSelector, metricsId }, value) => {
  const absoluteDate = helpers.getAbsoluteDate();

  return new Promise((resolve, reject) => {
    if (!nodeSelector) reject("nodeSelector not provided");
    if (!metricsId) reject("metricsId not provided");

    buildfire.publicData.searchAndUpdate(
      { [`${nodeSelector}.history.date`]: absoluteDate },
      {
        $set: {
          [`${nodeSelector}.history.$.value`]: value,
          [`${nodeSelector}.history.$.lastUpdatedOn`]: new Date(),
          [`${nodeSelector}.history.$.lastUpdatedBy`]: "currentUser.username",
        },
      },
      "metrics",
      (err, data) => {
        if (err) reject(err);

        if (data.nModified === 0) {
          buildfire.publicData.update(
            metricsId,
            {
              $push: {
                [`${nodeSelector}.history`]: {
                  date: helpers.getAbsoluteDate(),
                  createdOn: new Date(),
                  createdBy: "currentUser.username",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "currentUser.username",
                  value,
                },
              },
            },
            "metrics",
            async (err, data) => {
              if (err) reject(err);
              else resolve(data);
            }
          );
        }
        // Extract metric id from nodeSelector
        let updatedMetricId = nodeSelector.split(".");
        updatedMetricId = updatedMetricId[updatedMetricId.length - 1];
        // Track action
        Analytics.trackAction(`METRIC_${updatedMetricId}_HISTORY_UPDATE`);
        resolve(data);
      }
    );
  });
};

describe("Test The Widget Side", () => {
  describe("Test users' permissions in the widget", () => {
    beforeAll(() => {
      data = {
        displayName: "Anyone",
        email: "Anyone@gmail.com",
        isActive: true,
        lastAccess: new Date(),
        tags: {
          "ba3be268-ed66-11ea-91c9-06e43182e96c": [
            {
              appliedCount: 1,
              firstAssgined: "2020-09-17T17:25:07.842Z",
              lastAssgined: "2020-09-17T17:25:07.842Z",
              tagName: "admin",
            },
            {
              appliedCount: 1,
              firstAssgined: "2020-09-17T19:30:07.255Z",
              lastAssgined: "2020-09-17T19:30:07.255Z",
              tagName: "user",
            },
          ],
        },
      };
    });

    it("Should have an admin tag to change metric's value", () => {
      let currentUserTags = data.tags[Object.keys(data.tags)[0]];
      let isAdmin = false;

      currentUserTags.forEach((tag) => {
        if (tag.tagName === "admin") isAdmin = true;
      });

      expect(isAdmin).toEqual(true);
    });
  });

  describe("Test the Metrics class", () => {
    it("Should return the metrics object without any errors", async () => {
      await expectAsync(Metrics.getMetrics()).toBeResolved();
    });

    it("Should calculate the value of the big object correctly", async () => {
      expect(Metrics.getHistoryValue(metrics.data)).toBe(48.5);
    });

    it("Should update a metric history value without any errors", async () => {
      // Get a random id of a metric from the metrics object
      let metric2Id = Object.keys(metrics.data.metrics)[0];

      nodeSelector = "metrics." + metric2Id;

      await expectAsync(
        Metrics.updateMetricHistory({ nodeSelector, metricsId: metrics.id }, 55)
      ).toBeResolved();
    });

    afterAll(async () => {
      Metrics.getMetrics().then((data) => {
        console.log("Metric Object After all testing", data);
      });
    });
  });
});
