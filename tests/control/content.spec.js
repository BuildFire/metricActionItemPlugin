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

  MetricsDAO.metrics = { id: "5f5fb72772fd48066a251bea" };

  // it("Should save a metric without any errors", async () => {
  //   MetricsDAO.setCurrentNode("metrics");
  //     await expectAsync(MetricsDAO.save(metric)).toBeResolved();
  // });

  //   it("Should update a metric without any errors", async () => {
  //     MetricsDAO.setCurrentNode("metrics." + metric.id);
  // \    await expectAsync(
  //       MetricsDAO.update({ [`${MetricsDAO.currentNode}.title`]: "New Title" })
  //     ).toBeResolved();
  //   });

  it("Should update a metric history value without any errors", async () => {
    MetricsDAO.setCurrentNode("metrics." + "5f5fbaca70805ba300168eb3");
    await expectAsync(
      MetricsDAO.updateMetricHistory(99, MetricsDAO.currentNode)
    ).toBeResolved();
  });

  // it("Should delete a metric without any errors", async () => {
  //   MetricsDAO.setCurrentNode("metrics");
  //   await expectAsync(
  //     MetricsDAO.delete("5f626127fe0f898935ecf1a1")
  //   ).toBeResolved();
  // });
  setTimeout(() => {
    MetricsDAO.getMetrics();
  }, 2000);
});
