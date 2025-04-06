import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { io as SocketClient } from 'socket.io-client';
import axios from 'axios';

class SocketManager {
  constructor() {
    this.server = null;
    this.io = null;
    this.port = null;
    
    this.SERVER_PORTS = {
      SERVER1: 8000,
      SERVER2: 8001,
      SERVER3: 8002
    };
    
    this.API_URL = 'http://localhost:3000/v1';

    this.API_KEY = '{public_key}';
    this.SERVER_TOKEN = 'server-token-for-authentication';
    
    this.clientSockets = [];
    this.subscribedServers = {};

    this.state = {
      countdown: 60,
      winningNumbers: [],
      jackpotPrize: 1500,
      animationInProgress: false
    };
  }

  init(server, port) {
    this.server = server;
    this.port = port;
    
    this.isServer1 = port === this.SERVER_PORTS.SERVER1;
    this.isServer2 = port === this.SERVER_PORTS.SERVER2;
    this.isServer3 = port === this.SERVER_PORTS.SERVER3;
    
    this.io = new SocketServer(this.server, {
      cors: {
        origin: '*',
      }
    });

    if (this.isServer1) {
      this.setupPublisherMode();
      this.startGameLogic();
    } else {
      this.setupSubscriberMode();
    }

    this.setupClientConnections();
    
    console.log(`Socket server initialized on port ${port}`);
    return this.server;
  }

  getApiHeaders(clientToken = null) {
    return {
      'apikey': this.API_KEY,
      'token': clientToken || this.SERVER_TOKEN,
      'content-type': 'application/json'
    };
  }
  
  setupPublisherMode() {
    console.log(`Server ${this.port} starting as Publisher...`);
    
    this.io.on('connection', (socket) => {
      socket.on('server-subscribe', (data) => {
        console.log(`Server ${data.port} subscribed to Publisher`);
        this.subscribedServers[data.port] = socket;

        socket.emit('state-update', this.state);
      });

      socket.on('client-data', async (data) => {
        console.log(`Received client data from server ${data.serverPort}:`, data.event, data.args);

        await this.handleClientData(data.event, data.args, data.socketId);

        if (data.needsResponse) {
          this.broadcastToSubscribers(data.event + '-response', [data.socketId, ...data.responseArgs]);
        }
      });
      
      socket.on('disconnect', () => {
        Object.keys(this.subscribedServers).forEach(port => {
          if (this.subscribedServers[port] === socket) {
            console.log(`Server ${port} disconnected from Publisher`);
            delete this.subscribedServers[port];
          }
        });
      });
    });
  }
  
  setupSubscriberMode() {
    const publisherPort = this.SERVER_PORTS.SERVER1;
    console.log(`Server ${this.port} connecting to Publisher at port ${publisherPort}`);
    
    this.publisherConnection = SocketClient(`http://localhost:${publisherPort}`);
    
    this.publisherConnection.on('connect', () => {
      console.log(`Server ${this.port} connected to Publisher's socket`);
      this.publisherConnection.emit('server-subscribe', { port: this.port });
    });

    this.publisherConnection.on('state-update', (data) => {
      let stateChanged = false;
      
      if (data.countdown !== undefined) {
        this.state.countdown = data.countdown;
        stateChanged = true;
      }
      
      if (data.winningNumbers !== undefined) {
        const oldNumbers = this.state.winningNumbers || [];
        const newNumbers = data.winningNumbers;
        const numbersChanged = newNumbers.length !== oldNumbers.length || 
          !newNumbers.every((num, idx) => num === oldNumbers[idx]);
        
        if (numbersChanged) {
          this.state.winningNumbers = [...newNumbers];
          stateChanged = true;
        }
      }
      
      if (data.jackpotPrize !== undefined) {
        this.state.jackpotPrize = data.jackpotPrize;
        stateChanged = true;
      }
      
      if (data.animationInProgress !== undefined) {
        this.state.animationInProgress = data.animationInProgress;
        stateChanged = true;
      }

      if (stateChanged) {
        if (data.countdown !== undefined) {
          this.io.emit('countdown', this.state.countdown);
        }
        if (data.winningNumbers !== undefined) {
          this.io.emit('winningNumbers', this.state.winningNumbers);
        }
        if (data.jackpotPrize !== undefined) {
          this.io.emit('jackpotPrize', this.state.jackpotPrize);
        }
      }
    });

    this.publisherConnection.on('broadcast', (data) => {
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

      socket.emit('countdown', this.state.countdown || 60);
      socket.emit('winningNumbers', this.state.winningNumbers || []);
      socket.emit('jackpotPrize', this.state.jackpotPrize || 1500);

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
    } else {
      socket.on('placeBet', async (betData) => {
        await this.handlePlaceBet(betData, socket.id);
      });
      
      socket.on('animationComplete', () => {
        this.io.emit('animationCompleted');
      });
    }
  }

  async handleClientData(event, args, socketId) {
    if (!this.isServer1) return;

    switch (event) {
      case 'placeBet':
        await this.handlePlaceBet(args[0], socketId);
        break;
      case 'animationComplete':
        this.io.emit('animationCompleted');
        break;
    }
  }
  
  async handlePlaceBet(betData, socketId) {
    try {
      console.log(`Processing bet from socket ${socketId}`);
      
      // Call the API to place a bet
      const response = await axios.post(`${this.API_URL}/bets/place-bet`, {
        userId: betData.userId,
        betNumbers: betData.betNumbers
      }, {
        headers: this.getApiHeaders(betData.token)
      });
      
      // Find the client socket to respond to
      const clientSocket = this.findClientSocket(socketId);
      if (clientSocket) {
        clientSocket.emit('betPlaced', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error placing bet:', error);
      const clientSocket = this.findClientSocket(socketId);
      if (clientSocket) {
        clientSocket.emit('betError', { error: error.message });
      }
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
    
    Object.values(this.subscribedServers).forEach(socket => {
      socket.emit('broadcast', {
        event,
        args
      });
    });
  }
  
  broadcastStateToSubscribers(stateUpdate) {
    if (!this.isServer1) return;
    
    // Update local state
    this.state = {
      ...this.state,
      ...stateUpdate
    };
    
    // Broadcast to subscribers
    Object.values(this.subscribedServers).forEach(socket => {
      socket.emit('state-update', stateUpdate);
    });
  }

  generateWinningNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    this.state.winningNumbers = numbers;
    
    this.broadcastStateToSubscribers({
      winningNumbers: this.state.winningNumbers
    });
    
    return numbers;
  }

  async compareBetsWithWinningNumbers(winningNumbers) {
    if (!this.isServer1) return false;
    
    try {
      // Get all bets from the API
      const betsResponse = await axios.get(`${this.API_URL}/bets`, {
        headers: this.getApiHeaders()
      });
      
      const bets = betsResponse.data.data;
      let winnerFound = false;
      
      for (const bet of bets) {
        const betNumbers = bet.bet_numbers.split(',').map(Number);
        if (betNumbers.sort().toString() === winningNumbers.sort().toString()) {
          // Add winner via API call
          await axios.post(`${this.API_URL}/winners`, {
            user_id: bet.user_id,
            winning_combination: winningNumbers.join(','),
            prize: this.state.jackpotPrize
          }, {
            headers: this.getApiHeaders()
          });
          
          winnerFound = true;
        }
      }
      
      return winnerFound;
    } catch (error) {
      console.error('Error comparing bets with winning numbers:', error);
      return false;
    }
  }

  async getTotalBets() {
    try {
      const response = await axios.get(`${this.API_URL}/bets`, {
        headers: this.getApiHeaders()
      });
      
      return response.data.data.length;
    } catch (error) {
      console.error('Error getting total bets:', error);
      return 0;
    }
  }

  async deleteAllBets() {
    try {
      await axios.delete(`${this.API_URL}/bets`, {
        headers: this.getApiHeaders()
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting all bets:', error);
      return false;
    }
  }

  startGameLogic() {
    if (!this.isServer1) return;
    
    console.log('Starting Publisher server game logic...');
    this.generateWinningNumbers();

    setTimeout(() => {
      this.broadcastStateToSubscribers({
        countdown: this.state.countdown,
        winningNumbers: this.state.winningNumbers,
        jackpotPrize: this.state.jackpotPrize,
        animationInProgress: this.state.animationInProgress
      });
      
      setInterval(async () => {
        if (this.state.countdown === 0) {
          if (!this.state.animationInProgress) {
            this.state.animationInProgress = true;

            this.emit('countdown', this.state.countdown);
            this.emit('winningNumbers', this.state.winningNumbers);

            this.broadcastStateToSubscribers({
              countdown: this.state.countdown,
              winningNumbers: this.state.winningNumbers,
              animationInProgress: this.state.animationInProgress
            });
            
            setTimeout(async () => {
              const winnerFound = await this.compareBetsWithWinningNumbers(this.state.winningNumbers);
              if (!winnerFound) {
                const totalBets = await this.getTotalBets();
                this.state.jackpotPrize += totalBets * 20;
                this.emit('noWinners');
              } else {
                this.emit('haveWinners', this.state.jackpotPrize, this.state.winningNumbers);
                this.state.jackpotPrize = 1500;
              }

              this.broadcastStateToSubscribers({
                jackpotPrize: this.state.jackpotPrize
              });
              
              await this.deleteAllBets();
              this.generateWinningNumbers();
              
              setTimeout(() => {
                this.emit('reloadPage');
                this.state.countdown = 60;
                this.state.animationInProgress = false;

                this.broadcastStateToSubscribers({
                  countdown: this.state.countdown,
                  winningNumbers: this.state.winningNumbers,
                  animationInProgress: this.state.animationInProgress
                });
              }, 2500); 
            }, 2000); 
          }
        } else {
          this.state.countdown--;
          this.emit('countdown', this.state.countdown);
          this.emit('jackpotPrize', this.state.jackpotPrize);

          if (this.state.countdown % 10 === 0) {
            this.broadcastStateToSubscribers({
              countdown: this.state.countdown,
              jackpotPrize: this.state.jackpotPrize,
              winningNumbers: this.state.winningNumbers
            });
          }
        }
      }, 1000);
    }, 3000);
  }
}

export default new SocketManager(); 