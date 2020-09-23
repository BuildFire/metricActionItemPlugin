let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";

let breadcrumbsHistory = ["Home"];

// initialize metric fields;
let metricFields;

let currentUser = {};

getCurrentUser().then((user) => {
  currentUser = user;
});

Metrics.getMetrics().then(async (data) => {
  metrics = data.data;
  metrics.id = data.id;

  Metrics.getHistoryValue(metrics);

  if (typeof sortableListUI !== "undefined") {
    sortableListUI.init("metrics-list");
    pushBreadcrumb("Home");
  }
});

const initMetricFields = (data = {}) => {
  metricFields = {
    title: data.title || "",
    icon: data.icon || "",
    min: data.min || "",
    max: data.max || "",
    actionItem: data.actionItem || {},
    type: data.type || "",
  };
  initIconComponent(data.icon);
  //   let iconImage = document.querySelectorAll("img[alt='Background Image']");
  title.value = metricFields.title;
  min.value = metricFields.min;
  max.value = metricFields.max;
  max.value = metricFields.max;
  //   actionItem.value = item.actionItem;
  //   metricFields.icon ? (iconImage[0].src = metricFields.icon) : (iconImage[0].src = "");
  //   metricFields.icon
  //     ? iconImage[0].classList.remove("hidden")
  //     : iconImage[0].classList.add("hidden");
  if (metricFields.type === "") {
    parentType.checked = false;
    metricType.checked = false;
  } else if (metricFields.type === "parent") {
    parentType.checked = true;
  } else {
    metricType.checked = true;
  }
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
  metricFields["type"] = value;
};

const createMetric = () => {
  const { title, icon, actionItem, min, max, type } = metricFields;
  // Metric fields validation
  if (!title) return `Please add a metric title`;
  if (min !== 0 && !min) return `Please add a max value`;
  if (max !== 0 && !max) return `Please add a min value`;
  if (!Object.keys(actionItem)) return `Please add an action`;
  if (!icon) return `Please add an icon`;
  if (!type) return "Please select metric type";
  // Empty the form fields after submitting
  metricFields.createdBy = currentUser.firstName;
  metricFields.lastUpdatedBy = currentUser.firstName;
  console.log("everything", nodeSelector, metrics.id, new Metric(metricFields));
  Metrics.insert(
    { nodeSelector, metricsId: metrics.id },
    new Metric(metricFields)
  ).then((metric) => {
    sortableListUI.sortableList.append(metric);
    cancel();
  });
};

const updateMetrics = (item, divRow) => {
  let updateObj = {};
  for (let prop in metricFields) {
    if (metricFields[prop] !== item[prop]) {
      updateObj[prop] = metricFields[prop];
      console.log("thus is", prop, metricFields[prop]);
    }
  }
  console.log(
    "hala",
    { nodeSelector, metricsId: metrics.id },
    updateObj,
    item.id
  );
  Metrics.update(
    { nodeSelector, metricsId: metrics.id },
    updateObj,
    item.id
  ).then((data) => {
    divRow.parentNode.removeChild(divRow);
    sortableListUI.sortableList.append(metricFields);
    sortableListUI.sortableList.reIndexRows();
    cancel();
  });
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
        resolve(user);
      }
    });
  });
}

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
const pushBreadcrumb = (breadcrumb, id) => {
  return new Promise((resolve, reject) => {
    if (id && metrics[nodeSelector][id]["type"] === "parent") {
      nodeSelector += `.${id}.metrics`;
    } else if (id && metrics[nodeSelector][id]["type"] === "metric") {
      nodeSelector += `.${id}`;
    }

    buildfire.history.push(breadcrumb, { nodeSelector });
    breadcrumbsHistory.push({ title: breadcrumb, nodeSelector });

    let oldNodeSelector = nodeSelector;
    let crumb = document.createElement("span");
    crumb.innerHTML =
      breadcrumb === "Home" ? `${breadcrumb}` : ` / ${breadcrumb}`;
    crumb.onclick = () => {
      console.log("go to ", oldNodeSelector);
    };

    bread.appendChild(crumb);


    resolve(true);
  });
};

// Handle Breadcrumbs
// const breadcrumbsUI = () => {
//   getBreadcrumbs().then((data) => {
//     data.forEach((crumb, i) => {
//       if (i === 0)
//         bread.innerHTML += `<span index="${i}">${crumb.title}</span>`;
//       else bread.innerHTML += `<span index="${i}">/ ${crumb.title}</span>`;
//     });
//   });
// };

// Remove Breadcrumb
const popBreadcrumb = () => {
  return new Promise((resolve, reject) => {
    nodeSelector = nodeSelector.split();
    buildfire.history.pop();
    resolve(true);
  });
};

// Listen to breadcrumb history removal
buildfire.history.onPop((breadcrumb) => {
  console.log("yalla hey");
  // Show / Hide views
  // document.getElementById(breadcrumb.options.elementToShow).style.display = "block";
});

/* 
step 1
nodeSelector = metrics 
step 2 
Marketing => onclick 
1- nodeSelector = metrics.id
2- bread
step 1 
step 1 
step 1 
step 1 
step 1 
step 1 
step 1 
step 1 
step 1 
step 1 
step 1 
step 1 
step 1 
*/
