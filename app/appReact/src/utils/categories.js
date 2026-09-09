/**
 * 商品分类工具
 * 分类主数据来自 GET /api/category/rootList(后端 category 为 Integer id)。
 * - 运行时可通过 applyCategoryRoot(list) 灌入后端返回的分类(刷新名称/emoji),
 *   并缓存到 localStorage,供详情页等按 id 反查中文名。
 * - 内置 1-6 默认值与旧示例字符串分类作为兜底。
 */

/* 内置默认分类(值兜底,后端 rootList 为空/未请求时使用) */
const DEFAULT_DEFS = {
  1: ["手机数码", "📱"],
  2: ["家用电器", "❄️"],
  3: ["服饰鞋包", "🧥"],
  4: ["美妆个护", "🧴"],
  5: ["食品生鲜", "🍊"],
  6: ["其他", "🛍️"],
};

/* 内置示例(mock)字符串分类 → 默认数值 */
const LEGACY = {
  phone: 1,
  appliance: 2,
  fashion: 3,
  beauty: 4,
  food: 5,
  other: 6,
};

const CACHE_KEY = "mall_category_names";

/** 运行时分类表(后端 rootList 覆盖默认) key: String(value) -> { label, emoji } */
const runtime = new Map();

/* 初始化时从 localStorage 恢复(上次请求过的后端分类) */
try {
  const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  Object.entries(raw).forEach(([k, v]) => runtime.set(k, v));
} catch {
  /* ignore */
}

/** 供发布页下拉使用的静态默认项 */
export const PRODUCT_CATEGORY_OPTIONS = Object.keys(DEFAULT_DEFS).map((k) => ({
  value: Number(k),
  label: DEFAULT_DEFS[k][0],
  emoji: DEFAULT_DEFS[k][1],
}));

const toKey = (v) => String(v ?? "");

/**
 * 灌入后端 rootList 分类(格式不限,自动兼容常见字段)
 * 列表项取 { categoryId|id|catId|value, categoryName|name|label, emoji? }
 */
export function applyCategoryRoot(list) {
  if (!Array.isArray(list)) return;
  const cache = {};
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const value =
      item.categoryId ?? item.catId ?? item.id ?? item.value;
    if (value == null || value === "") continue;
    const label =
      item.categoryName ?? item.name ?? item.label ?? "分类";
    const emoji = item.emoji || item.icon || "🛍️";
    const key = toKey(value);
    const rec = { label: String(label), emoji };
    runtime.set(key, rec);
    cache[key] = rec;
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
}

/** 分类信息(value 可为数字/字符串/旧字符串 key) */
const infoOf = (c) => {
  if (c == null || c === "") return null;
  const key = toKey(c);
  if (runtime.has(key)) return runtime.get(key);
  const legacy = LEGACY[String(c)];
  const numKey = legacy != null ? toKey(legacy) : key;
  if (DEFAULT_DEFS[numKey]) {
    return { label: DEFAULT_DEFS[numKey][0], emoji: DEFAULT_DEFS[numKey][1] };
  }
  return null;
};

/** 分类显示名(未知时原样返回) */
export const categoryLabel = (c) => {
  const info = infoOf(c);
  return info ? info.label : c == null || c === "" ? "" : String(c);
};

/** 分类 emoji(未知时默认购物袋) */
export const categoryEmoji = (c) => {
  const info = infoOf(c);
  return info ? info.emoji : "🛍️";
};
