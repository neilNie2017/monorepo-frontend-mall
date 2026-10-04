/**
 * 钱包/充值接口
 * baseURL=/api,实际请求 /api/recharge/*
 *  - POST /recharge                    创建充值订单,返回 orderNo
 *  - POST /recharge/success/callback   充值成功回调(模拟支付完成后调用)
 *
 * 响应统一由 ./index 的拦截器解包,这里直接拿到 Result.data(orderNo / "充值成功" 字符串)。
 */
import { alovaInstance } from "./index";

/**
 * 创建充值订单
 * @param {number|string} amount 充值金额(元),需 > 0
 * @returns alova Method,组件内用 `.send()` 触发,resolve 出 orderNo 字符串
 */
export const createRechargeOrder = (amount) =>
  alovaInstance.Post("/recharge", { amount });

/**
 * 充值成功回调(模拟支付完成)
 * @param {string} orderNo 订单号
 * @returns alova Method,`.send()` 成功 resolve 出 "充值成功" 字符串;失败 reject
 */
export const rechargeSuccessCallback = (orderNo) =>
  alovaInstance.Post("/recharge/success/callback", { orderNo });
