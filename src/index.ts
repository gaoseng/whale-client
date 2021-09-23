import { Config, WsMessage } from "../typing";
import Client, { IClient } from "./components/client";
import { createUUID, getSendData } from "./components/common";

interface SubInfo {
  [id: string]: Function;
}
// interface Listener {
//   [id: string]: Function[];
// }
type Listeners = {
  [id: string]: Function[];
};
export default class WhaleClient {
  private client: IClient;
  protected requestCbs = {};
  protected listeners: Listeners = {};
  constructor(config: Config) {
    this.client = new Client({
      host: config.host || "127.0.0.1",
      port: config.port || 3000,
      path: config.path || "",
      insecure: config.insecure || false,
      onMessage: this.onMessage.bind(this),
    });
    this.client.connect();
  }
  protected onMessage(message: WsMessage) {
    this.response(message);
  }
  public request(method: string, params: string | object, cb: Function) {
    const uuid = createUUID();
    let _cb = cb;
    let _params = params;
    if (typeof params === "function") {
      _params = {};
      _cb = params;
    }
    let data = getSendData(uuid, method, _params);
    this.requestCbs[uuid] = _cb;
    if (this.client) {
      this.client.sendMessage(data);
    }
  }
  public response(msg: WsMessage) {
    const { id, channel } = msg;
    if (id && typeof this.requestCbs[id] === "function") {
      this.requestCbs[id](msg);
      Reflect.deleteProperty(this.requestCbs, id);
    } else if (channel) {
      let listener = this.listeners[id];
      listener && listener.forEach((cb) => cb(msg));
    }
  }
  public close() {
    this.client && this.client.disconnect();
  }
  public subscribe(key: string, cb: Function) {
    if (Object.keys(this.listeners).includes(key)) {
      this.listeners[key].push(cb);
    } else {
      this.listeners[key] = [cb];
      const method = "notification.subscribe";
      // const uuid = createUUID();
      let data = getSendData(key, method, {
        channelIds: [key],
      });
      if (this.client) {
        this.client.sendMessage(data);
      }
    }
    return () => this.unsubscribe(key, cb);
  }
  private unsubscribe(key: string, fn: Function): void {
    const listener = this.listeners[key];
    this.listeners[key] = listener.filter((item) => item !== fn);
    if (this.listeners[key].length === 0) {
      Reflect.deleteProperty(this.listeners, key);
    }
  }
  public isConnected() {
    return this.client.isConnected();
  }
}
