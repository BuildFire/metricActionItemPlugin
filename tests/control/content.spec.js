describe("Test The Control Side", () => {
  let metrics = {};
  let histories = {};
  let clientProfile = "";

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
      await deleteEverything().then(async (data) => {});

      await Metrics.getMetrics().then((data) => {
        metrics = data;
      });

      await Histories.getHistories(clientProfile).then((data) => {
        histories = data;
      });
    });

    let metric1 = new Metric({
      actionItem: {},
      createdBy: "Amjad Hamza",
      createdOn: new Date(),
      history: [],
      icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
      lastUpdatedBy: "Amjad Hamza",
      lastUpdatedOn: new Date(),
      max: 78,
      min: 44,
      order: 0,
      title: "metric",
      type: "metric",
      value: 23,
    });

    let metric2 = new Metric({
      actionItem: {},
      createdBy: "Amjad Hamza",
      createdOn: new Date(),
      history: [],
      icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
      lastUpdatedBy: "Amjad Hamza",
      lastUpdatedOn: new Date(),
      max: 96,
      min: 15,
      order: 1,
      title: "metric",
      type: "metric",
      value: 56,
    });

    let metric3 = new Metric({
      actionItem: {},
      createdBy: "Amjad Hamza",
      createdOn: new Date(),
      icon: "https://img.icons8.com/material/4ac144/256/user-male.png",
      lastUpdatedBy: "Amjad Hamza",
      lastUpdatedOn: new Date(),
      max: 95,
      min: 23,
      order: 2,
      title: "metric",
      type: "metric",
      value: 22,
    });

    it("Should return the metrics object without any errors", async () => {
      await expectAsync(
        Metrics.getMetrics().then(async (result) => {
          metrics = result;
          await helpers.filterCustomerMetrics(metrics, clientProfile);
        })
      ).toBeResolved();
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

    it("Should filter the metrics based on history correctly", async () => {
      await expectAsync(
        helpers
          .filterCustomerMetrics(metrics, clientProfile)
          .then((filteredMetrics) => {
            metrics.metrics = filteredMetrics;
          })
      ).toBeResolved();
    });

    it("Should calculate the value of the big object correctly", async () => {
      await expect(Math.round(Metric.getHistoryValue(metrics))).toBe(0);
    });

    it("Should change the order of metrics correctly", async () => {
      let metricChildren = [];
      for (let key in metrics.metrics) {
        metricChildren.push(metrics.metrics[key]);
      }
      expect(metricChildren[0].order).toBe(0);
      expect(metricChildren[1].order).toBe(1);
      expect(metricChildren[2].order).toBe(2);
      let orderObj = {
        [metricChildren[0].id]: 2,
        [metricChildren[1].id]: 0,
        [metricChildren[2].id]: 1,
      };
      await Metrics.order({ nodeSelector, metricsId: metrics.id }, orderObj)
        .then((result) => {
          metrics = result;
        })
        .catch(console.log);

      metricChildren = [];
      for (let key in metrics.metrics) {
        metricChildren.push(metrics.metrics[key]);
      }
      expect(metricChildren[0].order).toBe(2);
      expect(metricChildren[1].order).toBe(0);
      expect(metricChildren[2].order).toBe(1);
    });

    it("Should update parents' metrics sortBy and description correctly", async () => {
      await Metrics.updateParent(
        {
          nodeSelector,
          metricsId: metrics.id,
        },
        "lowest",
        "sortBy"
      ).then((result) => {
        metrics = result;
      });
      await Metrics.updateParent(
        {
          nodeSelector,
          metricsId: metrics.id,
        },
        "That is a new metric",
        "description"
      ).then((result) => {
        metrics = result;
      });
      expect(metrics.sortBy).toBe("lowest");
      expect(metrics.description).toBe("That is a new metric");
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
        // .then(async () => {
        //   Histories.delete(
        //     { clientProfile, nodeSelector, historyId: histories.id },
        //     metric3.id
        //   );
        // })
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
      await Settings.save().then((data) => {
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
        else resolve()
      });
    });
  };
});
