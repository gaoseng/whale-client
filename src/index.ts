import Client, { IClient, WsMessage } from "./components/client";
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
type IConfig = {
  host: string;
  port: number;
  insecure: boolean;
};
export default class WhaleClient {
  protected client: IClient;
  protected requestCbs = {};
  protected listeners: Listeners = {};
  constructor(config: IConfig) {
    this.client = new Client({
      host: config.host || "127.0.0.1",
      port: config.port || 3000,
      insecure: config.insecure || false,
      onMessage: this.onMessage,
    });
  }
  public onMessage(message: WsMessage) {
    this.response(message);
  }
  public request(method: string, params: string | object, cb: Function) {
    const uuid = createUUID();
    let data = getSendData(uuid, method, params);
    this.requestCbs[uuid] = cb;
    if (this.client) {
      this.client.sendMessage(data);
    }
  }
  public response({ id, data }: WsMessage) {
    let cb = this.requestCbs[id];
    if (cb && typeof this.requestCbs[id] === "function") {
      cb(data);
      Reflect.deleteProperty(this.requestCbs, id);
    } else {
      let listener = this.listeners[id];
      listener && listener.forEach((cb) => cb(data));
    }
  }
  public close() {
    this.client?.disconnect();
  }
  public subscribe(key: string, cb: Function) {
    if (Object.keys(this.listeners).includes(key)) {
      this.listeners[key].push(cb);
    } else {
      this.listeners[key] = [cb];
      const method = "notification.subscribe";
      const uuid = createUUID();
      let data = getSendData(uuid, method, {
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
}
