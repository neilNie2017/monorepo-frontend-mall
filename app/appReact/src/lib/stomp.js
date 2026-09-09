/**
 * 极简 STOMP 1.2 over WebSocket 客户端(零依赖)
 *
 * 适配后端 Spring WebSocket + STOMP:
 *   - 连接端点:ws://<host>/api/ws
 *   - 发送目的地(destination):/web/chat/{roomId}
 *   - 订阅目的地:同时订阅 /web/chat/{roomId} 与 /topic/chat/{roomId} 以兼容不同 broker 前缀
 *
 * 仅实现 demo 所需最小子集:CONNECT / CONNECTED / SEND / SUBSCRIBE / MESSAGE / ERROR / DISCONNECT
 */

const NULL = "\u0000";

function utf8ByteLength(str) {
  if (typeof TextEncoder !== "undefined")
    return new TextEncoder().encode(str).length;
  // 兜底:近似按中文 3 字节、其余 1 字节
  return str.replace(/[^\x00-\xff]/g, "xxx").length;
}

export class StompClient {
  constructor({
    url,
    connectHeaders = {},
    onMessage,
    onConnected,
    onClose,
    onError,
    debug = true,
  }) {
    this.url = url;
    this.connectHeaders = connectHeaders;
    this.onMessage = onMessage;
    this.onConnected = onConnected;
    this.onClose = onClose;
    this.onError = onError;
    this.debug = debug;
    this.ws = null;
    this.connected = false;
    this._buffer = "";
    this._subs = new Set();
    this._subSeq = 0;
  }

  /** 连接并在收到 CONNECTED 帧后 resolve */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.ws) {
        resolve();
        return;
      }
      let settled = false;
      const ws = new WebSocket(this.url);
      this.ws = ws;

      ws.onopen = () => {
        const headers = {
          "accept-version": "1.2",
          "heart-beat": "0,0",
          ...this.connectHeaders,
        };
        try {
          headers.host = new URL(this.url).host;
        } catch {
          /* ignore */
        }
        this._sendFrame("CONNECT", headers);
        if (this.onConnected) this.onConnected();
      };

      ws.onmessage = (ev) => this._onData(String(ev.data), resolve, reject);

      ws.onclose = () => {
        this.connected = false;
        this._subs.clear();
        if (this.onClose) this.onClose();
      };

      ws.onerror = (e) => {
        if (this.debug) console.warn("[stomp] ws error", e);
        if (!settled) {
          settled = true;
          reject(e);
        }
        if (this.onError) this.onError(e);
      };
    });
  }

  _onData(raw, resolve, reject) {
    this._buffer += raw;
    let idx;
    while ((idx = this._buffer.indexOf(NULL)) !== -1) {
      const frameText = this._buffer.slice(0, idx);
      this._buffer = this._buffer.slice(idx + 1);
      if (frameText.length === 0) continue; // 心跳空帧
      const frame = this._parseFrame(frameText);
      if (frame) this._handleFrame(frame, resolve, reject);
    }
  }

  _parseFrame(text) {
    const sep = text.indexOf("\n\n");
    if (sep === -1) return null;
    const headerPart = text.slice(0, sep);
    let body = text.slice(sep + 2);
    const lines = headerPart.split("\n");
    const command = lines[0];
    const headers = {};
    for (let i = 1; i < lines.length; i++) {
      const c = lines[i].indexOf(":");
      if (c > -1) headers[lines[i].slice(0, c)] = lines[i].slice(c + 1);
    }
    if (headers["content-length"] != null) {
      body = body.slice(0, Number(headers["content-length"]));
    }
    return { command, headers, body };
  }

  _handleFrame(frame, resolve) {
    if (this.debug)
      console.debug("[stomp]", frame.command, frame.headers, frame.body);
    switch (frame.command) {
      case "CONNECTED":
        this.connected = true;
        // 重发已订阅的目的地(连接后补订阅)
        for (const dest of this._subs) this._subscribe(dest);
        resolve();
        break;
      case "MESSAGE":
        if (this.onMessage) this.onMessage(frame);
        break;
      case "ERROR": {
        const err = new Error(
          frame.body || frame.headers.message || "STOMP ERROR"
        );
        if (this.onError) this.onError(err);
        resolve(); // 避免 promise 悬挂
        break;
      }
      default:
        break;
    }
  }

  subscribe(destination) {
    this._subs.add(destination);
    if (this.connected) this._subscribe(destination);
  }

  _subscribe(destination) {
    const id = `sub-${++this._subSeq}`;
    this._sendFrame("SUBSCRIBE", { id, destination });
  }

  send(destination, body) {
    if (!this.connected || !this.ws) throw new Error("STOMP 尚未连接");
    this._sendFrame(
      "SEND",
      { destination, "content-type": "application/json" },
      body
    );
  }

  _sendFrame(command, headers, body = "") {
    let frame = command + "\n";
    for (const [k, v] of Object.entries(headers)) {
      if (v != null) frame += `${k}:${v}\n`;
    }
    if (body) frame += `content-length:${utf8ByteLength(body)}\n`;
    frame += "\n" + body + NULL;
    if (this.debug) console.debug("[stomp] >>", frame.replace(/\0/g, ""));
    this.ws.send(frame);
  }

  close() {
    if (this.ws) {
      if (this.connected)
        this._sendFrame("DISCONNECT", { receipt: `r-${Date.now()}` });
      try {
        this.ws.close();
      } catch {
        /* ignore */
      }
      this.ws = null;
    }
    this.connected = false;
  }
}
