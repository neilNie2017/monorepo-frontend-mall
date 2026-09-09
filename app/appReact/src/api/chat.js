/**
 * 聊天室相关接口
 * 创建聊天室:POST /api/chatRoom  { userId, productId }
 * 接口返回结构(新):
 *   { code: 200, message: "success",
 *     data: { roomId, productId, userId, chatMessages: [...] } }
 *   - data.roomId        聊天室 ID(历史版本放在 data.id,现已迁移到 roomId)
 *   - data.chatMessages[] 历史消息,每条字段:
 *       id / content / senderId / createdTime / messageType / roomId
 *       messageType: 1 = 用户(买家)  2 = 商家(卖家)
 * 基类走 alovajs(默认 /api 前缀,开发环境经 Vite 代理到 http://10.50.143.22:8080)
 */
import { alovaInstance } from "./index";
import { buildProductCard } from "../utils/product";

/**
 * 创建聊天室
 * @param {{ userId: number|string, productId: string|number }} payload
 * @returns alova Method(调用方需 .send() 发起请求)
 */
export function createChatRoom({ userId, productId }) {
  return alovaInstance.Post("/chatRoom", { userId, productId });
}

/**
 * 从接口响应中解析 roomId 与历史消息
 * @param {object} res  alova 已解包后的 data(即接口的 data 字段)
 * @returns {{ roomId: string, history: Array<object> }}
 */
export function parseChatRoom(res) {
  const data = res || {};
  const roomId = String(data.roomId ?? data.id ?? "");
  const raw = Array.isArray(data.chatMessages) ? data.chatMessages : [];
  const history = raw.map((m) => {
    const mt = Number(m.messageType);
    const st = Number(m.senderType);
    // messageType=4:商品卡片(字段可能在顶层或嵌套的 product 中)
    const isCard = mt === 4 || m.card || m.product;
    const card = isCard
      ? buildProductCard(m.product && typeof m.product === "object" ? m.product : m)
      : null;
    return {
      id: m.id ?? `h-${Math.random()}`,
      senderId: m.senderId,
      senderName: st === 2 || mt === 2 ? "商家" : "我",
      content: card ? card.name : (m.content ?? ""),
      // 左右判定:优先 senderType;缺失时 messageType 1=自己/2=商家
      self: st === 2 ? false : mt === 1 || (mt === 4 && st !== 2),
      time: m.createdTime ? new Date(m.createdTime).getTime() : Date.now(),
      card,
    };
  });
  return { roomId, history };
}
