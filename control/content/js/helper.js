// A helper function to extract the date: Format: "year/month/day"
const helpers = {
  // Create a GUID ID
  uuidv4: (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h)),
  // Return absolute date
  getAbsoluteDate: () => new Date(new Date().setHours(0, 0, 0, 0)),
  // Extract the children of a specific metric from the big object via the node selector
  nodeSplitter: (nodeSelector, metrics) => {
    let splittedNode = nodeSelector.split(".");
    let metricsChildren = metrics;
    let description = "";

    splittedNode.forEach((item, i) => {
      // If we are at the home page (top of the object)
      if (nodeSelector === "metrics") {
        metricsSortBy = metrics.sortBy || "manual";
        document.getElementById("sortBy").value = metricsSortBy;
        description = metrics.description;
      }
      // Assign the parent metric sortBy value (If we are in parent metric);
      if (nodeSelector !== "metrics" && i === splittedNode.length - 2) {
        metricsSortBy = metricsChildren[item].sortBy || "manual";
        document.getElementById("sortBy").value = metricsSortBy;
        description = metricsChildren[item].description;
      }

      metricsChildren = metricsChildren[item];
    });

    return { metricsChildren, description };
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

  inputError: (inputID, textHelperID, errorMessage) => {
    document.getElementById(inputID).classList.add("mdc-text-field--invalid");
    document
      .getElementById(textHelperID)
      .classList.add("mdc-text-field-helper-text--validation-msg");
    document.getElementById(textHelperID).innerHTML = errorMessage;
  },

  getActionItem(action) {
    showActionItem.innerHTML = "No Action Selected";

    const actions = {
      linkToApp: "Link to app",
      navigateToAppSettings: "Navigate To App Settings",
      navigateToBookmarks: "Navigate To Bookmarks",
      callNumber: "Call Number",
      linkToSocialFacebook: "Link To Social Facebook",
      linkToSocialInstagram: "Link To Social Instagram",
      linkToSocialLinkedIn: "Link To Social LinkedIn",
      navigateToLogin: "Navigate To Login",
      navigateToAddress: "Navigate To Address",
      noAction: "No Action",
      navigateToNotes: "Navigate To Notes",
      navigateToNotifications: "Navigate To Notifications",
      sendEmail: "Send Email",
      sendSms: "Send SMS",
      linkToSocialTwitter: "Link To Social Twitter",
      linkToWeb: "linkToWeb",
      navigateToSearch: "Navigate To Search",
      purchase: "Purchase",
    };

    if (actions[action]) {
      showActionItem.innerHTML = `
      <div class="mdc-chip-set mdc-chip-set--choice">
        <div class="mdc-chip mdc-chip--selected" role="row">
          <div class="mdc-chip__ripple"></div>
          <span role="gridcell">
            <span
              role="radio"
              tabindex="0"
              aria-checked="true"
              class="mdc-chip__primary-action"
            >
              <span class="mdc-chip__text">${actions[action]}</span>
            </span>
            <i class="material-icons mdc-chip__icon mdc-chip__icon--trailing" tabindex="-1" role="button" onclick="removeActionItem()">cancel</i>
          </span>
        </div>
    </div>
    `;

      mdc.chips.MDCChip.attachTo(showActionItem.querySelector(".mdc-chip-set"));
    } else {
      showActionItem.innerHTML = `No Action Selected`;
    }
  },
  hideElem: (selector) => {
    let children = document.querySelectorAll(selector);
    children.forEach((elem) => {
      elem.style.display = "none";
    });
  },
  showElem: (selector, displayType = null) => {
    let children = document.querySelectorAll(selector);
    children.forEach((elem) => {
      elem.style.display = displayType || "block";
    });
  },
  // Filter Metrics based on the provided customer
  filterCustomerMetrics(metrics, clientProfile) {
    return new Promise((resolve, reject) => {
      // Get client history data;
      Histories.getHistories(clientProfile).then((result) => {
        histories = result;
        // Add the history data to each metric
        this.addHistoryToMetrics(metrics, histories);

        resolve(metrics.metrics);
      });
    });
  },
  // Loop recursively on the metrics object and add the history value from histories object
  addHistoryToMetrics(metrics, histories) {
    if (Object.keys(metrics.metrics).length > 0) {
      for (var key in metrics.metrics) {
        if (
          histories.metrics[key] &&
          metrics.metrics[key].type === "parent" &&
          Object.keys(metrics.metrics[key].metrics).length > 0
        ) {
          this.addHistoryToMetrics(
            metrics.metrics[key],
            histories.metrics[key]
          );
        } else {
          if (histories.metrics[key] && histories.metrics[key].history) {
            metrics.metrics[key].history = histories.metrics[key].history;
          } else {
            metrics.metrics[key].history = [];
          }
        }
      }
    }
  },
};
