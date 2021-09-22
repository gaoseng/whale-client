export interface IClient {
  connect(): void;
  disconnect(): void;
  sendMessage(message: any): void;
  isConnected(): boolean;
}
export interface IClientConfig {
  host: string;
  port: number;
  onMessage(info: object);
  insecure: boolean;
}
export interface WsMessage {
  id: string;
  jsonrpc: string;
  result: number;
  data: object;
}
export default class Client implements IClient {
  protected url: string;
  protected port: number;
  protected ws: WebSocket;
  protected onMessage: (info: any) => void;
  protected connected: boolean = false;

  constructor(config: IClientConfig) {
    const protocol = config.insecure ? "wss://" : "ws://";
    this.url = protocol + config.host + ":" + config.port;
    this.onMessage = config.onMessage;
  }
  onOpen() {
    this.connected = true;
  }
  onClose() {
    this.ws = undefined;
    this.connected = false;
    this.ws.close();
    this.onMessage({ type: "close" });
  }
  onError() {
    this.ws = undefined;
    this.connected = false;
    this.ws.close();
    this.onMessage({ type: "error" });
  }
  protected scheduleConnect() {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = this.onWsMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onerror = this.onError.bind(this);
  }
  public connect() {
    if (!this.ws) {
      this.scheduleConnect();
    }
  }
  sendMessage(v: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(v);
    }
  }
  onWsMessage(ev: MessageEvent): void {
    let message: WsMessage;
    try {
      message = JSON.parse(ev.data);
    } catch (e) {
      console.error(`error parsing data: ${ev.data}`);
    }
    this.onMessage && this.onMessage(message);
  }
  disconnect() {
    this.connected = false;
    this.ws && this.ws.close();
  }
  isConnected() {
    return this.connected;
  }
}
