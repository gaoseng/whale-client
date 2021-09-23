declare interface WsMessage {
  id: string;
  jsonrpc: string;
  result: number;
  data: object;
}
declare interface Config {
  host: string;
  port: number;
  insecure: boolean;
}
export default class WhaleClient {
  constructor(config: Config);
  request(method: string, params: string | object, cb: Function): void;
  response(wsMessage: WsMessage): void;
  subscribe(key: string, cb: Function): Function;
  close();
  unsubscribe(key: string, fn: Function);
  isConnected(): boolean;
}
