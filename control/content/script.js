let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
let breadcrumbsHistory = [];
// initialize metric fields;
let metricFields;
let currentUser = {};

// SortableList variables
let sortableList = null;
let metricsContainer = null;

authManager.getCurrentUser().then((user) => {
  currentUser = user;
});

Metrics.getMetrics().then(async (data) => {
  metrics = data.data;
  metrics.id = data.id;

  Metrics.getHistoryValue(metrics);
  console.log("laslalss", metrics);
  if (typeof Sortable !== "undefined") {
    await Settings.load().then(() => {
      renderInit("metricsList");
      pushBreadcrumb("Home", { nodeSelector });
    });
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

function goToAddItem() {
  metricForm.style.display = "block";
  metricsMain.style.display = "none";
  createAMetric.style.display = "inline";
  updateMetric.style.display = "none";
  // Reset input field to it's initial value after saving it in the database
  initMetricFields();
}
function goToMetricspage() {
  metricForm.style.display = "none";
  metricsMain.style.display = "block";
  createAMetric.style.display = "none";
  updateMetric.style.display = "none";
}

const onFieldChange = (field) => {
  metricFields[field] = document.getElementById(field).value;
};

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
  const { title, icon, actionItem, min, max, type } = metricFields;
  // Metric fields validation
  if (!title) {
    helpers.inputAlert("please add metric title");
    return;
  }
  if (Object.keys(actionItem).length === 0) {
    helpers.inputAlert("Please add an action item");
    return;
  }
  if (!icon) return `Please add an icon`;
  if (!type) return "Please select metric type";

  if (type === "parent") {
    delete metricFields.min;
    delete metricFields.max;
  } else if (type === "metric") {
    if (min !== 0 && !min) return `Please add a max value`;
    if (max !== 0 && !max) return `Please add a min value`;
  }

  // Empty the form fields after submitting
  metricFields.createdBy = currentUser.firstName;
  metricFields.lastUpdatedBy = currentUser.firstName;
  metricFields.order = metricsList.childNodes.length;
  console.log("everything", nodeSelector, metrics.id, new Metric(metricFields));
  Metrics.insert(
    {
      nodeSelector,
      metricsId: metrics.id,
    },
    new Metric(metricFields)
  ).then((metric) => {
    metrics = metric.data;
    if (typeof Sortable !== "undefined") {
      renderInit("metricsList");
    }
    goToMetricspage();
  });
};

const updateMetrics = (item) => {
  let updateObj = {};
  for (let prop in metricFields) {
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
  ).then((metric) => {
    metrics = metric.data;
    if (typeof Sortable !== "undefined") {
      renderInit("metricsList");
    }
    goToMetricspage();
  });
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
// Add Breadcrumb
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
const renderInit = (elementId) => {
  metricsContainer = document.getElementById(elementId);
  let metricsChildren = helpers.nodeSplitter(nodeSelector, metrics);
  let currentMetricList = [];
  for (let metricId in metricsChildren) {
    metricsChildren[metricId].id = metricId;
    currentMetricList.push(metricsChildren[metricId]);
  }

  if (currentMetricList.length === 0) {
    metricsContainer.innerHTML = "No items have been added yet.";
  } else metricsContainer.innerHTML = "";

  console.log("Settings.sortBy", Settings.sortBy);

  if (Settings.sortBy === "heighest") {
    currentMetricList.sort((a, b) => b.value - a.value);
  } else if (Settings.sortBy === "lowest") {
    currentMetricList.sort((a, b) => a.value - b.value);
  } else {
    currentMetricList.sort((a, b) => a.order - b.order);
  }

  render(currentMetricList);
};

const render = (items) => {
  sortableList = new buildfire.components.SortableList(
    metricsContainer,
    items || []
  );

  sortableList.onItemClick = (item, divRow) => {
    if (item.type === "parent") {
      nodeSelector += `.${item.id}.metrics`;
      if (typeof Sortable !== "undefined") {
        renderInit("metricsList");
      }
      pushBreadcrumb(item.title, { nodeSelector });
    }
  };
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
            (metric) => {
              metrics = metric.data;
              callback(metric);
            }
          );
        }
      }
    );
  };

  sortableList.onOrderChange = (item, oldIndex, newIndex) => {
    let orderObj = {};
    metricsContainer.childNodes.forEach((e) => {
      const metricId = e.getAttribute("id"),
        index = parseInt(e.getAttribute("arrayIndex"));
      orderObj[metricId] = index;
    });
    Metrics.order({ nodeSelector, metricsId: metrics.id }, orderObj)
      .then((metric) => {
        metrics = metric.data;
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
