describe("Test The Widget Side", () => {
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

  describe("Test the Metrics class", () => {
    it("Should return the metrics object without any errors", async () => {
      await expectAsync(Metrics.getMetrics()).toBeResolved();
    });

    it("Should calculate the value of the big object correctly", async () => {
      expect(Metrics.getHistoryValue(metrics.data)).toBe(77.5);
    });

    it("Should update a metric history value without any errors", async () => {
      // Get a random id of a metric from the metrics object
      let metric2Id = Object.keys(metrics.data.metrics)[0];

      nodeSelector = "metrics." + metric2Id;

      console.log("DADADA");
      console.log("metric2.id", metric2Id);
      await expectAsync(
        Metrics.updateMetricHistory({ nodeSelector }, 55)
      ).toBeResolved();
    });

    afterAll(async () => {
      Metrics.getMetrics().then((data) => {
        console.log("Metric Object After all testing", data);
      });
    });
  });
});
