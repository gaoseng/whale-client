import Client, { IClient, WsMessage } from "./components/client";
import { createUUID, getSendData } from "./components/common";

interface SubInfo {
  [id: string]: Function;
}
export default class WhaleClient {
  protected client: IClient;
  protected requestCbs = {};
  protected listeners = {};
  constructor() {
    this.client = new Client({
      host: "127.0.0.1",
      port: 3000,
      insecure: false,
      onMessage: this.onMessage,
    });
  }
  onMessage(message: WsMessage) {
    this.response(message);
  }
  request(method: string, params, cb) {
    const uuid = createUUID();
    let data = getSendData(uuid, method, params);
    this.requestCbs[uuid] = cb;
    if (this.client) {
      this.client.sendMessage(data);
    }
  }
  response({ id }: WsMessage) {
    let cb = this.requestCbs[id];
    if (typeof this.requestCbs[id] === "function") {
      cb();
      Reflect.deleteProperty(this.requestCbs, id);
    }
  }
  close() {
    // this.client && this.client.close();
  }
  subscribe(subInfo: SubInfo) {}
}
