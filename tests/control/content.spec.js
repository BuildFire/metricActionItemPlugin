describe("Test the Metric class", () => {
  beforeAll(() => {
    let data = {
      title: "Me and Hamza",
      icon: "Nothing important",
      min: 20,
      max: 100,
      type: "parent",
    };
    newObj = new Metric(data);
  });

  it("Should have a GUID id if not provided", () => {
    expect(this.newObj.id).toBeTruthy();
  });

  it("Should instantiate an object properly", () => {
    expect(this.newObj.title).toBe("Me and Hamza");
  });

  it("Should instantiate an object properly", () => {
    expect(newObj.max).toEqual(jasmine.any(Number));
  });
});

describe("Test the MetricsDAO class", () => {
  beforeAll(async () => {
    await deleteEverything().then((data) => {
      console.log("deleted", data);
    });
    await MetricsDAO.getMetrics();

    metric1 = new Metric({
      id: "5f635a3b62f0aff6f82856d0",
      actionItem: {},
      createdBy: "currentUser.username",
      createdOn: new Date(),
      history: [
        {
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

    metric2 = new Metric({
      id: "5f635a3b66a9afc0e2a8019f",
      actionItem: {},
      createdBy: "currentUser.username",
      createdOn: new Date(),
      history: [
        {
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

    metric3 = new Metric({
      id: "5f635a3b54586a894049c2b1",
      actionItem: {},
      createdBy: "currentUser.username",
      createdOn: new Date(),
      history: [
        {
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
  });

  it("Should return the metrics object without any errors", async () => {
    await expectAsync(MetricsDAO.getMetrics()).toBeResolved();
  });

  it("Should save the first metric correctly", async () => {
    MetricsDAO.setCurrentNode("metrics");
    await expectAsync(MetricsDAO.save(metric1)).toBeResolved();
    await expectAsync(MetricsDAO.save(metric2)).toBeResolved();
    await expectAsync(MetricsDAO.save(metric3)).toBeResolved();
    expect(Object.keys(MetricsDAO.metrics.data.metrics).length).toBe(3);
  });

  it("Should save the third metric and calculate the value of the big object correctly", async () => {
    expect(MetricsDAO.getHistoryValue(MetricsDAO.metrics.data)).toBe(40);
  });

  it("Should update a metric without any errors", async () => {
    MetricsDAO.setCurrentNode("metrics." + metric1.id);
    await expectAsync(
      MetricsDAO.update({ [`${MetricsDAO.currentNode}.title`]: "Title" })
    ).toBeResolved();
  });

  it("Should update a metric history value without any errors", async () => {
    MetricsDAO.setCurrentNode("metrics." + metric2.id);
    await expectAsync(
      MetricsDAO.updateMetricHistory(99, metric2.id)
    ).toBeResolved();
  });

  it("Should delete a metric without any errors", async () => {
    MetricsDAO.setCurrentNode("metrics");
    await expectAsync(MetricsDAO.delete(metric3.id)).toBeResolved();
  });

  afterAll(async () => {
    await setTimeout(() => {
      console.log("Metric Object After all testing", MetricsDAO.metrics);
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

  it("Should instantiate an object properly", () => {
    expect(newSettings.sortBy).toBe("lowest");
  });

  it("Should save new settings in the datastore", async () => {
    await newSettings.save().then((data) => {
      expect(data).toBeTruthy();
    });
  });

  it("Should get settings from the datastore", async () => {
    await Settings.get().then((data) => {
      expect(data).toBeTruthy();
    });
  });
});

// describe("Test the MetricsDAO class", () => {
//     it("should return all the metrics correctly", async () => {
//       await expectAsync(MetricsDAO.getMetrics()).toBeResolved();
//     });

//     it("should return all the metrics correctly", async () => {
//       await MetricsDAO.getMetrics().then((data) => {
//         console.log("ALL ", data);
//         expect(data).toBeTruthy();
//       });
//     });
//     it("should return all the metrics correctly", (done) => {
//       MetricsDAO.getMetrics().then((data) => {
//         console.log("ALL ", data);
//         expect(data).toBeTruthy();
//         done();
//       });
//     });
//   });

// To delete all metrics inside the big object
function deleteEverything() {
  return new Promise((resolve, reject) => {
    buildfire.publicData.save({}, "metrics", (err, result) => {
      if (err) reject(err);
      else {
        console.log("Yes I passed");
        buildfire.publicData.get("metrics", (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
        resolve(result);
      }
    });
  });
}
