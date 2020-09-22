let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
let tag = "metrics";

let breadcrumpsHistory = [];

// initialize metric fields;
let metricFields;

const initMetricFields = (data = {}) => {
  metricFields = {
    metricTitle: data.metricTitle || "",
    icon: data.icon || "",
    min: data.min || 0,
    max: data.max || 0,
    actionItem: data.actionItem || {},
    metricTypes: data.metricTypes || "",
  };
};

const initIconComponent = (imageUrl = "") => {
  let thumbnail;
  thumbnail = new buildfire.components.images.thumbnail("#icon", {
    imageUrl: imageUrl,
    title: "Icon",
    dimensionsLabel: "400x400",
  });

  thumbnail.onChange = (url) => {
    metricFields.icon = url;
  };

  thumbnail.onDelete = () => {
    metricFields.icon = null;
  };
};
// Init
initMetricFields();
initIconComponent();

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

  // Reset input field to it's initial value after saving it in the database

  initMetricFields();
  //   sortableListUI.addItem(metric); /// this will also add it to the database
}
function cancel() {
  metricForm.style.display = "none";
  metricsMain.style.display = "block";
  createAMetric.style.display = "none";
  updateMetric.style.display = "none";

  // Reset input field to it's initial value
  initMetricFields();
}

const onFieldChange = (field) => {
  metricFields[field] = document.getElementById(field).value;
};

const onRadioChange = (value) => {
  metricFields["metricType"] = value;
};

const createMetric = () => {
  return new Promise((resolve, reject) => {
    const {
      metricTitle,
      icon,
      actionItem,
      min,
      max,
      metricType,
    } = metricFields;
    // Metric fields validation
    if (!metricTitle) reject(`Please add a metric title`);
    if (min !== 0 && !min) reject(`Please add a max value`);
    if (max !== 0 && !max) reject(`Please add a min value`);
    if (!Object.keys(actionItem)) reject(`Please add an action`);
    if (!icon) reject(`Please add an icon`);
    if (!metricType) reject("Please select metric type");

    // Empty the form fields after submitting
    resolve("Saved successfully");
  }).catch(console.log);
};

// sortableListUI.onItemClick = (metric, index, divRow) => {
//   ///pop up a windows to edit then when you come back call sortableListUI.updateItem is there is an edit
//   metric.title += " Updated!";
//   metric.lastUpdatedOn = new Date();
//   sortableListUI.updateItem(metric, index, divRow);
// };

const updateActionItem = (actionItem = {}) => {
  // actionItem <optional> , options <optional> , callback
  return new Promise((resolve, reject) => {
    const options = {
      showIcon: false,
      allowNoAction: true,
    };
    buildfire.actionItems.showDialog(actionItem, options, (err, data) => {
      if (err) reject(err);

      metricFields["actionItem"] = data;
    });
  });
};

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

// Handle Breadcrumbs
// Get Breadcrumbs
const getBreadcrumbs = () => {
  return new Promise((resolve, reject) => {
    buildfire.history.get(
      {
        pluginBreadcrumbsOnly: true,
      },
      (err, result) => {
        if (err) reject(err);
        console.info("Current Plugin Breadcrumbs", result);
        resolve(result);
      }
    );
  });
};

// Add Breadcrumb
const pushBreadcrumb = (breadcrumb, data) => {
  return new Promise((resolve, reject) => {
    // nodeSelector = nodeSelector + `.metrics.id.metrics`
    buildfire.history.push(breadcrumb, data);
    resolve(true);
  });
};

// Remove Breadcrumb
const popBreadcrumb = () => {
  return new Promise((resolve, reject) => {
    nodeSelector = nodeSelector.split()
    buildfire.history.pop();
    resolve(true);
  });
};

// Listen to breadcrumb history removal
buildfire.history.onPop((breadcrumb) => {
  // Show / Hide views
  // document.getElementById(breadcrumb.options.elementToShow).style.display = "block";
});
