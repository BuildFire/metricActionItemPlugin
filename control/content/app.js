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

// To get all metrics and start rendering
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
    min: data.min || 0,
    max: data.max || 100,
    actionItem: data.actionItem || {},
    type: data.type || "metric",
  };

  if (Object.keys(metricFields.actionItem).length !== 0) {
    helpers.getActionItem(data.actionItem.action);
  } else {
    showActionItem.innerHTML = "No Action Selected";
  }

  // Initialize metric's icon
  initIconComponent(data.icon);

  title.value = metricFields.title;
  if (metricFields.type === "metric") {
    // document.getElementById('min-lable').style.display = "block";
    // document.getElementById('max-lable').style.display = "block";
    min.value = metricFields.min;
    max.value = metricFields.max;
  } else {
    // document.getElementById('min-lable').style.display = "none";
    // document.getElementById('max-lable').style.display = "none";
  }

  // if (Object.keys(data).length !== 0) {
  document.querySelectorAll(".mdc-floating-label").forEach((ele) => {
    ele.classList.add("mdc-floating-label--float-above");
  });
  document.querySelectorAll(".mdc-notched-outline").forEach((ele) => {
    ele.classList.add("mdc-notched-outline--notched");
  });
  // }

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
    document
      .querySelectorAll(
        "#min-lable .mdc-floating-label, #max-lable .mdc-floating-label"
      )
      .forEach((ele) => {
        ele.classList.remove("mdc-floating-label--float-above");
      });
    document
      .querySelectorAll(
        "#min-lable .mdc-notched-outline, #max-lable .mdc-notched-outline"
      )
      .forEach((ele) => {
        ele.classList.remove("mdc-notched-outline--notched");
      });
    // Reset min and max input fields
    maxInput.value = "";
    minInput.value = "";
  } else {
    metricType.checked = true;
    maxInput.disabled = false;
    minInput.disabled = false;
  }
};

const initMaterialComponents = () => {
  document.querySelectorAll(".mdc-text-field").forEach((field) => {
    mdc.textField.MDCTextField.attachTo(field);
  });

  document
    .querySelectorAll(".mdc-text-field-helper-text")
    .forEach((helperField) => {
      mdc.textField.MDCTextFieldHelperText.attachTo(helperField);
    });

  document.querySelectorAll(".mdc-button").forEach((btn) => {
    mdc.ripple.MDCRipple.attachTo(btn);
  });

  document.querySelectorAll(".mdc-fab").forEach((btn) => {
    mdc.ripple.MDCRipple.attachTo(btn);
  });

  document.querySelectorAll(".mdc-radio").forEach((radio) => {
    mdc.radio.MDCRadio.attachTo(radio);
  });

  document.querySelectorAll(".mdc-checkbox").forEach((checkbox) => {
    mdc.checkbox.MDCCheckbox.attachTo(checkbox);
  });

  document.querySelectorAll(".mdc-chip-set").forEach((chip) => {
    mdc.chips.MDCChip.attachTo(chip);
  });
};

// Initialize metric's icon
const initIconComponent = (imageUrl = "") => {
  let thumbnail;
  thumbnail = new buildfire.components.images.thumbnail("#icon", {
    imageUrl: imageUrl,
    title: "Icon",
    dimensionsLabel: "400x400",
  });

  let thumbElement = document
    .getElementById("icon")
    .getElementsByClassName("btn-delete-icon")[0];
  thumbElement.classList.add("material-icons", "mdc-button__icon");
  thumbElement.innerHTML = "close";

  thumbnail.onChange = (url) => {
    metricFields.icon = url;
    iconInput.value = url;
    iconInput.focus();
    iconInput.blur();
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

const removeActionItem = () => {
  metricFields["actionItem"] = {};
  helpers.getActionItem();
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
  iconInput.focus();
  iconInput.blur();
  metricForm.style.display = "none";
  metricsMain.style.display = "block";
  createAMetric.style.display = "none";
  updateMetric.style.display = "none";
  document.querySelectorAll(".mdc-floating-label").forEach((ele) => {
    ele.classList.remove("mdc-floating-label--float-above");
  });
  document.querySelectorAll(".mdc-notched-outline").forEach((ele) => {
    ele.classList.remove("mdc-notched-outline--notched");
  });
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

    // Reset min and max input fields
    maxInput.value = "";
    minInput.value = "";

    document
      .querySelectorAll(
        "#min-lable .mdc-floating-label, #max-lable .mdc-floating-label"
      )
      .forEach((ele) => {
        ele.classList.remove("mdc-floating-label--float-above");
      });
    document
      .querySelectorAll(
        "#min-lable .mdc-notched-outline, #max-lable .mdc-notched-outline"
      )
      .forEach((ele) => {
        ele.classList.remove("mdc-notched-outline--notched");
      });
  } else {
    minInput.focus();
    maxInput.focus();
    maxInput.disabled = false;
    minInput.disabled = false;
    metricFields["min"] = 0;
    metricFields["max"] = 100;

    initMetricFields(metricFields);
  }
};

const createMetric = () => {
  // Metric fields validation
  if (inputValidation()) {
    // Empty the form fields after submitting
    metricFields.createdBy = `${currentUser.firstName} ${currentUser.lastName}`;
    metricFields.lastUpdatedBy = `${currentUser.firstName} ${currentUser.lastName}`;
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

const updateMetrics = async (item) => {
  // Metric fields validation
  if (inputValidation()) {
    let updateObj = {};
    for (let prop in metricFields) {
      // To determine which fileds are needed to be updated
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
      // To ask the user if he really want to change the type of metric from (parent to metric),
      // where this action is irreversable (it will delete al the children of the parent metric )
      let isAccepted;
      await askBeforeUpdate().then((result) => {
        isAccepted = result;
      });
      if (isAccepted) {
        updateObj.metrics = {};
      } else {
        return;
      }
    }
    Metrics.update(
      { nodeSelector, metricsId: metrics.id },
      updateObj,
      item.id,
      `${currentUser.firstName} ${currentUser.lastName}`
    ).then((result) => {
      metrics = result;
      renderInit();
      goToMetricspage();
    });
  }
};

const inputValidation = () => {
  const { title, icon, actionItem, min, max, type } = metricFields;
  let isValid = true;
  if (!title) {
    helpers.inputError(
      "title-lable",
      "title-helper-text",
      "Please add metric title"
    );
    isValid = false;
  } else if (title.length > 50) {
    helpers.inputError(
      "title-lable",
      "title-helper-text",
      "Metric's title must be less than 50 characters long"
    );
    isValid = false;
  }

  if (type === "parent") {
    delete metricFields.min;
    delete metricFields.max;
  } else if (type === "metric") {
    if (min !== 0 && !min) {
      helpers.inputError(
        "min-lable",
        "min-helper-text",
        "Please add min value"
      );
      isValid = false;
    }
    if (max !== 0 && !max) {
      helpers.inputError(
        "max-lable",
        "max-helper-text",
        "Please add max value"
      );
      isValid = false;
    }
    if (max < min) {
      helpers.inputError(
        "min-lable",
        "min-helper-text",
        "Min value should be less than Max value"
      );
      isValid = false;
    }
  }

  if (!icon) {
    helpers.inputError("icon-lable", "icon-helper-text", "Please add icon");
    isValid = false;
  }
  let invalidInput = document.querySelector(".mdc-text-field--invalid");
  if (invalidInput)
    invalidInput.scrollIntoView({ behavior: "smooth", block: "center" });
  return isValid;
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
    let newMetric = new Metric(metricsChildren[metricId]);
    Metric.getHistoryValue(newMetric);
    currentMetricList.push(newMetric);
  }

  // To show messages while metrics being rendered or if there is no metrics at all
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
  if (sortableList) {
    sortableList.sortableList.destroy();
  }

  sortableList = new buildfire.components.SortableList(
    metricsContainer,
    items || []
  );

  if (metricsSortBy === "highest" || metricsSortBy === "lowest") {
    // Disable manual sorting
    sortableList.sortableList.option("disabled", true);
    metricsList.querySelectorAll("button.cursor-grab").forEach((btn) => {
      btn.classList.add("disabledDrag");
    });
    // Remove on update functionality
  } else {
    metricsList.querySelectorAll("button.cursor-grab").forEach((btn) => {
      btn.classList.remove("disabledDrag");
    });
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

// Trigered when a user click on the metric's title or icon
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

// Trigered when a user delete a metric
const deleteItem = (item, index, callback) => {
  let message =
    item.type === "metric"
      ? `Are you sure you want to delete ${item.title}?`
      : `<span class="text-danger">Warning: (Deleting this metric will also delete all of it's children).</span> <br> Are you sure you want to delete ${item.title}?`;
  buildfire.notifications.confirm(
    {
      message,
      confirmButton: { text: "Delete", key: "y", type: "danger" },
      cancelButton: { text: "Cancel", key: "n", type: "default" },
    },
    (e, data) => {
      if (e) console.error(e);
      if (data && data.selectedButton.key == "y") {
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

// Trigered when a user change the order of the metrics
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

// Trigered when a user update a metric
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

const askBeforeUpdate = () => {
  return new Promise((resolve, reject) => {
    let message = `<span class="text-danger">Warning: (Changing the type of this metric (parent to metric) will also delete all of it's children).</span> <br> Are you sure you want to update this metirc?`;
    buildfire.notifications.confirm(
      {
        message,
        confirmButton: { text: "Update", key: "y", type: "danger" },
        cancelButton: { text: "Cancel", key: "n", type: "default" },
      },
      (e, data) => {
        if (e) console.error(e);
        if (data && data.selectedButton.key == "y") {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
};

// Manage breadcrumbs
const pushBreadcrumb = (breadcrumb, data) => {
  breadcrumbsManager.breadcrumb(breadcrumb, data);
};

// To synchronize with the widget
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

// To handle users' choices for sorting
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
      sortableList.sortableList.option("disabled", true);
    }
    renderInit();
  });
};
