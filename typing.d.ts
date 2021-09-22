interface WsMessage {
  id: string;
  jsonrpc: string;
  result: number;
  data: object;
}
interface WhaleClient {
  request(method: string, params: string | object, cb: Function): void;
  response(wsMessage: WsMessage): void;
  subscribe(key: string, cb: Function): Function;
  close();
  unsubscribe(key: string, fn: Function);
  isConnected(): boolean;
}
