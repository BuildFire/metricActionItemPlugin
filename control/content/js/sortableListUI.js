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
  init(elementId, tag = "content") {
    this.tag = tag;
    this.contrainer = document.getElementById(elementId);
    this.contrainer.innerHTML = "loading...";
    let t = this;
    buildfire.publicData.get(this.tag, (e, obj) => {
      if (e) {
        console.error(e);
        this.contrainer.innerHTML =
          "An error has occurred. Please contact your system admin.";
      } else if (obj && obj.data) {
        console.log("lalo", obj);
        this.data = obj.data;
        this.id = obj.id;
        if (!obj.data.metrics)
          t.contrainer.innerHTML = "No items have been added yet.";
        else if (obj.data.metrics.length == 0)
          this.contrainer.innerHTML = "No items have been added yet.";
        else this.contrainer.innerHTML = "";
        let arr = [];
        for (let ob in obj.data.metrics) {
          obj.data.metrics[ob].id = ob;
          arr.push(obj.data.metrics[ob]);
        }
        console.log("this is it", arr);
        sortableListUI.render(arr);
      }
    });
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
            buildfire.publicData.save(
              { $set: { items: sortableListUI.sortableList.items } },
              t.tag,
              (e) => {
                if (e) console.error(e);
                else callback(item);
              }
            );
          }
        }
      );
    };

    this.sortableList.onOrderChange = (item, oldIndex, newIndex) => {
      buildfire.publicData.save(
        { $set: { items: sortableListUI.sortableList.items } },
        this.tag,
        () => {}
      );
    };
  },
  /**
   * Updates item in publicData and updates sortable list UI
   * @param {Object} item Item to be updated
   * @param {Number} index Array index of the item you are updating
   * @param {HTMLElement} divRow Html element (div) of the entire row that is being updated
   * @param {Function} callback Optional callback function
   */
  updateItem(item, index, divRow, callback) {
    console.log(divRow);
    sortableListUI.sortableList.injectItemElements(item, index, divRow);
    let cmd = { $set: {} };
    cmd.$set["items." + index] = item;
    buildfire.publicData.save(cmd, this.tag, (err, data) => {
      if (err) {
        console.error(err);
        if (callback) return callback(err);
      }
      if (callback) return callback(null, data);
    });
  },
  /**
   * This function adds item to publicData and updates sortable list UI
   * @param {Object} item Item to be added to publicData
   * @param {Function} callback Optional callback function
   */
  addItem(item, callback) {
    let cmd = {
      $push: { items: item },
    };
    buildfire.publicData.save(cmd, this.tag, (err, data) => {
      if (err) {
        console.error(err);
        if (callback) return callback(err);
      }
      if (callback) return callback(null, data);
    });

    sortableListUI.sortableList.append(item);
  },
  onItemClick(item, divRow) {
    buildfire.notifications.alert({ message: item.title + " clicked" });
  },
};
