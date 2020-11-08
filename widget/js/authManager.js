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
  login: () => {
    return new Promise((resolve, reject) => {
      buildfire.auth.login({ allowCancel: true }, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  },
};
