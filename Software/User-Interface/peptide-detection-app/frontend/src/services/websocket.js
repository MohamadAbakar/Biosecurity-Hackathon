import { io } from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

class SocketClient {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SERVER_URL, {
      withCredentials: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,
    });

    this.socket.on('connect', () => {
      console.debug('[socket.io] connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.debug('[socket.io] disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[socket.io] connection error:', err.message);
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }

  /**
   * Subscribe to a specific analysis session room so the server sends
   * targeted sensor_reading / analysis_result events for that session only.
   */
  subscribeToSession(sessionId) {
    this.socket?.emit('subscribe_session', sessionId);
  }

  unsubscribeFromSession(sessionId) {
    this.socket?.emit('unsubscribe_session', sessionId);
  }

  on(event, callback) {
    this.socket?.on(event, callback);
    return () => this.socket?.off(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }

  emit(event, data) {
    this.socket?.emit(event, data);
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const wsClient = new SocketClient();
export default wsClient;
