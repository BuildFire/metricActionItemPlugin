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
      await deleteEverything().then(async (data) => {
        console.log("Delete all data", data);
      });

      await Metrics.getMetrics().then((data) => {
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
      icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
      lastUpdatedBy: "currentUser.username",
      lastUpdatedOn: new Date(),
      max: 78,
      min: 44,
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
          value: 41,
          createdOn: new Date(),
          createdBy: "currentUser.username",
          lastUpdatedOn: new Date(),
          lastUpdatedBy: "currentUser.username",
        },
      ],
      icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
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
          value: 23,
          createdOn: new Date(),
          createdBy: "currentUser.username",
          lastUpdatedOn: new Date(),
          lastUpdatedBy: "currentUser.username",
        },
      ],
      icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
      lastUpdatedBy: "currentUser.username",
      lastUpdatedOn: new Date(),
      max: 95,
      min: 23,
      order: null,
      title: "metric",
      type: "metric",
      value: 22,
    });

    it("Should return the metrics object without any errors", async () => {
      await expectAsync(Metrics.getMetrics()).toBeResolved();
    });

    it("Should save metrics correctly", async () => {
      await expectAsync(
        Metrics.insert({ nodeSelector, metricsId: metrics.id }, metric1)
      ).toBeResolved();
      await expectAsync(
        Metrics.insert({ nodeSelector, metricsId: metrics.id }, metric2)
      ).toBeResolved();
      await expectAsync(
        Metrics.insert({ nodeSelector, metricsId: metrics.id }, metric3)
      ).toBeResolved();
      await Metrics.getMetrics().then((data) => {
        metrics = data;
      });
    });

    it("Should have the correct number of children", async () => {
      await expect(Object.keys(metrics.data.metrics).length).toBe(3);
    });

    it("Should calculate the value of the big object correctly", async () => {
      await expect(Metrics.getHistoryValue(metrics.data)).toBe(40);
    });

    it("Should update a metric's title without any errors", async () => {
      nodeSelector = "metrics";
      await expectAsync(
        Metrics.update(
          { nodeSelector, metricsId: metrics.id },
          { title: "Title" },
          metric1.id
        )
      ).toBeResolved();
    });

    it("Should delete a metric without any errors", async () => {
      nodeSelector = "metrics";
      await expectAsync(
        Metrics.delete({ nodeSelector, metricsId: metrics.id }, metric3.id)
      ).toBeResolved();
      await Metrics.getMetrics().then((data) => {
        metrics = data;
      });
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
