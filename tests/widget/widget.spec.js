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
});
