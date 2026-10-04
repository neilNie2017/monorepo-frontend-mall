/**
 * 后台商品管理接口(baseURL=/api,实际请求 /api/admin/*)
 */
import { alovaInstance } from "./index";

/** 商品列表(分页) @param { { current?, pageSize?, keyword?, status? } } */
export const getAdminProducts = (params) =>
  alovaInstance.Get("/admin/product/page", {
    params: { current: 1, pageSize: 10, ...params },
  });

/** 商品上下架/状态变更 @param { string|number } id @param { number } status */
export const updateProductStatus = (id, status) =>
  alovaInstance.Put(`/admin/product/${id}/status`, { status });

/** 删除商品 @param { string|number } id */
export const deleteProduct = (id) =>
  alovaInstance.Delete(`/admin/product/${id}`);
