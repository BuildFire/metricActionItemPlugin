// A helper function to extract the date: Format: "year/month/day"
const helpers = {
  uuidv4: (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h)),
  // Return absolute date
  getAbsoluteDate: () => new Date(new Date().setHours(0, 0, 0, 0)),
  nodeSplitter: (nodeSelector, metrics) => {
    let splittedNode = nodeSelector.split(".");
    let metricsChildren = metrics;
    let metricsParent = null;
    let metricsSortBy = "";

    splittedNode.forEach((item, i) => {
      // If we are at the home page (top of the object)
      if (nodeSelector === "metrics") {
        metricsParent = metrics;
        metricsSortBy = metrics.sortBy;
      }
      // Assign the parent metric sortBy value (If we are in parent metric);
      if (nodeSelector !== "metrics" && i === splittedNode.length - 2) {
        metricsParent = metricsChildren[item];
        metricsSortBy = metricsChildren[item].sortBy;
      }

      metricsChildren = metricsChildren[item];
    });
    return { metricsChildren, metricsSortBy, metricsParent };
  },
  sortMetrics: (currentMetricList, sortBy) => {
    // Sort metrics based sortBy value
    if (sortBy === "highest") {
      currentMetricList.sort((a, b) => b.value - a.value);
    } else if (sortBy === "lowest") {
      currentMetricList.sort((a, b) => a.value - b.value);
    } else {
      currentMetricList.sort((a, b) => a.order - b.order);
    }
    return currentMetricList;
  },
  getLast7Days: () => {
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let result = [];
    let date = helpers.getAbsoluteDate();
    result.push(days[date.getDay()]);

    for (i = 1; i <= 6; i++) {
      let copiedDate = new Date(date);
      copiedDate.setDate(date.getDate() - i);
      result.push(days[copiedDate.getDay()]);
    }
    return result.reverse();
  },
};

let last7Days = ["7/9", "6/9", "5/9", "4/9", "3/9", "2/9", "1/9"];

// if (histry["1/9"]) {
//   value = history.value
// } else {

// }

// { date: "8/8", value: 1 },

// let dateset = [{"7/9": 0}, {"6/9": 0}, {"5/9": 0}, {"4/9": 0}, {"3/9": 0}, {"2/9": 0}, {"1/9": 0}]

// for (let i = 1; i === 8; i++) {
//   for (let key in dataset){
//     if (key === history[history.length - i].date) {

//     }
//   }
// }

let history = [
  { date: "2/9", value: 1 },
  { date: "3/9", value: 5 },
  { date: "5/9", value: 14 },
  { date: "7/9", value: 23 },
];

let dataset = [
  { date: "7/9", value: 0 },
  { date: "6/9", value: 0 },
  { date: "5/9", value: 0 },
  { date: "4/9", value: 0 },
  { date: "3/9", value: 0 },
  { date: "2/9", value: 0 },
  { date: "1/9", value: 0 },
];

let loop = 1;
let i = 1;

while (loop < 7) {
  dataset.forEach((elem) => {
    if (!history[history.length - i]) {
      elem.value += 0;
    } else if (elem.date === history[history.length - i].date) {
      elem.value += history[history.length - i].value;
      i++;
    } else {
      elem.value += history[history.length - i].value;
    }
    loop++;
  });
}

console.log(dataset);
let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLast7Days() {
  let test = [];
  let date = helpers.getAbsoluteDate();
  test.push(days[date.getDay()]);

  for (i = 1; i <= 6; i++) {
    let copiedDate = new Date(date);
    copiedDate.setDate(date.getDate() - i);
    test.push(days[copiedDate.getDay()]);
  }
  console.log("test.reverse()", test.reverse());
  return test.reverse();
}
getLast7Days();

("7/9"); // => value 23
("6/9"); // => value 14 "The value of the previous date (5/9)"
("5/9"); // => value 14
("4/9"); // => value 5 "The value of the previous date (3/9)"
("3/9"); // => value 5
("2/9"); // => value 1
("1/9"); // => since the date is not available, we don't add it to the average
