'use strict';

var Client = function () {
  function Client(config) {
    this.connected = false;
    var protocol = config.insecure ? "wss://" : "ws://";
    this.url = protocol + config.host + ":" + config.port;
    this.onMessage = config.onMessage;
  }

  Client.prototype.onOpen = function () {
    this.connected = true;
  };

  Client.prototype.onClose = function () {
    this.ws = undefined;
    this.connected = false;
    this.ws.close();
    this.onMessage({
      type: "close"
    });
  };

  Client.prototype.onError = function () {
    this.ws = undefined;
    this.connected = false;
    this.ws.close();
    this.onMessage({
      type: "error"
    });
  };

  Client.prototype.scheduleConnect = function () {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = this.onWsMessage;
    this.ws.onclose = this.onClose;
    this.ws.onopen = this.onOpen;
    this.ws.onerror = this.onError;
  };

  Client.prototype.connect = function () {
    if (!this.ws) {
      this.scheduleConnect();
    }
  };

  Client.prototype.sendMessage = function (v) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(v));
    }
  };

  Client.prototype.onWsMessage = function (ev) {
    var message;

    try {
      message = JSON.parse(ev.data);
    } catch (e) {
      console.error("error parsing data: " + ev.data);
    }

    this.onMessage && this.onMessage(message);
  };

  Client.prototype.disconnect = function () {
    var _a;

    (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
  };

  Client.prototype.isConnected = function () {
    return this.connected;
  };

  return Client;
}();

function createUUID() {
  var d = Date.now();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : r & 0x03 | 0x08).toString(16);
  });
  return uuid;
}
var getSendData = function getSendData(id, method, params) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id: id,
    method: method,
    params: params
  });
};

var WhaleClient = function () {
  function WhaleClient() {
    this.requestCbs = {};
    this.listeners = {};
    this.client = new Client({
      host: "127.0.0.1",
      port: 3000,
      insecure: false,
      onMessage: this.onMessage
    });
  }

  WhaleClient.prototype.onMessage = function (message) {
    this.response(message);
  };

  WhaleClient.prototype.request = function (method, params, cb) {
    var uuid = createUUID();
    var data = getSendData(uuid, method, params);
    this.requestCbs[uuid] = cb;

    if (this.client) {
      this.client.sendMessage(data);
    }
  };

  WhaleClient.prototype.response = function (_a) {
    var id = _a.id;
    var cb = this.requestCbs[id];

    if (typeof this.requestCbs[id] === "function") {
      cb();
      Reflect.deleteProperty(this.requestCbs, id);
    }
  };

  WhaleClient.prototype.close = function () {// this.client && this.client.close();
  };

  WhaleClient.prototype.subscribe = function (subInfo) {};

  return WhaleClient;
}();

module.exports = WhaleClient;
