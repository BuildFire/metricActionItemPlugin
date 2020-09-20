class Metric {
  constructor(data = {}) {
    this.id = data.id || "";
    this.title = data.title || "";
    this.icon = data.icon || "";
    this.min = data.min || 0;
    this.max = data.max || 0;
    this.actionItem = data.actionItem || {};
    this.type = data.type || "";
    this.order = data.order || null;
    this.value = data.value || null;
    this.metrics = data.metrics || {};
    this.history = data.history || [];
    this.createdOn = data.createdOn || null;
    this.createdBy = data.createdBy || null;
    this.lastUpdatedOn = data.lastUpdatedOn || null;
    this.lastUpdatedBy = data.lastUpdatedBy || null;
  }
}
