let metrics = {};

describe("Test The Control Side", () => {
  // We used nodeSelector to determine where are we inside the big object
  let nodeSelector = "metrics";

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
      // Delete all the existed data and start from scratch
      await deleteEverything().then((data) => {
        console.log("Delete All Data", data);
      });
      await Metrics.getMetrics().then((data) => {
        console.log("asdf", data);
        metrics = data;
      });
    });

    let metric1 = new Metric({
      actionItem: {},
      createdBy: "currentUser.username",
      createdOn: new Date(),
      history: [
        {
          date: helpers.getAbsoluteDate(),
          value: 56,
          createdOn: new Date(),
          createdBy: "currentUser.username",
          lastUpdatedOn: new Date(),
          lastUpdatedBy: "currentUser.username",
        },
      ],
      icon: "metric1",
      lastUpdatedBy: "currentUser.username",
      lastUpdatedOn: new Date(),
      max: 44,
      min: 78,
      order: null,
      title: "metric",
      type: "metric",
      value: 23,
    });

    let metric2 = new Metric({
      id: "5f635a3b66a9afc0e2a8019f",
      actionItem: {},
      createdBy: "currentUser.username",
      createdOn: new Date(),
      history: [
        {
          date: helpers.getAbsoluteDate(),
          value: 45,
          createdOn: new Date(),
          createdBy: "currentUser.username",
          lastUpdatedOn: new Date(),
          lastUpdatedBy: "currentUser.username",
        },
      ],
      icon: "metric1",
      lastUpdatedBy: "currentUser.username",
      lastUpdatedOn: new Date(),
      max: 96,
      min: 15,
      order: null,
      title: "metric",
      type: "metric",
      value: 56,
    });

    let metric3 = new Metric({
      id: "5f635a3b54586a894049c2b1",
      actionItem: {},
      createdBy: "currentUser.username",
      createdOn: new Date(),
      history: [
        {
          date: helpers.getAbsoluteDate(),
          value: 19,
          createdOn: new Date(),
          createdBy: "currentUser.username",
          lastUpdatedOn: new Date(),
          lastUpdatedBy: "currentUser.username",
        },
      ],
      icon: "metric1",
      lastUpdatedBy: "currentUser.username",
      lastUpdatedOn: new Date(),
      max: 56,
      min: 45,
      order: null,
      title: "metric",
      type: "metric",
      value: 23,
    });

    it("Should return the metrics object without any errors", async () => {
      await expectAsync(Metrics.getMetrics()).toBeResolved();
    });

    it("Should save metrics correctly", async () => {
      await expectAsync(Metrics.save(metric1, nodeSelector)).toBeResolved();
      await expectAsync(Metrics.save(metric2, nodeSelector)).toBeResolved();
      await expectAsync(Metrics.save(metric3, nodeSelector)).toBeResolved();
    });

    it("Should have the correct number of children", async () => {
      expect(Object.keys(metrics.data.metrics).length).toBe(3);
    });

    it("Should calculate the value of the big object correctly", async () => {
      expect(Metrics.getHistoryValue(metrics.data)).toBe(40);
    });

    // it("Should update a metric's title  without any errors", async () => {
    //   nodeSelector = "metrics." + metric1.id;
    //   await expectAsync(
    //     Metrics.update({ [`${nodeSelector}.title`]: "Title" })
    //   ).toBeResolved();
    // });

    // it("Should update a metric history value without any errors", async () => {
    //   nodeSelector = "metrics." + metric2.id;
    //   await expectAsync(
    //     Metrics.updateMetricHistory(99, nodeSelector)
    //   ).toBeResolved();
    // });

    // it("Should delete a metric without any errors", async () => {
    //   nodeSelector = "metrics";
    //   await expectAsync(
    //     Metrics.delete(metric3.id, nodeSelector)
    //   ).toBeResolved();
    // });

    afterAll(async () => {
      await setTimeout(() => {
        console.log("Metric Object After all testing", metrics);
      }, 3000);
    });
  });

  describe("Test the Settings class", () => {
    beforeAll(() => {
      let data = {
        tags: ["admin", "moderator", "users"],
        sortBy: "lowest",
        showSummary: false,
      };
      newSettings = new Settings(data);
    });

    it("Should instantiate an object correctly", () => {
      expect(newSettings.sortBy).toBe("lowest");
    });

    it("Should save new settings in the datastore", async () => {
      await newSettings.save().then((data) => {
        expect(data).toBeTruthy();
      });
    });

    it("Should get settings from the datastore correctly", async () => {
      await Settings.get().then((result) => {
        expect(result.data.showSummary).toBeFalse();
      });
    });
  });

  // To delete everything (Big Object)
  function deleteEverything() {
    return new Promise((resolve, reject) => {
      buildfire.publicData.save({}, "metrics", (err, result) => {
        if (err) reject(err);
        else {
          resolve(result);
        }
      });
    });
  }
});
