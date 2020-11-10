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

let wysiwygValue = "";

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
Metrics.getMetrics().then((result) => {
  metrics = result;
  initMaterialComponents();
  // To prevent Functional Tests from Applying these lines where it will cause some errors
  renderInit();
  pushBreadcrumb("Home", { nodeSelector });
});

// Initialize WYSIWYG
const initWysiwyg = (callback) => {
  var tmrDelay = null;
  tinymce.init({
    selector: "textarea",
    setup: (editor) => {
      editor.on("change keyup", (e) => {
        if (tmrDelay) clearTimeout(tmrDelay);
        tmrDelay = setTimeout(() => {
          if (
            tinymce.activeEditor.getContent() !== wysiwygValue ||
            wysiwygValue === ""
          ) {
            wysiwygValue = tinymce.activeEditor.getContent();
            updateDescription(wysiwygValue);
            tinymce.activeEditor.save();
          }
        }, 1000);
      });
      editor.on("init", () => {
        callback();
      });
    },
  });
};

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

  if (metricFields.type === "parent") {
    parentType.checked = true;
    setTimeout(() => {
      max.disabled = true;
      min.disabled = true;
    }, 0);

    // Reset min and max input fields
    max.value = "";
    min.value = "";
  } else {
    metricType.checked = true;
    min.value = metricFields.min;
    max.value = metricFields.max;
    max.disabled = false;
    min.disabled = false;
  }
  // To give all the input fields the required classes where some inputs need to focus on to get the required class to float, for example
  document.querySelectorAll("#min, #max, #title").forEach((ele) => {
    ele.focus();
    ele.blur();
  });
};

const wysiwygSetContent = (description) => {
  wysiwygValue = description;
  if (tinymce.activeEditor) {
    tinymce.activeEditor.setContent(description || "");
  } else {
    initWysiwyg(() => {
      tinymce.activeEditor.setContent(description || "");
    });
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

  document.querySelectorAll(".mdc-radio").forEach((radio) => {
    mdc.radio.MDCRadio.attachTo(radio);
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

const addActionItem = (actionItem = { action: "linkToApp" }) => {
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
  helpers.showElem("#metricForm");
  helpers.showElem("#createAMetric", "inline");
  helpers.hideElem("#metricsMain, #updateMetric, #tinymce-19");
  // Reset input field to it's initial values
  initMetricFields();
};

// Go to metrics page from add/edit pages
const goToMetricspage = () => {
  // To reset all the error message if found in the form's page before leaving
  document.querySelectorAll("input").forEach((ele) => {
    ele.focus();
    ele.blur();
  });

  helpers.showElem("#metricsMain, #tinymce-19");
  helpers.hideElem("#metricForm, #createAMetric, #updateMetric");
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
  initMetricFields(metricFields);
};

const createMetric = () => {
  // Metric fields validation
  if (inputValidation()) {
    // Empty the form fields after submitting
    metricFields.createdBy = currentUser.username || null;
    metricFields.lastUpdatedBy = currentUser.username || null;
    metricFields.order = metricsList.childNodes.length;

    // Save metric
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
    updateObj.lastUpdatedBy = currentUser.username || null;

    for (let prop in metricFields) {
      // To determine which fileds are needed to be updated
      if (metricFields[prop] !== item[prop]) {
        updateObj[prop] = metricFields[prop];
      }
    }

    if (
      updateObj.type === "parent" ||
      (updateObj.type !== "metric" && item.type === "parent")
    ) {
      delete metricFields.min;
      delete metricFields.max;
    }
    // If updating the metric type from metric to parent
    if (updateObj.type === "metric" && item.type === "parent") {
      // To ask the user if he really want to change the type of metric from (parent to metric),
      // where this action is irreversable (it will delete al the children of the parent metric)
      return confirmMetricUpdate("parent").then((accepted) => {
        if (accepted) {
          updateObj.metrics = {};
          updateObj.history = [];
          updateMetricDB(updateObj, item.id);
        }
      });
    }
    // If updating the metric type from metric to parent
    else if (updateObj.type === "parent" && item.type === "metric") {
      return confirmMetricUpdate("metric").then((accepted) => {
        if (accepted) {
          updateObj.history = [];
          updateObj.min = null;
          updateObj.max = null;
          updateMetricDB(updateObj, item.id);
        }
      });
    } else {
      updateMetricDB(updateObj, item.id);
    }
  }
};

const updateMetricDB = (updateObj, itemId) => {
  // Update metric
  Metrics.update(
    { nodeSelector, metricsId: metrics.id },
    updateObj,
    itemId
  ).then((result) => {
    metrics = result;
    renderInit();
    goToMetricspage();
  });
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
  }

  if (type === "parent") {
    delete metricFields.min;
    delete metricFields.max;
  } else if (type === "metric") {
    if ((min !== 0 && !min) || min < 0) {
      let message = "Please add min value";
      if (min < 0) {
        message = "Min value can't be negative";
      }
      helpers.inputError("min-lable", "min-helper-text", message);
      isValid = false;
    }
    if ((max !== 0 && !max) || max < 0) {
      let message = "Please add max value";
      if (max < 0) {
        message = "Max value can't be negative";
      }
      helpers.inputError("max-lable", "max-helper-text", message);
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
  let readyMetrics = helpers.nodeSplitter(nodeSelector, metrics);
  let metricsChildren = readyMetrics.metricsChildren;

  wysiwygSetContent(readyMetrics.description);

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
  helpers.showElem("#metricForm");
  helpers.showElem("#updateMetric", "inline");
  helpers.hideElem("#createAMetric, #metricsMain, #tinymce-19");

  updateMetric.onclick = () => {
    updateMetrics(item);
  };
  initMetricFields(item);
};

const confirmMetricUpdate = (from) => {
  return new Promise((resolve, reject) => {
    let message;
    // Updating type from metric to parent
    if (from === "metric") {
      message = `<span class="text-danger">Warning: (Changing the type of this metric (metric to parent) will result in deleting all the metric previous values "history").</span> <br> Are you sure you want to update this metirc?`;
    }
    // Updating type from parent to metric
    else if (from === "parent") {
      message = `<span class="text-danger">Warning: (Changing the type of this metric (parent to metric) will also delete all of it's children).</span> <br> Are you sure you want to update this metirc?`;
    }
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
  if (breadcrumbsHistory && breadcrumbsHistory.length) {
    // If message has title then it is a push breacrumb
    if (message.title) {
      nodeSelector = message.nodeSelector;
      pushBreadcrumb(message.title, { nodeSelector });
      // If it is not then it is a backward breadcrumb
    } else {
      if (
        nodeSelector &&
        nodeSelector !== message.nodeSelector &&
        bread.children.length > 2
      ) {
        nodeSelector = message.nodeSelector;
        bread.removeChild(bread.lastChild);
        bread.removeChild(bread.lastChild);
        breadcrumbsHistory.pop();
      } else {
        return;
      }
    }
    renderInit();
    goToMetricspage();
  }
};

// To handle users' choices for sorting
const onSortByChange = () => {
  let sortBy = document.getElementById("sortBy").value;
  Metrics.updateParent(
    {
      nodeSelector,
      metricsId: metrics.id,
    },
    sortBy,
    "sortBy"
  ).then((result) => {
    metrics = result;
    metricsSortBy = sortBy;
    // if (metricsSortBy === "highest" || metricsSortBy === "lowest") {
    //   // Disable manual sorting
    //   sortableList.sortableList.option("disabled", true);
    // }
    renderInit();
  });
};

const updateDescription = (description) => {
  Metrics.updateParent(
    { nodeSelector, metricsId: metrics.id },
    description,
    "description"
  ).then((result) => {
    metrics = result;
  });
};
