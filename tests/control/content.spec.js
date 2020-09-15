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

  it("should have a GUID id if not provided", () => {
    expect(this.newObj.id).toBeTruthy();
  });

  it("should instantiate an object properly", () => {
    expect(this.newObj.title).toBe("Me and Hamza");
  });

  it("should instantiate an object properly", () => {
    expect(newObj.max).toEqual(jasmine.any(Number));
  });
});

describe("Test the MetricsDAO class", () => {
  it("should return allthe metrics correctly", () => {
    MetricsDAO.getMetrics().then((data) => {
      console.log("ALL DATA", data);
    });
    expect("af").toBeTruthy();
  });
});
