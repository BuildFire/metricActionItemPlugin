// The big object that contains all the metrics
let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
// To save breadcrumb related data
let breadcrumbsHistory = [];
// Used to Initialize metric fields (For add/edit pages' forms)
let metricFields;

let currentUser = {};

let metricsSortBy = "manual";

// SortableList variables (used to manage draggable list)
let sortableList = null;
let metricsContainer = null;

// Get the logged in user
const getCurrentUser = () => {
  return authManager.getCurrentUser().then((user) => {
    currentUser = user;
  });
};

getCurrentUser();

// Login and Logout listners
buildfire.auth.onLogin(() => getCurrentUser());
buildfire.auth.onLogout(() => (currentUser = null));

// Used to refresh (Reset) the widget if the user go to another tab (in control side) then return to the content tab
// Where moving from a tab to another will reset these tabs
buildfire.messaging.sendMessageToWidget({
  cmd: "refresh",
});

Metrics.getMetrics().then(async (result) => {
  metrics = result;

  console.log("All metrics", metrics);
  // To prevent Functional Tests from Applying these lines where it will cause some errors
  if (typeof Sortable !== "undefined") {
    renderInit();
    pushBreadcrumb("Home", { nodeSelector });
  }
});
// Initialize add/edit Forms' Fields
const initMetricFields = (data = {}) => {
  metricFields = {
    title: data.title || "",
    icon: data.icon || "",
    min: data.min || (data.min !== 0 ? "" : 0),
    max: data.max || (data.max !== 0 ? "" : 0),
    actionItem: data.actionItem || {},
    type: data.type || "",
  };

  if (Object.keys(metricFields.actionItem).length !== 0) {
    helpers.getActionItem(data.actionItem.action);
  } else {
    showActionItem.innerHTML = "";
  }

  // Initialize metric's icon
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

  let thumbElement = document.getElementById("icon").getElementsByClassName("btn-delete-icon")[0];
  thumbElement.classList.add("material-icons", "mdc-button__icon")
  thumbElement.innerHTML = "close"

  
  thumbnail.onChange = (url) => {
    metricFields.icon = url;
  };

  thumbnail.onDelete = () => {
    metricFields.icon = null;
  };
};

const addActionItem = (actionItem = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      showIcon: false,
      allowNoAction: true,
    };

    buildfire.actionItems.showDialog(actionItem, options, (err, data) => {
      if (err) reject(err);
      if (data) {
        helpers.getActionItem(data.action);
        metricFields["actionItem"] = data;
      }
    });
  });
};

// Go to Add metric's form page
const goToAddItem = () => {
  metricForm.style.display = "block";
  metricsMain.style.display = "none";
  createAMetric.style.display = "inline";
  updateMetric.style.display = "none";
  // Reset input field to it's initial values
  initMetricFields();
};

// Go to metrics page from add/edit pages
const goToMetricspage = () => {
  metricForm.style.display = "none";
  metricsMain.style.display = "block";
  createAMetric.style.display = "none";
  updateMetric.style.display = "none";
};

// Handle Input fields values' changes
const onFieldChange = (ele) => {
  if (ele.id === "min" || ele.id === "max") {
    metricFields[ele.id] = parseInt(ele.value);
    return;
  }

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
      renderInit();
      goToMetricspage();
    });
  }
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
      renderInit();
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

// SortableList component
// To initialize and prepare metrics to be rendered
const renderInit = () => {
  metricsContainer = metricsList;
  // Extract the desired metrics (children) from the big object using nodeSelector
  let metricsChildren = helpers.nodeSplitter(nodeSelector, metrics);

  let currentMetricList = [];
  // Prepare metrics to be rendered (Object to Array)
  for (let metricId in metricsChildren) {
    metricsChildren[metricId].id = metricId;
    Metric.getHistoryValue(metricsChildren[metricId]);
    currentMetricList.push(metricsChildren[metricId]);
  }

  let spinner = document.getElementById("spinner");
  if (currentMetricList.length === 0) {
    spinner.innerHTML = "No metrics have been added yet.";
    spinner.classList.remove("loaded");
    metricsContainer.innerHTML = "";
  } else {
    spinner.innerHTML = "";
    spinner.classList.add("loaded");
    metricsContainer.innerHTML = "";
  }

  currentMetricList = helpers.sortMetrics(currentMetricList, metricsSortBy);

  render(currentMetricList);
};

// To render metrics
const render = (items) => {
  sortableList = new buildfire.components.SortableList(
    metricsContainer,
    items || []
  );

  if (metricsSortBy === "highest" || metricsSortBy === "lowest") {
    // Disable manual sorting
    sortableList.sortableList.options.disabled = true;
    metricsList.classList.add("disabledDrag");
    // Remove on update functionality
  } else {
    metricsList.classList.remove("disabledDrag");
  }
  // Overwrite the generic method (onItemClick) (on metric's title click)
  sortableList.onItemClick = (item, divRow) => {
    clickItem(item);
  };
  // Overwrite the generic method (onDeleteItem)
  sortableList.onDeleteItem = (item, index, callback) => {
    deleteItem(item, index, callback);
  };
  // Overwrite the generic method (onOrderChange)
  sortableList.onOrderChange = (item, oldIndex, newIndex) => {
    orderChange();
  };

  sortableList.onUpdateItem = (item, index) => {
    updateItem(item);
  };
};

const clickItem = (item) => {
  // If it is parent then go to its children
  if (item.type === "parent") {
    nodeSelector += `.${item.id}.metrics`;
    renderInit();
    pushBreadcrumb(item.title, { nodeSelector });
    buildfire.messaging.sendMessageToWidget({
      title: item.title,
      nodeSelector,
    });
  }
};

const deleteItem = (item, index, callback) => {
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
        Metrics.delete({ nodeSelector, metricsId: metrics.id }, item.id)
          .then((result) => {
            metrics = result;
            callback(metrics);
          })
          .finally(() => {
            renderInit();
          });
      }
    }
  );
};

const orderChange = () => {
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

const updateItem = (item) => {
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

const pushBreadcrumb = (breadcrumb, data) => {
  breadcrumbsManager.breadcrumb(breadcrumb, data);
};

buildfire.messaging.onReceivedMessage = (message) => {
  console.log(
    "Message has been received",
    message.nodeSelector,
    breadcrumbsHistory,
    nodeSelector
  );
  // If message has title then it is a push breacrumb
  if (message.title) {
    nodeSelector = message.nodeSelector;
    pushBreadcrumb(message.title, { nodeSelector });
    // If it is not then it is a backward breadcrumb
  } else {
    if (nodeSelector !== message.nodeSelector) {
      nodeSelector = message.nodeSelector;
      bread.removeChild(bread.lastChild);
      bread.removeChild(bread.lastChild);
      breadcrumbsHistory.pop();
    }
  }
  renderInit();
  goToMetricspage();
};

const onSortByChange = () => {
  let sortBy = document.getElementById("sortBy").value;
  Metrics.sortBy(
    {
      nodeSelector,
      metricsId: metrics.id,
    },
    sortBy
  ).then((result) => {
    metrics = result;
    metricsSortBy = sortBy;
    if (metricsSortBy === "highest" || metricsSortBy === "lowest") {
      // Disable manual sorting
      sortableList.sortableList.options.disabled = true;
    }
    renderInit();
  });
};
