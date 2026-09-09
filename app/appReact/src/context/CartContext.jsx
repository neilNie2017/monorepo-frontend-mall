/**
 * 购物车(演示版,localStorage 持久化)
 * 真实后端就绪后可替换为下单/购物车接口,当前保证购买流程可完整演示。
 * 条目 key 统一用商品 productId/id 的字符串形式。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const CART_KEY = "mall_cart";

const pidOf = (p) => p?.productId ?? p?.id ?? p?.goodsId;

const loadCart = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // 持久化
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* ignore(超限等) */
    }
  }, [items]);

  /** 加入购物车(已存在则数量 +1) */
  const addItem = useCallback((product, qty = 1) => {
    if (!product) return;
    const pid = pidOf(product);
    if (pid == null) return;
    const key = String(pid);
    setItems((prev) => {
      const found = prev.find((it) => it.key === key);
      const snapshot = {
        key,
        productId: pid,
        name: product.name ?? product.productName ?? "商品",
        price: Number(product.price) || 0,
        picture: product.picture || "",
        emoji: product.emoji || "🛍️",
        thumbBg: product.thumbBg || "",
      };
      if (found) {
        return prev.map((it) =>
          it.key === key ? { ...it, qty: (it.qty || 0) + qty } : it
        );
      }
      return [...prev, { ...snapshot, qty }];
    });
  }, []);

  /** 修改数量(<=0 移除) */
  const setQty = useCallback((key, qty) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((it) => it.key !== key);
      return prev.map((it) => (it.key === key ? { ...it, qty } : it));
    });
  }, []);

  /** 移除单项 */
  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }, []);

  /** 清空 */
  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, it) => s + (it.qty || 0), 0);
  const total = items.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);

  const value = useMemo(
    () => ({ items, count, total, addItem, setQty, removeItem, clear }),
    [items, count, total, addItem, setQty, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
