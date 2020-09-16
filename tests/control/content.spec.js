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

xdescribe("Test the MetricsDAO class", () => {
  it("Should return the metrics object without any errors", async () => {
    await expectAsync(MetricsDAO.getMetrics()).toBeResolved();
  });

  const metric = new Metric({
    id: "5f626127fe0f898935ecf1a1",
    actionItem: {},
    createdBy: "currentUser.username",
    createdOn: new Date(),
    history: [
      {
        value: 50,
        createdOn: new Date(),
        createdBy: "currentUser.username",
        lastUpdatedOn: new Date(),
        lastUpdatedBy: "currentUser.username",
      },
    ],
    icon: "metric1",
    lastUpdatedBy: "currentUser.username",
    lastUpdatedOn: new Date(),
    max: 0,
    min: 100,
    order: null,
    title: "metric",
    type: "metric",
    value: 50,
  });

  MetricsDAO.metrics = { id: "5f627649376369065e7078cb" };

  it("Should save a metric without any errors", async () => {
    MetricsDAO.setCurrentNode("metrics");
    await expectAsync(MetricsDAO.save(metric)).toBeResolved();
  });

  it("Should update a metric without any errors", async () => {
    MetricsDAO.setCurrentNode("metrics." + metric.id);
    await expectAsync(
      MetricsDAO.update({ [`${MetricsDAO.currentNode}.title`]: "Title" })
    ).toBeResolved();
  });

  it("Should update a metric history value without any errors", async () => {
    MetricsDAO.setCurrentNode("metrics." + metric.id);
    await expectAsync(
      MetricsDAO.updateMetricHistory(99, metric.id)
    ).toBeResolved();
  });

  it("Should delete a metric without any errors", async () => {
    MetricsDAO.setCurrentNode("metrics");
    await expectAsync(MetricsDAO.delete(metric.id)).toBeResolved();
  });

  setTimeout(() => {
    MetricsDAO.getMetrics();
  }, 2000);
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
