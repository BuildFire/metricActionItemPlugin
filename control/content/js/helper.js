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

    splittedNode.forEach((item, i) => {
      // If we are at the home page (top of the object)
      if (nodeSelector === "metrics") {
        metricsSortBy = metrics.sortBy;
        document.getElementById("sortBy").value = metricsSortBy;
      }
      // Assign the parent metric sortBy value (If we are in parent metric);
      if (nodeSelector !== "metrics" && i === splittedNode.length - 2) {
        metricsSortBy = metricsChildren[item].sortBy;
        document.getElementById("sortBy").value = metricsSortBy;
      }

      metricsChildren = metricsChildren[item];
    });

    return metricsChildren;
  },
  inputAlert: (message) => {
    buildfire.notifications.alert({ message });
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
    document.getElementById(textHelperID).classList.add( "mdc-text-field-helper-text--validation-msg");
    document.getElementById(textHelperID).innerHTML = errorMessage;
  },

  getActionItem(action) {
    showActionItem.innerHTML = "";

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

    showActionItem.innerHTML = actions[action] || "No Action Selected";
  },
};
