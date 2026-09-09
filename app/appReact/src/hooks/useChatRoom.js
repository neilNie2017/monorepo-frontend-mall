import { useCallback, useRef, useState } from "react";
import { createChatRoom, parseChatRoom } from "../api/chat";
import { StompClient } from "../lib/stomp";
import { TOKEN_KEY, USE_MOCK } from "../api";
import { buildProductCard } from "../utils/product";

/** WebSocket 连接地址(可经 .env 的 VITE_WS_BASE 覆盖) */
const WS_URL = import.meta.env.VITE_WS_BASE || "ws://10.50.143.22:8080/api/ws";

/**
 * 模拟模式(VITE_USE_MOCK=true)下:不连真实 WebSocket,由本地"客服"自动回消息,
 * 以便离线完整演示聊天交互;切回真实后端(VITE_USE_MOCK=false)时走真实 STOMP。
 */
const SIMULATE = USE_MOCK;

/* 消息类型(messageType):1=用户文本  2=商家文本  4=商品卡片 */
const MSG_TEXT = 1;
const MSG_SELLER_TEXT = 2;
const MSG_PRODUCT_CARD = 4;

/* 发送者类型(senderType):1=买家(当前用户)  2=卖家(商家) */
const SENDER_BUYER = 1;
const SENDER_SELLER = 2;

const SERVICE_NAME = "客服小尚";
const WELCOME = "您好,我是客服小尚~ 看到您在咨询商品,有什么可以帮您? 😊";
const AUTO_REPLY = (text) =>
  `收到~关于您说的「${text}」,我们已为您记录,稍后由专属客服为您详细解答。如需人工请回复「人工」。`;
const CARD_REPLY = (name) =>
  `已收到您咨询的「${name}」,这款商品很受欢迎哦~ 需要我为您安排下单吗?`;

/**
 * 商品聊天室逻辑:
 *  1. 点击聊天图标 -> 创建聊天室(拿到 roomId)
 *  2. 连接 WebSocket 并订阅 /web/chat/{roomId}(兼订阅 /topic/chat/{roomId})
 *  3. 通过 /web/chat/{roomId} 目的地收发消息
 *  模拟模式下第 2/3 步由本地客服代替。
 *
 *  @param {string} [initialRoomId] 已有房间时(如从消息中心进入)直接复用,跳过创建接口
 */
export function useChatRoom({ userId, productId, userName, productName, initialRoomId }) {
  const [roomId, setRoomId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const clientRef = useRef(null);
  const roomIdRef = useRef(null);
  const simTimerRef = useRef(null);

  /** 确保聊天室已创建,返回 roomId(已创建则直接复用,不重复建房) */
  const ensureRoom = useCallback(async () => {
    if (roomIdRef.current) return roomIdRef.current;
    // 从消息中心等场景带入已有 roomId:直接复用,跳过创建接口
    if (initialRoomId) {
      roomIdRef.current = initialRoomId;
      setRoomId(initialRoomId);
      return initialRoomId;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await createChatRoom({ userId, productId }).send();
      const { roomId: rid, history } = parseChatRoom(res);
      if (!rid) throw new Error("创建聊天室失败:响应中未找到 roomId");
      roomIdRef.current = rid;
      setRoomId(rid);
      // 载入历史消息(新接口在 data.chatMessages 中一并返回)
      if (history.length) setMessages(history);
      return rid;
    } catch (e) {
      setError(e?.message || "创建聊天室失败");
      throw e;
    } finally {
      setCreating(false);
    }
  }, [userId, productId, initialRoomId]);

  /** 连接 WebSocket 并订阅聊天室 */
  const connect = useCallback(async () => {
    const rid = await ensureRoom();
    if (!rid) throw new Error("缺少 roomId");

    // 模拟模式:跳过真实 WebSocket,直接"已连接"并推送欢迎语
    if (SIMULATE) {
      setConnected(true);
      setMessages((prev) =>
        prev.length
          ? prev
          : [
              {
                id: `s-${Date.now()}`,
                senderId: "service",
                senderName: SERVICE_NAME,
                content: WELCOME,
                self: false,
                time: Date.now(),
              },
            ]
      );
      return;
    }

    if (clientRef.current) return;

    const token = localStorage.getItem(TOKEN_KEY);
    const connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const client = new StompClient({
      url: WS_URL,
      connectHeaders,
      onMessage: (frame) => {
        let msg = {};
        try {
          msg = JSON.parse(frame.body);
        } catch {
          msg = { content: frame.body };
        }
        const messageType = Number(msg.messageType);
        const senderType = Number(msg.senderType);
        const senderId = msg.senderId ?? msg.sender;

        // 左右判定:优先 senderType(1=买家/自己, 2=卖家),缺失时按 messageType 兜底
        let self;
        if (senderType === SENDER_SELLER) self = false;
        else if (senderType === SENDER_BUYER) self = true;
        else self = messageType ? messageType === MSG_TEXT : senderId === userId;

        // messageType=4:商品卡片
        let card = null;
        if (
          messageType === MSG_PRODUCT_CARD ||
          msg.card ||
          msg.product
        ) {
          const cardSrc =
            msg.product && typeof msg.product === "object" ? msg.product : msg;
          card = buildProductCard(cardSrc);
        }

        const senderName =
          senderType === SENDER_SELLER || messageType === MSG_SELLER_TEXT
            ? "商家"
            : msg.senderName || "我";

        setMessages((prev) => [
          ...prev,
          {
            id:
              frame.headers["message-id"] || `m-${Date.now()}-${Math.random()}`,
            senderId,
            senderName,
            content: msg.content ?? msg.text ?? card?.name ?? frame.body,
            self,
            time: msg.timestamp ?? Date.now(),
            card,
          },
        ]);
      },
      onClose: () => setConnected(false),
      onError: (e) => setError(e?.message || "WebSocket 连接错误"),
    });

    clientRef.current = client;
    await client.connect();
    // 订阅两种常见 broker 前缀,提升兼容度
    client.subscribe(`/topic/chat/${rid}`);
    setConnected(true);
  }, [ensureRoom, userId]);

  /** 发送一条文本消息到 /web/chat/{roomId}(messageType=1) */
  const sendMessage = useCallback(
    (text) => {
      const rid = roomIdRef.current;
      if (!rid) return false;
      const payload = {
        roomId: rid,
        productId,
        senderId: userId,
        senderName: userName,
        senderType: SENDER_BUYER, // 1=买家(当前用户)
        messageType: MSG_TEXT, // 1=用户文本
        content: text,
        type: "CHAT",
        timestamp: Date.now(),
      };

      // 模拟模式:本地回显 + 客服自动回复
      if (SIMULATE) {
        setMessages((prev) => [
          ...prev,
          {
            id: `me-${Date.now()}`,
            senderId: userId,
            senderName: userName,
            content: text,
            self: true,
            time: Date.now(),
          },
        ]);
        clearTimeout(simTimerRef.current);
        simTimerRef.current = setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `s-${Date.now()}`,
              senderId: "service",
              senderName: SERVICE_NAME,
              content: AUTO_REPLY(text),
              self: false,
              time: Date.now(),
            },
          ]);
        }, 800);
        return true;
      }

      if (!clientRef.current) return false;
      try {
        clientRef.current.send(`/web/chat/${rid}`, JSON.stringify(payload));
        return true;
      } catch (e) {
        setError(e?.message || "发送失败");
        return false;
      }
    },
    [productId, userId, userName]
  );

  /**
   * 发送商品卡片消息(messageType=4)
   * @param {object} product 商品数据(支持 id/productId、name/productName 等字段)
   */
  const sendProductCard = useCallback(
    (product) => {
      const rid = roomIdRef.current;
      if (!rid) return false;
      const card = buildProductCard(product);
      const payload = {
        roomId: rid,
        productId,
        senderId: userId,
        senderName: userName,
        senderType: SENDER_BUYER, // 1=买家(当前用户)
        messageType: MSG_PRODUCT_CARD, // 4=商品卡片
        content: card.name || "商品卡片",
        product: card, // 商品详情
        timestamp: Date.now(),
      };

      // 模拟模式:本地回显卡片 + 客服自动回复
      if (SIMULATE) {
        setMessages((prev) => [
          ...prev,
          {
            id: `me-${Date.now()}`,
            senderId: userId,
            senderName: userName,
            content: card.name,
            self: true,
            time: Date.now(),
            card,
          },
        ]);
        clearTimeout(simTimerRef.current);
        simTimerRef.current = setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `s-${Date.now()}`,
              senderId: "service",
              senderName: SERVICE_NAME,
              content: CARD_REPLY(card.name),
              self: false,
              time: Date.now(),
            },
          ]);
        }, 800);
        return true;
      }

      if (!clientRef.current) return false;
      try {
        clientRef.current.send(`/web/chat/${rid}`, JSON.stringify(payload));
        return true;
      } catch (e) {
        setError(e?.message || "发送失败");
        return false;
      }
    },
    [productId, userId, userName]
  );

  /** 断开并清理 WebSocket */
  const disconnect = useCallback(() => {
    if (SIMULATE) {
      clearTimeout(simTimerRef.current);
      setConnected(false);
      return;
    }
    if (clientRef.current) {
      clientRef.current.close();
      clientRef.current = null;
    }
    setConnected(false);
  }, []);

  return {
    roomId,
    connected,
    messages,
    creating,
    error,
    ensureRoom,
    connect,
    disconnect,
    sendMessage,
    sendProductCard,
  };
}
