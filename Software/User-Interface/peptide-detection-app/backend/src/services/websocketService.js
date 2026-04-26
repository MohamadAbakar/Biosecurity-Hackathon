const logger = require('../utils/logger');

class WebSocketService {
  constructor(io) {
    this.io = io;
    this.connectedClients = new Map();
    this.setupEventHandlers();
    WebSocketService._instance = this;
  }

  static getInstance() {
    return WebSocketService._instance;
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      this.connectedClients.set(socket.id, {
        socketId:    socket.id,
        userId:      null,
        connectedAt: new Date()
      });

      socket.on('authenticate', (data) => {
        const client = this.connectedClients.get(socket.id);
        if (client) {
          client.userId = data.userId;
          client.role   = data.role;
        }
      });

      socket.on('subscribe-to-analysis', (sessionId) => {
        socket.join(`analysis-${sessionId}`);
        logger.info(`Client ${socket.id} subscribed to analysis session ${sessionId}`);
      });

      socket.on('unsubscribe-from-analysis', (sessionId) => {
        socket.leave(`analysis-${sessionId}`);
        logger.info(`Client ${socket.id} unsubscribed from analysis session ${sessionId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      this.sendToClient(socket.id, 'connection-status', {
        connected:  true,
        timestamp:  new Date()
      });
    });
  }

  broadcast(event, data) {
    this.io.emit(event, { ...data, timestamp: new Date() });
  }

  broadcastToSession(sessionId, event, data) {
    this.io.to(`analysis-${sessionId}`).emit(event, { ...data, timestamp: new Date() });
  }

  sendToClient(socketId, event, data) {
    this.io.to(socketId).emit(event, { ...data, timestamp: new Date() });
  }

  sendToUser(userId, event, data) {
    for (const [socketId, client] of this.connectedClients) {
      if (client.userId === userId) {
        this.sendToClient(socketId, event, data);
      }
    }
  }

  getConnectedClients() {
    return Array.from(this.connectedClients.values());
  }

  getClientCount() {
    return this.connectedClients.size;
  }
}

module.exports = WebSocketService;
