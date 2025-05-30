// Mock WebSocket module for React Native
// This prevents the ws library from being imported and causing Node.js module errors

class MockWebSocket {
  constructor() {
    console.warn('WebSocket features are disabled in this React Native app');
  }
  
  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
}

module.exports = MockWebSocket;
module.exports.WebSocket = MockWebSocket;
module.exports.default = MockWebSocket; 