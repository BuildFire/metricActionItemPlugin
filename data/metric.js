class Metric {
  constructor(data = {}) {
    this.id = data.id || helpers.uuidv4();
    this.title = data.title || "";
    this.icon = data.icon || "";
    this.min = data.min || 0;
    this.max = data.max || 0;
    this.value = 0;
    this.actionItem = data.actionItem || {};
    this.type = data.type || "";
    this.parent = data.parent || "";
    this.order = data.order || null;
    this.pointer = data.pointer || "";
    this.metrics = data.metrics || {};
    this.history = [
      {
        value: data.value || 0,
        createdOn: data.createdOn || null,
        createdBy: data.createdBy || null,
        lastUpdatedOn: data.lastUpdatedOn || null,
        lastUpdatedBy: data.lastUpdatedBy || null,
      },
    ];
    this.createdOn = data.createdOn || null;
    this.createdBy = data.createdBy || null;
    this.lastUpdatedOn = data.lastUpdatedOn || null;
    this.lastUpdatedBy = data.lastUpdatedBy || null;
  }

  getValue(metric) {
    if (metric.type === "metric") {
      let val = metric.history[metric.history.length - 1].value;
      metric.value = val;
      return val;
    } else if (metric.type === "parent") {
      if (metric.metrics) {
        let sum = 0;
        for (let key in metric.metrics) {
          sum += getHistory(metric.metrics[key]);
          console.log("sum", sum);
        }
        let avg = sum / Object.keys(metric.metrics).length;
        console.log("avg", avg);
        metric.value = avg;
        return avg;
      }
    }
  }

  updateHistory(value) {
    const historyPointer = `${this.pointer}.${this.id}.history`;
    MetricsDAO.addMetricHistory(historyPointer, value)
      .then(() => {
        // TODO: check if this step is needed
        // this.value = value;
        // this.getValue(metric)
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // function rep(obj) {
  //   for (var ob in obj.metrics) {
  //     console.log("ob", ob);
  //     obj.metrics[ob].parent = obj;
  //     console.log(new Metric(obj.metrics[ob]));
  //     test.push(new Metric(obj.metrics[ob]));
  //     // console.log("obj.metrics[ob]", obj.metrics[ob]);
  //     if (obj.metrics[ob].metrics) {
  //       //   console.log("obj.metrics[ob].metrics", obj.metrics[ob]);
  //       rep(obj.metrics[ob]);
  //     }
  //   }
  // }

  addParentObject(obj) {
    for (var ob in obj.metrics) {
      console.log("ob", ob);
      obj.metrics[ob].parent = obj;
      console.log(new Metric(obj.metrics[ob]));
    }
  }

  // setTimeout(() => {
  //   console.log("testt", test);
  //   console.log("that is it", getPointer(test[0]));
  // }, 5000);

  getNodeSelector(obj) {
    console.log("obj.parent", obj.parent.parent);
    if (obj.parent.parent) {
      return getPointer(obj.parent) + ".metrics." + obj.id;
    } else {
      return "metrics." + obj.id;
    }
  }
}

// setTimeout(() => {
//   new Metric({
//     id: "5f5aa167ad0a6280de4773a7",
//     actionItem: {},
//     createdBy: null,
//     createdOn: "2020-09-10T21:57:59.951Z",
//     history: [
//       {
//         value: 50,
//         createdOn: null,
//         createdBy: null,
//         lastUpdatedOn: null,
//         lastUpdatedBy: null,
//       },
//     ],
//     icon: "metric1",
//     lastUpdatedBy: null,
//     lastUpdatedOn: "2020-09-10T21:57:59.951Z",
//     max: 0,
//     min: 100,
//     order: null,
//     pointer: "metrics",
//     title: "metric1",
//     type: "metric",
//     value: 50,
//   }).addHistory(20);
// }, 2000);
