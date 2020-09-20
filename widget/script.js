let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
let currentUser;

authManager.getCurrentUser().then((user) => {
  console.log("authManager.currentUser", user);
  currentUser = user;
});

Metrics.getMetrics().then(() => {
  Metrics.getHistoryValue(metrics);
});
