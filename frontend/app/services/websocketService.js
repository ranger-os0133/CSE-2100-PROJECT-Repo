// WebSocket service - mirrors backend app/routers/websocket.py
const WS_URL = 
  typeof window !== 'undefined' && window.location.origin === "file://"
    ? "ws://localhost:8000"
    : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000`;

export class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = {};
  }

  connect(token, otherUserId) {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws) {
          this.disconnect();
        }

        this.ws = new WebSocket(`${WS_URL}/ws/chat/${otherUserId}?token=${token}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (this.listeners['message']) {
            this.listeners['message'].forEach(cb => cb(data));
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          if (this.listeners['disconnect']) {
            this.listeners['disconnect'].forEach(cb => cb());
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
