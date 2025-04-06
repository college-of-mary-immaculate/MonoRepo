import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    const baseURL = window.location.origin;

    this.socketServers = [
      baseURL, // Current server (8000, 8001, or 8002)
      baseURL.includes('8000') ? baseURL : 'http://localhost:8000', // Publisher
      baseURL.includes('8001') ? baseURL : 'http://localhost:8001', // Subscriber 1
      baseURL.includes('8002') ? baseURL : 'http://localhost:8002'  // Subscriber 2
    ];

    this.socketServers = [...new Set(this.socketServers)];
    
    this.connectionAttempts = {};
    this.socketServers.forEach(server => {
      this.connectionAttempts[server] = 0;
    });
    
    this.socket = null;
    this.eventHandlers = {};

    this.currentServer = baseURL;
    console.log(`Selected socket server: ${this.currentServer}`);

    this.connect();
  }

  getClientToken() {
    return sessionStorage.getItem('token') || '';
  }

  getBestServer() {
    const currentOrigin = window.location.origin;
    if (this.connectionAttempts[currentOrigin] < 2) {
      return currentOrigin;
    }

    let bestServer = this.socketServers[0];
    let lowestAttempts = this.connectionAttempts[bestServer];
    
    for (const server of this.socketServers) {
      if (this.connectionAttempts[server] < lowestAttempts) {
        lowestAttempts = this.connectionAttempts[server];
        bestServer = server;
      }
    }
    
    return bestServer;
  }
  
  connect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    console.log(`Connecting to socket server: ${this.currentServer}`);
    this.connectionAttempts[this.currentServer]++;

    this.socket = io(this.currentServer);

    this.socket.on('connect', () => {
      console.log(`Connected to socket server: ${this.currentServer}`);
      this.reapplyEventHandlers();
    });
    
    this.socket.on('connect_error', (error) => {
      console.error(`Cannot connect to ${this.currentServer}:`, error);

      this.currentServer = this.getBestServer();
      setTimeout(() => this.connect(), 1000);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log(`Disconnected from ${this.currentServer}: ${reason}`);

      if (reason !== 'io client disconnect') {
        this.currentServer = this.getBestServer();
        setTimeout(() => this.connect(), 1000);
      }
    });
    
    return this.socket;
  }

  on(eventName, handler) {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(handler);

    if (this.socket) {
      this.socket.on(eventName, handler);
    }
    
    return this;
  }

  emit(eventName, ...args) {
    if (this.socket && this.socket.connected) {
      if (eventName === 'placeBet') {
        const betData = args[0];
        if (!betData.token) {
          betData.token = this.getClientToken();
        }
        this.socket.emit(eventName, betData);
      } else {
        this.socket.emit(eventName, ...args);
      }
    } else {
      console.warn(`Cannot emit ${eventName}: socket not connected`);
    }
    
    return this;
  }

  reapplyEventHandlers() {
    if (!this.socket) return;
    
    for (const eventName in this.eventHandlers) {
      for (const handler of this.eventHandlers[eventName]) {
        this.socket.on(eventName, handler);
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketClient(); 