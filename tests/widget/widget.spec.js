describe("Test The Widget Side", () => {
  let metrics = {};
  let nodeSelector = "metrics";
  let currentUser;

  describe("Test the Metric class", () => {
    beforeAll(() => {
      let data = {
        title: "New Metric",
        icon: "Nothing important",
        min: 20,
        max: 100,
        type: "parent",
      };
      newObj = new Metric(data);
    });

    it("Should instantiate an object correctly", () => {
      expect(this.newObj.title).toBe("New Metric");
    });

    it("Should instantiate an object and gives the expected data types", () => {
      expect(newObj.max).toEqual(jasmine.any(Number));
    });
  });

  describe("Test the Metrics class", () => {
    beforeAll(async () => {
      await authManager.getCurrentUser().then((user) => {
        currentUser = user;
      });
    });
    it("Should return the metrics object without any errors", async () => {
      await expectAsync(
        Metrics.getMetrics().then((data) => {
          metrics = data;
        })
      ).toBeResolved();
    });

    it("Should calculate the value of the big object correctly", async () => {
      expect(Metrics.getHistoryValue(metrics, 1)).toBe(48.5);
    });

    it("Should update a metric history value without any errors", async () => {
      // Get a random id of a metric from the metrics object
      let metric2Id = Object.keys(metrics.metrics)[0];

      nodeSelector = "metrics." + metric2Id;

      await expectAsync(
        Metrics.updateMetricHistory(
          { nodeSelector, metricsId: metrics.id },
          55,
          currentUser && currentUser.username ? currentUser.username : null
        )
      ).toBeResolved();
    });

    afterAll(async () => {
      Metrics.getMetrics().then((data) => {
        console.log("Metric Object After all testing", data);
      });
    });
  });
});

describe("Test the Settings class", () => {
  it("Should get settings from the datastore correctly", async () => {
    await Settings.load().then((result) => {
      expect(result.data.showSummary).toBeTrue();
    });
  });
});

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
