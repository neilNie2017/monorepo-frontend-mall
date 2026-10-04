/**
 * 后台订单管理接口(baseURL=/api,实际请求 /api/admin/*)
 */
import { alovaInstance } from "./index";

/** 订单列表(分页) @param { { current?, pageSize?, status? } } */
export const getAdminOrders = (params) =>
  alovaInstance.Get("/admin/order/page", {
    params: { current: 1, pageSize: 10, ...params },
  });

/** 更新订单状态(发货/完成/取消等) @param { string|number } id @param { number } status */
export const updateOrderStatus = (id, status) =>
  alovaInstance.Put(`/admin/order/${id}/status`, { status });
