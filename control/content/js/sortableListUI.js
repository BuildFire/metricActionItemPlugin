const sortableListUI = {
  sortableList: null,
  contrainer: null,
  tag: "",
  data: null,
  id: null,
  get items() {
    return sortableListUI.sortableList.items;
  },
  /*
		This method will call the publicData to pull a single object
		it needs to have an array property called `items` each item need {title, imgUrl}
	 */
  init(elementId) {
    this.contrainer = document.getElementById(elementId);
    let metricsChildren = helpers.nodeSplitter(nodeSelector, metrics);
    let currentMetricList = [];
    for (let metric in metricsChildren) {
      metricsChildren[metric].id = metric;
      currentMetricList.push(metricsChildren[metric]);
    }

    if (currentMetricList.length === 0) {
      this.contrainer.innerHTML = "No items have been added yet.";
    } else this.contrainer.innerHTML = "";

    currentMetricList.sort((a, b) => a.order - b.order);
    sortableListUI.render(currentMetricList);
  },

  render(items) {
    let t = this;
    this.sortableList = new buildfire.components.SortableList(
      this.contrainer,
      items || []
    );

    this.sortableList.onItemClick = this.onItemClick;
    this.sortableList.onDeleteItem = (item, index, callback) => {
      buildfire.notifications.confirm(
        {
          message: "Are you sure you want to delete " + item.title + "?",
          confirmButton: { text: "Delete", key: "y", type: "danger" },
          cancelButton: { text: "Cancel", key: "n", type: "default" },
        },
        (e, data) => {
          if (e) console.error(e);
          if (data.selectedButton.key == "y") {
            sortableListUI.sortableList.items.splice(index, 1);
            Metrics.delete(
              { nodeSelector, metricsId: metrics.id },
              item.id
            ).then((metric) => {
              metrics = metric.data;
              callback(metric);
            });
          }
        }
      );
    };

    this.sortableList.onOrderChange = (item, oldIndex, newIndex) => {
      let orderObj = {};
      document.getElementById("metrics-list").childNodes.forEach((e) => {
        const metricId = e.getAttribute("id"),
          index = parseInt(e.getAttribute("arrayIndex"));
        orderObj[metricId] = index;
      });
      Metrics.order({ nodeSelector, metricsId: metrics.id }, orderObj)
        .then(console.log)
        .catch(console.log);
    };
  },
  onItemClick(item, divRow) {
    if (item.type === "parent") {
      nodeSelector += `.${item.id}.metrics`;
      sortableListUI.init("metrics-list");
      pushBreadcrumb(item.title, { nodeSelector });
    }
    // buildfire.notifications.alert({ message: item.title + " clicked" });
  },
};
