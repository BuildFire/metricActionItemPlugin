class ListView {
  constructor(containerId, options) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw "Cant find container";
    this.container.classList.add("listViewContainer");
    this.options = options || {};
    this.container.innerHTML = "";
  }

  clear() {
    this.container.innerHTML = "";
  }

  loadListViewItems(items) {
    if (this.container.innerHTML == "") {
      // if (this.options.enableAddButton) {
      //   let addButton = ui.create("button", this.container, "<span></span>", [
      //     "listViewAddButton",
      //     "btn",
      //     "btn--add",
      //     "btn--fab",
      //     "btn-primary",
      //   ]);
      //   addButton.onclick = this.onAddButtonClicked;
      // }
    }
    if (items.length === 0) {
      listViewContainer.classList.add("empty");
      summary.style.display = "none";
    } else {
      listViewContainer.classList.remove("empty");
      items.forEach((item) => this.addItem(item));
    }
  }

  addItem(item) {
    let t = this;
    if (!(item instanceof ListViewItem)) item = new ListViewItem(item);
    let i = item.render(this.container);
    i.onclick = () => {
      t.onItemClicked(item);
    };
    i.onToolbarClicked = (key, item, e) => {
      t.onItemToolbarClicked(key, item, e);
    };
  }

  onAddButtonClicked() {
    console.log("Add Button Clicked");
  }

  onItemClicked(item) {
    console.log("Item Clicked", item);
  }

  onItemToolbarClicked(key, item, e) {
    console.log("Item Toolbar Clicked", item);
  }
}

class ListViewItem {
  constructor(obj = {}) {
    this.id = obj.id;
    this.title = obj.title;
    this.icon = obj.icon;
    this.history = obj.history;
    this.type = obj.type;
    this.metrics = obj.metrics;
    this.value = obj.value || 0;
    this.data = obj.data;
    this.order = obj.order || null;
    this.previousValue = obj.previousValue;
    this.actionItem = obj.actionItem;
  }

  toRawData() {
    return {
      id: this.id,
      title: this.title,
      icon: this.icon,
      history: this.history,
      type: this.type,
      metrics: this.metrics,
      value: this.value,
      data: this.data,
      order: this.order,
      previousValue: this.previousValue,
      actionItem: this.actionItem,
    };
  }

  render(container, card) {
    this.container = container;

    if (card) card.innerHTML = "";
    else card = ui.create("div", container, "", ["listViewItem"]);

    this.card = card;

    let imgContainer = ui.create("div", card, null, [
      "listViewItemImgContainer",
    ]);
    imgContainer.onclick = (e) => {
      this.onIconTitleClick(this);
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    if (this.icon) {
      let img = ui.create("img", imgContainer, null, [
        "listViewItemImg",
        "mdc-theme--text-primary-on-background",
      ]);

      if (this.icon.indexOf("http") == 0)
        img.src = buildfire.imageLib.cropImage(this.icon, {
          width: 128,
          height: 128,
        });
      // local
      else img.src = this.icon;

      ui.create("i", imgContainer, null, ["listViewItemIcon"]);
    }

    let listViewItemCopy = ui.create("div", card, null, [
      "listViewItemCopy",
      "ellipsis",
      "padded",
      "padded--m",
    ]);
    listViewItemCopy.onclick = (e) => {
      this.onIconTitleClick(this);
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    ui.create("h5", listViewItemCopy, this.title, [
      "listViewItemTitle",
      "ellipsis",
      "margin--0",
      "mdc-theme--text-primary-on-background",
    ]);

    if (this.description)
      ui.create("p", listViewItemCopy, this.description, [
        "listViewItemDescription",
        "ellipsis",
        "margin--0",
      ]);

    let t = this;

    if (this.value === 0 || this.value) {
      let listViewItemToolbar = ui.create("div", card, null, [
        "listViewItemToolbar",
        "mdc-theme--text-primary-on-background",
      ]);

      // Add icon
      if (this.value > this.previousValue) {
        ui.create("i", listViewItemToolbar, "north", [
          "material-icons",
          "mdc-button__icon",
          "mdc-theme--secondary",
        ]);
      } else if (this.value < this.previousValue) {
        ui.create("i", listViewItemToolbar, "south", [
          "material-icons",
          "mdc-button__icon",
          "mdc-theme--error",
        ]);
      } else {
        ui.create("i", listViewItemToolbar, "remove", [
          "material-icons",
          "mdc-button__icon",
        ]);
      }
      this.viewdValue = this.value;

      if (
        (this.history.length === 0 && this.type === "metric") ||
        (this.type === "parent" && Object.keys(this.metrics).length === 0) ||
        (this.value === 0 && Object.keys(this.metrics).length > 0)
      ) {
        this.viewdValue = "- ";
      }

      ui.create("span", listViewItemToolbar, `${this.viewdValue}%`, [
        "listViewItemToolbarItem",
        "value",
      ]);

      listViewItemToolbar.onclick = (e) => {
        t.onToolbarClicked("btnBadge", t, e);
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
    }

    return card;
  }

  onToolbarClicked(key, item) {}

  onIconTitleClick(item) {}

  update() {
    this.render(this.container, this.card);
  }
}
