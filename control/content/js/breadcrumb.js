const breadcrumbsManager = {
  // Handle Breadcrumbs
  breadcrumb: (breadcrumb, data) => {
    return new Promise((resolve, reject) => {
      // buildfire.history.push(breadcrumb, data);
      // Used the global variable (breadcrumbsHistory)
      breadcrumbsHistory.push(breadcrumb);
      let crumb = document.createElement("span");
      crumb.innerHTML =
        breadcrumb === "Home" ? `${breadcrumb}` : `${breadcrumb}`;
      crumb.classList.add("crumb");
      crumb.setAttribute("arrayIndex", breadcrumbsHistory.length - 1);
      crumb.onclick = () => {
        // This condition is to prevent clicking the breadcrumb that we are already inside
        // Used the global variable (nodeSelector)
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
          bread.removeChild(bread.lastChild);
          breadcrumbsHistory.pop();
        }

        buildfire.messaging.sendMessageToWidget({
          numberOfPops: breadLength - 1 - +crumb.getAttribute("arrayIndex"),
          nodeSelector,
        });
        nodeSelector = data.nodeSelector;

        if (typeof Sortable !== "undefined") {
          renderInit();
        }
        goToMetricspage();
      };
      if (breadcrumb !== "Home") {
        const slash = document.createElement("span");
        slash.innerHTML += " / ";
        bread.appendChild(slash);
      }
      bread.appendChild(crumb);
      resolve(true);
    });
  },
};
