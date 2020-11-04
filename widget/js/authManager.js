const authManager = {
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      buildfire.auth.getCurrentUser((err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  },
};
