// The big object that contains all the metrics
let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
// To save breadcrumb related data
let breadcrumbsHistory = [];
// Initialize metric fields (For add/edit pages' forms)
let metricFields;
let currentUser = {};

// SortableList variables (used to manage draggable list)
let sortableList = null;
let metricsContainer = null;

// Get the logged in user
authManager.getCurrentUser().then((user) => {
  currentUser = user;
});

Metrics.getMetrics().then(async (result) => {
  metrics = result;

  console.log("All metrics", metrics);
  // To prevent Functional Tests from Applying these lines where it will cause some errors
  if (typeof Sortable !== "undefined") {
    await Settings.load().then(() => {
      renderInit("metricsList");
      pushBreadcrumb("Home", { nodeSelector });
    });
  }
});
// Initialize add/edit Forms' Fields
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
  title.value = metricFields.title;
  min.value = metricFields.min;
  max.value = metricFields.max;
  let maxInput = document.getElementById("max"),
    minInput = document.getElementById("min");
  if (metricFields.type === "") {
    parentType.checked = false;
    metricType.checked = false;
    maxInput.disabled = false;
    minInput.disabled = false;
  } else if (metricFields.type === "parent") {
    parentType.checked = true;
    maxInput.disabled = true;
    minInput.disabled = true;
  } else {
    metricType.checked = true;
    maxInput.disabled = false;
    minInput.disabled = false;
  }
};

// Initialize metric's icon
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

// Go to Add metric's form page
function goToAddItem() {
  metricForm.style.display = "block";
  metricsMain.style.display = "none";
  createAMetric.style.display = "inline";
  updateMetric.style.display = "none";
  // Reset input field to it's initial values
  initMetricFields();
}

// Go to metrics page from add/edit pages
function goToMetricspage() {
  metricForm.style.display = "none";
  metricsMain.style.display = "block";
  createAMetric.style.display = "none";
  updateMetric.style.display = "none";
}

// Handle Input fields values' changes
const onFieldChange = (ele) => {
  metricFields[ele.id] = ele.value;
};

// Handle Input fields values' changes (Radio buttons)
const onRadioChange = (value) => {
  metricFields["type"] = value;

  let maxInput = document.getElementById("max"),
    minInput = document.getElementById("min");
  if (value === "parent") {
    maxInput.disabled = true;
    minInput.disabled = true;
  } else {
    maxInput.disabled = false;
    minInput.disabled = false;
  }
};

const createMetric = () => {
  // Metric fields validation
  if (inputValidation()) {
    // Empty the form fields after submitting
    metricFields.createdBy = currentUser.firstName;
    metricFields.lastUpdatedBy = currentUser.firstName;
    metricFields.order = metricsList.childNodes.length;
    console.log(
      "everything",
      nodeSelector,
      metrics.id,
      new Metric(metricFields)
    );
    Metrics.insert(
      {
        nodeSelector,
        metricsId: metrics.id,
      },
      new Metric(metricFields)
    ).then((result) => {
      metrics = result;
      if (typeof Sortable !== "undefined") {
        renderInit("metricsList");
      }
      goToMetricspage();
    });
  }
};

const inputValidation = () => {
  const { title, icon, actionItem, min, max, type } = metricFields;

  if (!title) {
    helpers.inputAlert("please add metric title");
    return false;
  }
  if (Object.keys(actionItem).length === 0) {
    helpers.inputAlert("Please add an action item");
    return false;
  }
  if (!icon) {
    helpers.inputAlert("Please add icon");
    return false;
  }
  if (!type) {
    helpers.inputAlert("Please add metric type");
    return false;
  }
  if (type === "parent") {
    delete metricFields.min;
    delete metricFields.max;
  } else if (type === "metric") {
    if (min !== 0 && !min) {
      helpers.inputAlert("Please add min value");
      return false;
    }
    if (max !== 0 && !max) {
      helpers.inputAlert("Please add max value");
      return false;
    }
  }
  return true;
};

const updateMetrics = (item) => {
  // Metric fields validation
  if (inputValidation()) {
    let updateObj = {};
    for (let prop in metricFields) {
      // To determine what fileds are needed to be updated
      if (metricFields[prop] !== item[prop]) {
        updateObj[prop] = metricFields[prop];
        console.log("thus is", prop, metricFields[prop]);
      }
    }
    if (
      updateObj.type === "parent" ||
      (updateObj.type !== "metric" && item.type === "parent")
    ) {
      delete metricFields.min;
      delete metricFields.max;
    } else if (updateObj.type === "metric" && item.type === "parent") {
      updateObj.max = item.type.max;
      updateObj.min = item.type.min;
    }
    Metrics.update(
      { nodeSelector, metricsId: metrics.id },
      updateObj,
      item.id
    ).then((result) => {
      metrics = result;
      if (typeof Sortable !== "undefined") {
        renderInit("metricsList");
      }
      goToMetricspage();
    });
  }
};

const addActionItem = (actionItem = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      showIcon: false,
      allowNoAction: true,
    };
    buildfire.actionItems.showDialog(actionItem, options, (err, data) => {
      if (err) reject(err);

      metricFields["actionItem"] = data || {};
    });
  });
};

// Handle Breadcrumbs
const pushBreadcrumb = (breadcrumb, data) => {
  return new Promise((resolve, reject) => {
    // buildfire.history.push(breadcrumb, data);
    breadcrumbsHistory.push(breadcrumb);
    let crumb = document.createElement("span");
    crumb.innerHTML =
      breadcrumb === "Home" ? `${breadcrumb}` : ` / ${breadcrumb}`;
    crumb.style.cursor = "pointer";
    crumb.setAttribute("arrayIndex", breadcrumbsHistory.length - 1);
    crumb.onclick = () => {
      if (data.nodeSelector === nodeSelector) {
        return;
      }
      let breadLength = breadcrumbsHistory.length;
      console.log("go to ", +crumb.getAttribute("arrayIndex"));
      for (
        let i = 0;
        i < breadLength - 1 - +crumb.getAttribute("arrayIndex");
        i++
      ) {
        bread.removeChild(bread.lastChild);
        breadcrumbsHistory.pop();
      }
      nodeSelector = data.nodeSelector;
      buildfire.messaging.sendMessageToWidget({ nodeSelector });

      if (typeof Sortable !== "undefined") {
        renderInit("metricsList");
      }
      goToMetricspage();
    };
    bread.appendChild(crumb);
    resolve(true);
  });
};

// SortableList component
// To initialize and prepare metrics to be rendered
const renderInit = (elementId) => {
  metricsContainer = document.getElementById(elementId);
  // Extract the desired metrics (children) from the big object using nodeSelector
  let metricsChildren = helpers.nodeSplitter(nodeSelector, metrics);
  let currentMetricList = [];
  // Prepare metrics to be rendered (Object to Array)
  for (let metricId in metricsChildren) {
    metricsChildren[metricId].id = metricId;
    Metric.getHistoryValue(metricsChildren[metricId]);
    currentMetricList.push(metricsChildren[metricId]);
  }

  if (currentMetricList.length === 0) {
    metricsContainer.innerHTML = "No items have been added yet.";
  } else metricsContainer.innerHTML = "";

  console.log("Settings.sortBy", Settings.sortBy);

  if (Settings.sortBy === "highest") {
    currentMetricList.sort((a, b) => b.value - a.value);
  } else if (Settings.sortBy === "lowest") {
    currentMetricList.sort((a, b) => a.value - b.value);
  } else {
    currentMetricList.sort((a, b) => a.order - b.order);
  }

  render(currentMetricList);
};

// To render metrics
const render = (items) => {
  sortableList = new buildfire.components.SortableList(
    metricsContainer,
    items || []
  );

  // Overwrite the generic method (onItemClick) (on metric's title click)
  sortableList.onItemClick = (item, divRow) => {
    if (item.type === "parent") {
      nodeSelector += `.${item.id}.metrics`;
      if (typeof Sortable !== "undefined") {
        renderInit("metricsList");
      }
      pushBreadcrumb(item.title, { nodeSelector });
      buildfire.messaging.sendMessageToWidget({
        title: item.title,
        nodeSelector,
      });
    }
  };
  // Overwrite the generic method (onDeleteItem)
  sortableList.onDeleteItem = (item, index, callback) => {
    buildfire.notifications.confirm(
      {
        message: "Are you sure you want to delete " + item.title + "?",
        confirmButton: { text: "Delete", key: "y", type: "danger" },
        cancelButton: { text: "Cancel", key: "n", type: "default" },
      },
      (e, data) => {
        if (e) console.error(e);
        if (data.selectedButton.key == "y") {
          sortableList.items.splice(index, 1);
          Metrics.delete({ nodeSelector, metricsId: metrics.id }, item.id).then(
            (result) => {
              metrics = result;
              callback(metrics);
            }
          );
        }
      }
    );
  };
  // Overwrite the generic method (onOrderChange)
  sortableList.onOrderChange = (item, oldIndex, newIndex) => {
    let orderObj = {};
    metricsContainer.childNodes.forEach((e) => {
      const metricId = e.getAttribute("id"),
        index = parseInt(e.getAttribute("arrayIndex"));
      orderObj[metricId] = index;
    });
    Metrics.order({ nodeSelector, metricsId: metrics.id }, orderObj)
      .then((result) => {
        metrics = result;
      })
      .catch(console.log);
  };

  sortableList.onUpdateItem = (item, index) => {
    item.lastUpdatedBy = currentUser.firstName;
    initMetricFields(item);
    metricForm.style.display = "block";
    updateMetric.style.display = "inline";
    createAMetric.style.display = "none";
    metricsMain.style.display = "none";
    updateMetric.onclick = () => {
      updateMetrics(item);
    };
  };
};

buildfire.messaging.onReceivedMessage = (message) => {
  console.log(
    "Message has been received",
    message.nodeSelector,
    breadcrumbsHistory,
    nodeSelector
  );
  if (message.title) {
    nodeSelector = message.nodeSelector;
    pushBreadcrumb(message.title, { nodeSelector });
  } else {
    if (nodeSelector !== message.nodeSelector) {
      nodeSelector = message.nodeSelector;
      bread.removeChild(bread.lastChild);
      breadcrumbsHistory.pop();
    }
  }
  renderInit("metricsList");
  goToMetricspage();
};
