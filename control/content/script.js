let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
let tag = "metrics";

Metrics.getMetrics().then((data) => {
  metrics = data;
  Metrics.getHistoryValue(metrics);
  if (typeof sortableListUI !== "undefined") {
    sortableListUI.init("metricsList", tag);
  }
});

const renderMetrics = (metrics) => {
  for (let metric in metrics) {
    console.log("child", new Metric(metrics[metric]));
    // TODO: call the function that will render metrics (UI)
  }
};

function addItem() {
  let metric = {
    title: "Added Manually Item " + new Date().toLocaleTimeString(),
    imgUrl: "https://img.icons8.com/material/4ac144/256/user-male.png",
    createdOn: new Date(),
    prop1: "blah blah",
  };
  sortableListUI.addItem(metric); /// this will also add it to the database
}

let metricInputFields = {
  title: "",
  icon: "",
  min: "",
  max: "",
  actionItem: "",
  metricTypes: "",
};

const createMetric = () => {
  return new Promise((resolve, reject) => {
    for (let input in metricInputFields) {
      if (input === "metricTypes") {
        const metricTypes = document.querySelectorAll(
          "input#metricType, input#parentType"
        );
        if (!metricTypes[0].checked && !metricTypes[1].checked) {
          reject("Please select a type");
        } else {
          metricInputFields[input] = metricTypes[0].checked
            ? metricTypes[0].value
            : metricTypes[1].value;
        }
      } else {
        let inputValue = document.getElementById(input).value;
        if (!inputValue) reject(`Please fill ${input}`);
        else metricInputFields[input] = inputValue;
      }
    }
    console.log("metricInputFields", metricInputFields);

    // Empty the form fields after submitting
    // for (let key in metricInputFields) metricInputFields[key] = "";
    resolve("Saved successfully");
  });
};

// sortableListUI.onItemClick = (metric, index, divRow) => {
//   ///pop up a windows to edit then when you come back call sortableListUI.updateItem is there is an edit
//   metric.title += " Updated!";
//   metric.lastUpdatedOn = new Date();
//   sortableListUI.updateItem(metric, index, divRow);
// };
