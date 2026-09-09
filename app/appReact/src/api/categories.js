/**
 * 分类接口:GET /api/category/rootList(根分类列表)
 */
import { alovaInstance } from "./index";
import { applyCategoryRoot } from "../utils/categories";

/** 获取根分类(alova 已解包 data 层;缓存 60s) */
export const getCategoryRootList = () =>
  alovaInstance.Get("/category/rootList", { cacheFor: 60000 });

/** 获取分类树(含子分类;缓存 60s) */
export const getCategoryTree = () =>
  alovaInstance.Get("/category/tree", { cacheFor: 60000 });

/**
 * 归一化分类树,兼容直接数组 | { records } | { list }
 * 列表项:{ categoryId, categoryName, emoji?, children? }
 * @returns {Array<{ value, label, emoji, children: Array<{ value, label, emoji }> }>}
 */
export const normalizeCategoryTree = (res) => {
  let list = res;
  if (res && !Array.isArray(res)) {
    list = res.records ?? res.list ?? res.rows ?? res.data ?? [];
  }
  if (!Array.isArray(list)) list = [];
  return list
    .filter((c) => c && typeof c === "object")
    .map((c) => {
      const value = c.categoryId ?? c.catId ?? c.id ?? c.value;
      const label =
        c.categoryName ?? c.name ?? c.label ?? (value != null ? `分类${value}` : "分类");
      const emoji = c.emoji || c.icon || "🛍️";
      const rawChildren = c.children ?? c.childList ?? c.subList ?? [];
      const children = (Array.isArray(rawChildren) ? rawChildren : [])
        .filter((ch) => ch && typeof ch === "object")
        .map((ch) => {
          const cValue = ch.categoryId ?? ch.catId ?? ch.id ?? ch.value;
          const cLabel =
            ch.categoryName ?? ch.name ?? ch.label ?? (cValue != null ? `子分类${cValue}` : "子分类");
          return {
            value: cValue,
            label: String(cLabel),
            emoji: ch.emoji || ch.icon || "🛍️",
          };
        });
      return { value, label: String(label), emoji, children };
    });
};

/**
 * 归一化分类列表为下拉选项;同时把名称表灌入 utils/categories 供全局反查
 * 兼容:直接数组 | { records } | { list }
 * 列表项常见字段:categoryId/id、categoryName/name
 * @returns {Array<{ value: number|string, label: string, emoji: string }>}
 */
export const normalizeCategoryOptions = (res) => {
  let list = res;
  if (res && !Array.isArray(res)) {
    list = res.records ?? res.list ?? res.rows ?? res.data ?? [];
  }
  if (!Array.isArray(list)) list = [];
  applyCategoryRoot(list);
  return list
    .filter((c) => c && typeof c === "object")
    .map((c) => {
      const value = c.categoryId ?? c.catId ?? c.id ?? c.value;
      const label =
        c.categoryName ?? c.name ?? c.label ?? (value != null ? `分类${value}` : "分类");
      const emoji = c.emoji || c.icon || "🛍️";
      return { value, label: String(label), emoji };
    });
};
