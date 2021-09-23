# WhaleClient

这个一个封装了websocket的一个插件，替换老式插件，更高效的交互和调试


## 初始化
  - 安装依赖包
  ```
   npm install whale-client
  ```
  - 项目运行
    - 初始化
    ```
      const client = new WhaleClient(config);
    ```
    - 判断是否连接成功
    ```
      let isconnected = client.isConnected();
    ```
    - 发送一次请求
    ```
      client.request(method, params, callback);
    ```
    - 订阅消息
    ```
      let unsubscribe = client.subscribe(method, callback);
    ```
    - 取消订阅
    ```
      let unsubscribe = client.subscribe(method, callback);
      unsubscribe();
      
    ```
    - 断开连接
    ```
      client.disconnect();
    ```