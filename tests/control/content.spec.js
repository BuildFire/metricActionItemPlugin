describe("Test The Control Side", () => {
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
        console.log("Delete all data", data);
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
      await expectAsync(Metrics.insert(metric1, nodeSelector)).toBeResolved();
      await expectAsync(Metrics.insert(metric2, nodeSelector)).toBeResolved();
      await expectAsync(Metrics.insert(metric3, nodeSelector)).toBeResolved();
    });

    it("Should have the correct number of children", async () => {
      expect(Object.keys(metrics.data.metrics).length).toBe(3);
    });

    it("Should calculate the value of the big object correctly", async () => {
      expect(Metrics.getHistoryValue(metrics.data)).toBe(40);
    });

    it("Should update a metric's title without any errors", async () => {
      nodeSelector = "metrics";
      await expectAsync(
        Metrics.update(
          { metricId: metric1.id, nodeSelector },
          { title: "Title" }
        )
      ).toBeResolved();
    });

    it("Should update a metric history value without any errors", async () => {
      nodeSelector = "metrics." + metric2.id;
      await expectAsync(
        Metrics.updateMetricHistory({ nodeSelector }, 99)
      ).toBeResolved();
    });

    it("Should delete a metric without any errors", async () => {
      nodeSelector = "metrics";
      await expectAsync(
        Metrics.delete({ nodeSelector }, metric3.id)
      ).toBeResolved();
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
  const deleteEverything = () => {
    return new Promise((resolve, reject) => {
      buildfire.publicData.save({}, "metrics", (err, result) => {
        if (err) reject(err);
        else {
          resolve(result);
        }
      });
    });
  };
});
