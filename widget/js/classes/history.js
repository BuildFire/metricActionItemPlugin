class ClientHistory {
  constructor(data = {}) {
    this.id = data.id || "";
    this.history = data.history || [];
  }
}
