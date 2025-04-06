import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { io as SocketClient } from 'socket.io-client';

class SocketManager {
  constructor(app, port) {
    this.port = port;
    this.server = createServer(app);
    this.io = new SocketServer(this.server, {
      cors: {
        origin: '*',
      }
    });

    this.SERVER_PORTS = {
      SERVER1: 3000,
      SERVER2: 3001,
      SERVER3: 3002
    };
    
    this.isServer1 = port === this.SERVER_PORTS.SERVER1;
    this.isServer2 = port === this.SERVER_PORTS.SERVER2;
    this.isServer3 = port === this.SERVER_PORTS.SERVER3;

    this.clientSockets = [];
    this.subscribedServers = {};

    this.lastState = {
      countdown: 60,
      winningNumbers: [],
      jackpotPrize: 1500,
      animationInProgress: false
    };
  }

  start() {
    if (this.isServer1) {
      // Server 1 will accept connections from other servers
      this.setupPublisherMode();
    } else {
      // Other servers connect to Server 1
      this.setupSubscriberMode();
    }

    this.setupClientConnections();
    
    return this.server;
  }
  
  setupPublisherMode() {
    console.log(`Server 1 (Port ${this.port}) starting as Publisher...`);
    
    this.io.on('connection', (socket) => {
      const clientIp = socket.handshake.address;
      
      // Check if this is a server connection
      socket.on('server-subscribe', (data) => {
        //console.log(`Server ${data.port} subscribed to Server 1`);
        this.subscribedServers[data.port] = socket;

        // Send current state to the newly connected server
        socket.emit('state-update', {
          countdown: global.countdown,
          winningNumbers: global.winningNumbers,
          jackpotPrize: global.jackpotPrize,
          animationInProgress: global.animationInProgress
        });
      });

      // Handle forwarded client data from subscriber servers
      socket.on('client-data', async (data) => {
        console.log(`Received client data from server ${data.serverPort}:`, data.event, data.args);

        await this.handleClientData(data.event, data.args, data.socketId);

        if (data.needsResponse) {
          this.broadcastToSubscribers(data.event + '-response', [data.socketId, ...data.responseArgs]);
        }
      });
      
      socket.on('disconnect', () => {
        // Remove server from subscribers if it was registered
        Object.keys(this.subscribedServers).forEach(port => {
          if (this.subscribedServers[port] === socket) {
            console.log(`Server ${port} disconnected from Server 1`);
            delete this.subscribedServers[port];
          }
        });
      });
    });
  }
  
  setupSubscriberMode() {
    const mainServerPort = this.SERVER_PORTS.SERVER1;
    console.log(`Server ${this.port} connecting to Publisher at port ${mainServerPort}`);
    
    this.publisherConnection = SocketClient(`http://localhost:${mainServerPort}`);
    
    this.publisherConnection.on('connect', () => {
      console.log(`Server ${this.port} connected to Publisher's socket`);
      this.publisherConnection.emit('server-subscribe', { port: this.port });
    });

    this.publisherConnection.on('state-update', (data) => {
      //console.log(`Server ${this.port} received state update:`, data);
      let stateChanged = false;
      
      if (data.countdown !== undefined) {
        global.countdown = data.countdown;
        stateChanged = true;
      }
      
      if (data.winningNumbers !== undefined) {
        const oldNumbers = global.winningNumbers || [];
        const newNumbers = data.winningNumbers;
        const numbersChanged = newNumbers.length !== oldNumbers.length || 
          !newNumbers.every((num, idx) => num === oldNumbers[idx]);
        
        if (numbersChanged) {
          //console.log(`Server ${this.port} updating winningNumbers from ${oldNumbers} to ${newNumbers}`);
          global.winningNumbers = [...newNumbers];
          stateChanged = true;
        }
      }
      
      if (data.jackpotPrize !== undefined) {
        global.jackpotPrize = data.jackpotPrize;
        stateChanged = true;
      }
      
      if (data.animationInProgress !== undefined) {
        global.animationInProgress = data.animationInProgress;
        stateChanged = true;
      }

      if (stateChanged) {
        if (data.countdown !== undefined) {
          this.io.emit('countdown', global.countdown);
        }
        if (data.winningNumbers !== undefined) {
          this.io.emit('winningNumbers', global.winningNumbers);
        }
        if (data.jackpotPrize !== undefined) {
          this.io.emit('jackpotPrize', global.jackpotPrize);
        }
      }
    });

    this.publisherConnection.on('broadcast', (data) => {
      //console.log(`Server ${this.port} received broadcast: ${JSON.stringify(data)}`);
      this.io.emit(data.event, ...data.args);
    });
    
    this.publisherConnection.on('client-response', (socketId, event, ...args) => {
      const clientSocket = this.findClientSocket(socketId);
      if (clientSocket) {
        clientSocket.emit(event, ...args);
      }
    });

    this.publisherConnection.on('disconnect', () => {
      console.log(`Server ${this.port} disconnected from Publisher, attempting to reconnect...`);

      const reconnectInterval = setInterval(() => {
        if (this.publisherConnection.connected) {
          clearInterval(reconnectInterval);
          return;
        }
        
        console.log(`Server ${this.port} attempting to reconnect to Publisher...`);
        this.publisherConnection.connect();
      }, 3000);
    });
  }
  
  setupClientConnections() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected to server ${this.port} with socket ID ${socket.id}`);
      this.clientSockets.push({
        id: socket.id,
        socket: socket
      });

      socket.emit('countdown', global.countdown || 60);
      socket.emit('winningNumbers', global.winningNumbers || []);
      socket.emit('jackpotPrize', global.jackpotPrize || 1500);

      this.setupClientEventListeners(socket);
      
      socket.on('disconnect', () => {
        console.log(`Client disconnected from server ${this.port} with socket ID ${socket.id}`);
        this.clientSockets = this.clientSockets.filter(cs => cs.id !== socket.id);
      });
    });
  }
  
  setupClientEventListeners(socket) {
    if (!this.isServer1) {
      socket.on('placeBet', (betData) => {
        console.log(`Forwarding placeBet from client ${socket.id} to Publisher`);
        this.publisherConnection.emit('client-data', {
          event: 'placeBet',
          args: [betData],
          socketId: socket.id,
          serverPort: this.port,
          needsResponse: true
        });
      });
      
      socket.on('animationComplete', () => {
        this.publisherConnection.emit('client-data', {
          event: 'animationComplete',
          args: [],
          socketId: socket.id,
          serverPort: this.port,
          needsResponse: false
        });
      });
    }
  }

  async handleClientData(event, args, socketId) {
    if (!this.isServer1) return;

    switch (event) {
      case 'placeBet':
        console.log(`Processing bet from socket ${socketId}`);
        break;
      case 'animationComplete':
        this.io.emit('animationCompleted');
        break;
    }
  }
  
  findClientSocket(socketId) {
    const clientSocketObj = this.clientSockets.find(cs => cs.id === socketId);
    return clientSocketObj ? clientSocketObj.socket : null;
  }
  
  emit(event, ...args) {
    this.io.emit(event, ...args);
    
    if (this.isServer1) {
      this.broadcastToSubscribers(event, args);
    }
  }
  
  broadcastToSubscribers(event, args) {
    if (!this.isServer1) return;
    
    Object.values(this.subscribedServers).forEach(serverSocket => {
      serverSocket.emit('broadcast', {
        event,
        args
      });
    });
  }
  
  broadcastStateToSubscribers(stateUpdates) {
    if (!this.isServer1) return;
    
    Object.assign(this.lastState, stateUpdates);
    
    Object.values(this.subscribedServers).forEach(serverSocket => {
      serverSocket.emit('state-update', stateUpdates);
    });
  }
}

global.countdown = 60;
global.winningNumbers = [];
global.jackpotPrize = 1500;
global.animationInProgress = false;

export default SocketManager; 