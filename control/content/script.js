let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
let tag = "metrics";

Metrics.getMetrics().then((data) => {
  metrics = data;
  Metrics.getHistoryValue(metrics);
  if (typeof sortableListUI !== "undefined") {
    sortableListUI.init("metrics-list", tag);
  }
});

function addItem() {
  metricForm.style.display = "block";
  metricsMain.style.display = "none";
  createAMetric.style.display = "inline";
  updateMetric.style.display = "none";
  //   sortableListUI.addItem(metric); /// this will also add it to the database
}
function cancel() {
  metricForm.style.display = "none";
  metricsMain.style.display = "block";
  createAMetric.style.display = "none";
  updateMetric.style.display = "none";
}

let metricInputFields = {
  metricTitle: "",
  icon: "",
  min: "",
  max: "",
  actionItem: "",
  metricTypes: "",
};

const createMetric = () => {
  return new Promise((resolve, reject) => {
    for (let input in metricInputFields) {
      if (input === "icon") {
        if (!metricInputFields[input]) reject(`Please fill ${input}`);
        continue;
      }
      if (input === "metricTypes") {
        const metricTypes = document.getElementsByName("metricTypes");
        if (!metricTypes[0].checked && !metricTypes[1].checked) {
          reject("Please select a type");
        } else {
          metricInputFields[input] = metricTypes[0].checked
            ? metricTypes[0].value
            : metricTypes[1].value;
        }
      } else {
        console.log("value", input);
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

function getCurrentUser() {
  return new Promise((resolve, reject) => {
    buildfire.auth.getCurrentUser((err, user) => {
      if (err) {
        reject(err);
      } else {
        console.log("I am the user", user);
        resolve(user);
      }
    });
  });
}
getCurrentUser();
