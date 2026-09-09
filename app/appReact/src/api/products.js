/**
 * 商品相关接口(baseURL=/api,实际请求 /api/*)
 */
import { alovaInstance } from "./index";

/** 商品列表(分页) @param { { current?, pageSize? } } */
export const getProducts = (params) =>
  alovaInstance.Get("/product/page", {
    params: { current: 1, pageSize: 10, ...params },
    // 相同筛选条件 5 秒内命中缓存,切换即时生效
    cacheFor: 5000,
  });

/** 商品详情 @param { string|number } id */
export const getProduct = (id) =>
  alovaInstance.Get(`/product/${id}`, {
    cacheFor: 60000,
  });

/**
 * 新建商品:POST /product
 * @param {object} payload { name, category, price, originalPrice, description, tag, emoji }
 */
export const createProduct = (payload) =>
  alovaInstance.Post("/product", payload);
