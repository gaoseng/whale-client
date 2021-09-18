import Client from "./components/client";
export default function () {
  let client = new Client();
  console.log(client.onMessage("test"));
}
