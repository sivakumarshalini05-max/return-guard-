/**
 * In-memory data store fallback when local MongoDB daemon is not active.
 * Ensures ReturnGuard works smoothly out of the box in all environments.
 */

class MemoryStore {
  constructor() {
    this.users = [];
    this.orders = [];
    this.chatMessages = [];
    this.idCounter = 100;
  }

  generateId() {
    this.idCounter += 1;
    return `mem_${Date.now()}_${this.idCounter}`;
  }

  // USER Operations
  async findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id) {
    return this.users.find(u => u._id === id);
  }

  async createUser(userData) {
    const user = {
      _id: this.generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id, updateData) {
    const idx = this.users.findIndex(u => u._id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updateData, updatedAt: new Date() };
      return this.users[idx];
    }
    return null;
  }

  // ORDER Operations
  async findOrders(userId, { search, platform, sort }) {
    let list = this.orders.filter(o => o.userId.toString() === userId.toString());

    if (platform && platform !== 'All') {
      list = list.filter(o => o.platform === platform);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.productName.toLowerCase().includes(q) ||
        o.platform.toLowerCase().includes(q) ||
        (o.notes && o.notes.toLowerCase().includes(q))
      );
    }

    if (sort === 'deadline') {
      list.sort((a, b) => new Date(a.returnDeadline) - new Date(b.returnDeadline));
    } else if (sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }

  async findOrderById(id) {
    return this.orders.find(o => o._id === id);
  }

  async createOrder(orderData) {
    const order = {
      _id: this.generateId(),
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.push(order);
    return order;
  }

  async updateOrder(id, updateData) {
    const idx = this.orders.findIndex(o => o._id === id);
    if (idx !== -1) {
      this.orders[idx] = { ...this.orders[idx], ...updateData, updatedAt: new Date() };
      return this.orders[idx];
    }
    return null;
  }

  async deleteOrder(id) {
    const idx = this.orders.findIndex(o => o._id === id);
    if (idx !== -1) {
      this.orders.splice(idx, 1);
      return true;
    }
    return false;
  }

  // CHAT Operations
  async createChatMessage(msgData) {
    const msg = {
      _id: this.generateId(),
      ...msgData,
      createdAt: new Date()
    };
    this.chatMessages.push(msg);
    return msg;
  }

  async getChatHistory(userId) {
    return this.chatMessages
      .filter(m => m.userId.toString() === userId.toString())
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  async clearChatHistory(userId) {
    this.chatMessages = this.chatMessages.filter(m => m.userId.toString() !== userId.toString());
  }
}

export const memoryStore = new MemoryStore();
