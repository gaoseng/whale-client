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
    this.ws.onmessage = this.onWsMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onerror = this.onError.bind(this);
  };

  Client.prototype.connect = function () {
    if (!this.ws) {
      this.scheduleConnect();
    }
  };

  Client.prototype.sendMessage = function (v) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(v);
    }
  };

  Client.prototype.onWsMessage = function (ev) {
    var message;

    try {
      message = JSON.parse(ev.data);
    } catch (e) {
      console.error("error parsing data: " + ev.data);
    }

    console.log("onMessage", message);
    this.onMessage && this.onMessage(message);
  };

  Client.prototype.disconnect = function () {
    this.connected = false;
    this.ws && this.ws.close();
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
  function WhaleClient(config) {
    this.requestCbs = {};
    this.listeners = {};
    this.client = new Client({
      host: config.host || "127.0.0.1",
      port: config.port || 3000,
      insecure: config.insecure || false,
      onMessage: this.onMessage.bind(this)
    });
    this.client.connect();
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
    var id = _a.id,
        data = _a.data;
    var cb = this.requestCbs[id];

    if (cb && typeof this.requestCbs[id] === "function") {
      cb(data);
      Reflect.deleteProperty(this.requestCbs, id);
    } else {
      var listener = this.listeners[id];
      listener && listener.forEach(function (cb) {
        return cb(data);
      });
    }
  };

  WhaleClient.prototype.close = function () {
    this.client && this.client.disconnect();
  };

  WhaleClient.prototype.subscribe = function (key, cb) {
    var _this = this;

    if (Object.keys(this.listeners).includes(key)) {
      this.listeners[key].push(cb);
    } else {
      this.listeners[key] = [cb];
      var method = "notification.subscribe"; // const uuid = createUUID();

      var data = getSendData(key, method, {
        channelIds: [key]
      });

      if (this.client) {
        this.client.sendMessage(data);
      }
    }

    return function () {
      return _this.unsubscribe(key, cb);
    };
  };

  WhaleClient.prototype.unsubscribe = function (key, fn) {
    var listener = this.listeners[key];
    this.listeners[key] = listener.filter(function (item) {
      return item !== fn;
    });

    if (this.listeners[key].length === 0) {
      Reflect.deleteProperty(this.listeners, key);
    }
  };

  WhaleClient.prototype.isConnected = function () {
    return this.client.isConnected();
  };

  return WhaleClient;
}();

module.exports = WhaleClient;
