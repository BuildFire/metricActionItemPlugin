let metrics = {};
// We used nodeSelector to determine where are we inside the big object
let nodeSelector = "metrics";
let currentUser;
let listViewDiv;
authManager.getCurrentUser().then((user) => {
  currentUser = user;
});

let publicDataUpdate = buildfire.publicData.onUpdate((event) => {
  if (event.data && event.id) {
    metrics = event.data;
    renderInit();
  }
});

let dataStoreUpdate = buildfire.datastore.onUpdate((event) => {
  if (event.tag === "settings") {
    Settings.load().then(() => {
      renderInit();
    });
  }
});

Metrics.getMetrics().then(async (data) => {
  metrics = data;

  await Settings.load().then(() => {
    if (typeof ListView !== "undefined") {
      renderInit();
    }

    buildfire.history.push("Home", {
      nodeSelector,
      showLabelInTitlebar: true,
      elementToShow: "#2014Top10",
    });
  });
});
buildfire.messaging.onReceivedMessage = (msg) => {
  if (msg.cmd == "refresh")
    /// message comes from the strings page on the control side
    location.reload();
};
if (typeof ListView !== "undefined") {
  listViewDiv = new ListView("listViewContainer", {
    enableAddButton: true,
    Title: "",
  });

  listViewDiv.onItemClicked = (item) => {
    if (Object.keys(item.actionItem).length > 0) {
      buildfire.actionItems.execute(item.actionItem, () => {
        console.log("DONE DSADSA");
      });
    }
  };
}

const renderInit = () => {
  listViewContainer.innerHTML = "";

  let metricsChildren = helpers.nodeSplitter(nodeSelector, metrics);
  let currentMetricList = [];
  console.log("please", metricsChildren);

  let sum = 0;
  console.log("metrics widget", metrics);

  for (let metricId in metricsChildren) {
    metricsChildren[metricId].id = metricId;
    let newMetric = new Metric(metricsChildren[metricId]);
    Metric.getHistoryValue(newMetric);

    sum += newMetric.value || 0;
    let listItem = new ListViewItem(newMetric);
    listItem.onToolbarClicked = (e) => {
      console.log("metricsChildren[metricId]", metricsChildren[metricId]);

      if (metricsChildren[metricId].type === "parent") {
        nodeSelector += `.${metricId}.metrics`;
        console.log("nodeSelector", nodeSelector);
        renderInit();
        // pushBreadcrumb(item.title, { nodeSelector });
      }
    };
    currentMetricList.push(listItem);
  }

  document.getElementById("summaryValue").innerText = `${
    sum / Object.keys(metricsChildren).length
  }%`;

  console.log("currentMetricList", currentMetricList);

  if (Settings.sortBy === "highest") {
    currentMetricList.sort((a, b) => b.value - a.value);
  } else if (Settings.sortBy === "lowest") {
    currentMetricList.sort((a, b) => a.value - b.value);
  } else {
    currentMetricList.sort((a, b) => a.order - b.order);
  }

  listViewDiv.loadListViewItems(currentMetricList);
};


// updateMetricHistory progress bar
var bar = new ProgressBar.SemiCircle('#updateHistoryContainer', {
  strokeWidth: 6,
  color: '#FFEA82',
  trailColor: '#eee',
  trailWidth: 1,
  easing: 'easeInOut',
  duration: 1400,
  svgStyle: null,
  text: {
    value: '',
    alignToBottom: false
  },
  from: {color: '#FFEA82'},
  to: {color: '#ED6A5A'},
  // Set default step function for all animate calls
  step: (state, bar) => {
    bar.path.setAttribute('stroke', state.color);
    var value = Math.round(bar.value() * 100);
    if (value === 0) {
      bar.setText('');
    } else {
      bar.setText(value);
    }

    bar.text.style.color = state.color;
  }
});
bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
bar.text.style.fontSize = '2rem';

bar.animate(1.0);  // Number from 0.0 to 1.0