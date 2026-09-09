/**
 * 订单接口(baseURL=/api,实际请求 /api/*)
 * 立即购买:POST /order/buy
 *   参数与后端字段一致:productionId(商品id), quantity(购买数量 ≥1)
 */
import { alovaInstance } from "./index";

/**
 * 下单
 * @param {{ productionId: string, quantity: number }} payload
 */
export const buyNow = (payload) => alovaInstance.Post("/order/buy", payload);
