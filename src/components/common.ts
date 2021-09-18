export function createUUID(): string {
  var d = Date.now();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x03) | 0x08).toString(16);
    }
  );
  return uuid;
}

export const getSendData = (
  id: string,
  method: string,
  params: string | object
): string => {
  return JSON.stringify({
    jsonrpc: "2.0",
    id: id,
    method: method,
    params: params,
  });
};
