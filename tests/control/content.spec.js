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
      await deleteEverything().then(async (data) => {});

      await Metrics.getMetrics().then((data) => {
        metrics = data;
      });
    });

    let metric1 = new Metric({
      actionItem: {},
      createdBy: "Amjad Hamza",
      createdOn: new Date(),
      history: [],
      description: "<p> That is description</p>",
      sortBy: "manual",
      icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
      lastUpdatedBy: "Amjad Hamza",
      lastUpdatedOn: new Date(),
      max: 78,
      min: 44,
      metrics: {
        "5f7c65ee3fcada45c5a8fe8c": {
          actionItem: {},
          createdBy: "Amjad Hamza",
          createdOn: new Date(),
          history: [],
          description: "<p> That is description</p>",
          sortBy: "manual",
          icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
          lastUpdatedBy: "Amjad Hamza",
          lastUpdatedOn: new Date(),
          max: 78,
          min: 44,
          metrics: {
            "5f7c65ee3fcada45c5a8fekj": {
              actionItem: {},
              createdBy: "Amjad Hamza",
              createdOn: new Date(),
              description: "<p> That is description</p>",
              sortBy: "manual",
              history: [
                {
                  date: new Date(new Date().setHours(-24 * 12, 0, 0, 0)),
                  value: 98,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: new Date(new Date().setHours(-24 * 10, 0, 0, 0)),
                  value: 13,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: new Date(new Date().setHours(-24 * 7, 0, 0, 0)),
                  value: 49,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: new Date(new Date().setHours(-24 * 4, 0, 0, 0)),
                  value: 37,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: new Date(new Date().setHours(-24 * 2, 0, 0, 0)),
                  value: 19,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: new Date(new Date().setHours(-24, 0, 0, 0)),
                  value: 95,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: helpers.getAbsoluteDate(),
                  value: 81,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
              ],
              icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
              lastUpdatedBy: "Amjad Hamza",
              lastUpdatedOn: new Date(),
              max: 78,
              min: 44,
              metrics: {},
              order: null,
              title: "amjadBeforelast",
              type: "metric",
              value: 23,
            },
            "5f7c65ee3fcada45c5a8ferw": {
              actionItem: {},
              createdBy: "Amjad Hamza",
              createdOn: new Date(),
              sortBy: "manual",
              description: "<p> That is description</p>",
              history: [
                {
                  date: new Date(new Date().setHours(-24 * 12, 0, 0, 0)),
                  value: 67,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: new Date(new Date().setHours(-24 * 10, 0, 0, 0)),
                  value: 64,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: new Date(new Date().setHours(-24 * 7, 0, 0, 0)),
                  value: 62,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: new Date(new Date().setHours(-24 * 4, 0, 0, 0)),
                  value: 73,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: new Date(new Date().setHours(-24 * 2, 0, 0, 0)),
                  value: 29,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: new Date(new Date().setHours(-24, 0, 0, 0)),
                  value: 64,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
                {
                  date: helpers.getAbsoluteDate(),
                  value: 19,
                  createdOn: new Date(),
                  createdBy: "Amjad Hamza",
                  lastUpdatedOn: new Date(),
                  lastUpdatedBy: "Amjad Hamza",
                },
              ],
              icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
              lastUpdatedBy: "Amjad Hamza",
              lastUpdatedOn: new Date(),
              max: 78,
              min: 44,
              metrics: {},
              order: null,
              title: "amjadLast",
              type: "metric",
              value: 23,
            },
          },
          order: null,
          title: "amj",
          type: "parent",
          value: 23,
        },
        "5f7c65ee3fcada45c5a8fe8m": {
          actionItem: {},
          createdBy: "Amjad Hamza",
          createdOn: new Date(),
          sortBy: "manual",
          description: "<p> That is description</p>",
          history: [
            {
              date: new Date(new Date().setHours(-24 * 12, 0, 0, 0)),
              value: 35,
              createdOn: new Date(),
              createdBy: "Amjad Hamza",
              lastUpdatedOn: new Date(),
              lastUpdatedBy: "Amjad Hamza",
            },
            {
              date: new Date(new Date().setHours(-24 * 10, 0, 0, 0)),
              value: 78,
              createdOn: new Date(),
              createdBy: "Amjad Hamza",
              lastUpdatedOn: new Date(),
              lastUpdatedBy: "Amjad Hamza",
            },
            {
              date: new Date(new Date().setHours(-24 * 7, 0, 0, 0)),
              value: 96,
              createdOn: new Date(),
              createdBy: "Amjad Hamza",
              lastUpdatedOn: new Date(),
              lastUpdatedBy: "Amjad Hamza",
            },
            {
              date: new Date(new Date().setHours(-24 * 4, 0, 0, 0)),
              value: 34,
              createdOn: new Date(),
              createdBy: "Amjad Hamza",
              lastUpdatedOn: new Date(),
              lastUpdatedBy: "Amjad Hamza",
            },
            {
              date: new Date(new Date().setHours(-24 * 2, 0, 0, 0)),
              value: 37,
              createdOn: new Date(),
              createdBy: "Amjad Hamza",
              lastUpdatedOn: new Date(),
              lastUpdatedBy: "Amjad Hamza",
            },
            {
              date: new Date(new Date().setHours(-24, 0, 0, 0)),
              value: 82,
              createdOn: new Date(),
              createdBy: "Amjad Hamza",
              lastUpdatedOn: new Date(),
              lastUpdatedBy: "Amjad Hamza",
            },
            {
              date: helpers.getAbsoluteDate(),
              value: 71,
              createdOn: new Date(),
              createdBy: "Amjad Hamza",
              lastUpdatedOn: new Date(),
              lastUpdatedBy: "Amjad Hamza",
            },
          ],
          icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
          lastUpdatedBy: "Amjad Hamza",
          lastUpdatedOn: new Date(),
          max: 78,
          min: 44,
          order: null,
          title: "sad",
          type: "metric",
          value: 23,
        },
      },
      order: null,
      title: "metric",
      type: "parent",
      value: 23,
    });

    let metric2 = new Metric({
      actionItem: {},
      createdBy: "Amjad Hamza",
      createdOn: new Date(),
      sortBy: "manual",
      description: "<p> That is description</p>",
      history: [
        {
          date: new Date(new Date().setHours(-24 * 3, 0, 0, 0)),
          value: 80,
          createdOn: new Date(),
          createdBy: "Amjad Hamza",
          lastUpdatedOn: new Date(),
          lastUpdatedBy: "Amjad Hamza",
        },
        {
          date: helpers.getAbsoluteDate(),
          value: 41,
          createdOn: new Date(),
          createdBy: "Amjad Hamza",
          lastUpdatedOn: new Date(),
          lastUpdatedBy: "Amjad Hamza",
        },
      ],
      icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
      lastUpdatedBy: "Amjad Hamza",
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
      createdBy: "Amjad Hamza",
      createdOn: new Date(),
      history: [
        {
          date: helpers.getAbsoluteDate(),
          value: 23,
          createdOn: new Date(),
          createdBy: "Amjad Hamza",
          lastUpdatedOn: new Date(),
          lastUpdatedBy: "Amjad Hamza",
        },
      ],
      icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
      lastUpdatedBy: "Amjad Hamza",
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
      await Metrics.getMetrics().then((result) => {
        metrics = result;
      });
    });

    it("Should have the correct number of children", async () => {
      await expect(Object.keys(metrics.metrics).length).toBe(3);
    });

    it("Should calculate the value of the big object correctly", async () => {
      await expect(Metric.getHistoryValue(metrics)).toBe(40);
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
      Settings.tags = [
        { id: "5f56bb9355f6b40645e2daeb", tagName: "admin" },
        { id: "5f56bb9355f6b40635e2daeb", tagName: "user" },
      ];
      Settings.showSummary = true;
    });

    it("Should save new settings in the datastore", async () => {
      await Settings.save("any user").then((data) => {
        expect(data).toBeTruthy();
      });
    });

    it("Should get settings from the datastore correctly", async () => {
      await Settings.load().then((result) => {
        expect(result.data.showSummary).toBeTrue();
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
