/**
 * 消息中心相关接口(baseURL=/api,实际请求 /api/*)
 * 会话列表:GET /chatRoom/getUserAll
 *   返回用户的所有聊天室房间数组,每条结构:
 *   { Id, productId, userId, status, createdTime, updatedTime, createdBy, updatedBy }
 *   注意:房间主键字段名为大写的 Id
 */
import { alovaInstance } from "./index";

/**
 * 归一化 /chatRoom/getUserAll 的响应为统一结构
 * 兼容:直接数组 | { records } | { list } | { rows } | { data }
 * @param {any} res alova 解包后的响应(通常已是 data 部分)
 * @returns {{ list: Array<{roomId, productId, userId, status, updatedTime, createdTime}>, totalUnread: number }}
 */
export const normalizeRooms = (res) => {
  let list = res;
  if (res && !Array.isArray(res)) {
    list = res.records ?? res.list ?? res.rows ?? res.data ?? [];
  }
  if (!Array.isArray(list)) list = [];
  const rooms = list
    .filter((r) => r && typeof r === "object")
    .map((r) => ({
      roomId: r.Id ?? r.id ?? r.roomId,
      productId: r.productId,
      userId: r.userId,
      status: r.status,
      updatedTime: r.updatedTime ?? r.createdTime,
      createdTime: r.createdTime,
    }));
  // 该接口无未读字段,未读数统一为 0
  return { list: rooms, totalUnread: 0 };
};

/** 获取当前用户的聊天室列表(返回 alova Method,调用方 .send() 或 useRequest) */
export const getMessageCenter = () =>
  alovaInstance.Get("/chatRoom/getUserAll", { cacheFor: 0 });
