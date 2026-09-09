/**
 * 商品数据工具:归一化字段命名 + 构建聊天商品卡片数据
 * 兼容真实后端可能出现的不同字段名(id/productId、name/productName、price/salePrice 等)
 */

export const PLACEHOLDER_GRADIENT = "linear-gradient(135deg, #eef1f6, #e2e8f0)";

/** 归一化商品字段(mock 与真实后端通用) */
export function normalizeProduct(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? raw.productId ?? raw.goodsId,
    name: raw.name ?? raw.productName ?? raw.title ?? "商品",
    price: raw.price ?? raw.salePrice ?? raw.currentPrice ?? 0,
    originalPrice: raw.originalPrice ?? raw.marketPrice ?? raw.listPrice,
    sales: raw.sales ?? raw.sold ?? raw.soldCount ?? 0,
    stock: raw.stock ?? raw.inventory,
    emoji: raw.emoji || "🛍️",
    thumbBg: raw.thumbBg || PLACEHOLDER_GRADIENT,
    tag: raw.tag || "",
    category: raw.category ?? raw.categoryId ?? "",
    picture: raw.picture || raw.image || raw.img || "",
    description: raw.description ?? raw.desc ?? raw.intro ?? "暂无描述",
  };
}

/**
 * 构建商品卡片消息数据(messageType=4)
 * 无真实图片,先用 emoji + 渐变色占位(thumbBg)
 */
export function buildProductCard(p) {
  const src = p && typeof p === "object" ? p : {};
  return {
    productId: src.productId ?? src.id ?? src.goodsId,
    name: src.name ?? src.productName ?? src.title ?? "商品",
    price: src.price ?? src.salePrice ?? src.currentPrice ?? 0,
    originalPrice: src.originalPrice ?? src.marketPrice ?? src.listPrice,
    emoji: src.emoji || "🛍️",
    thumbBg: src.thumbBg || PLACEHOLDER_GRADIENT,
    description: src.description ?? src.desc ?? src.intro ?? "",
    image: src.picture ?? src.image ?? src.img ?? "",
  };
}
