/**
 * 商品详情页:GET /product/:id(MUI)
 */
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useWatcher } from "alova/client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { Button } from "@components";
import { getProduct } from "../api/products";
import { buyNow as submitOrder } from "../api/order";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { normalizeProduct } from "../utils/product";
import { categoryLabel } from "../utils/categories";
import ProductChat from "../components/ProductChat";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, severity: "success", text: "" });
  // 当前登录用户 id(无登录态时回退到需求给定的默认 userId)
  const userId = user?.id ?? user?.userId ?? "2085560549508255744";
  const userName = user?.nickname || user?.username || "我";

  const { loading, error, data } = useWatcher(() => getProduct(id), [id], {
    immediate: true,
    initialData: null,
  });

  const product = normalizeProduct(data);

  const showToast = (severity, text) =>
    setToast({ open: true, severity, text });

  // 加入购物车(本地购物车)
  const addToCart = () => {
    if (!product) return;
    addItem(product);
    showToast("success", "已加入购物车");
  };

  // 立即购买:直接调 POST /api/order/buy(数量 1)
  const buyNow = async () => {
    if (!product) return;
    try {
      await submitOrder({
        productionId: String(product.id),
        quantity: 1,
      }).send();
      showToast("success", "下单成功");
      setTimeout(() => navigate("/"), 900);
    } catch (e) {
      showToast("error", e?.message || "下单失败,请重试");
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Link
          to="/"
          style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}
        >
          ← 返回商品广场
        </Link>
        {product?.category && (
          <Link
            to={`/category/${product.category}`}
            style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}
          >
            ← 返回分类
          </Link>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button variant="ghost" onClick={() => navigate(0)}>
              重试
            </Button>
          }
        >
          加载失败:{error.message}
        </Alert>
      )}

      {loading && !product && <Skeleton variant="rounded" height={320} />}

      {!loading && !error && product && (
        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexWrap: { xs: "wrap", md: "nowrap" },
            bgcolor: "background.paper",
            borderRadius: "14px",
            p: 3.5,
            boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              flex: { xs: "1 1 100%", md: "0 0 320px" },
              height: { xs: 240, md: 320 },
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: product.picture
                ? `url(${product.picture}) center/cover no-repeat`
                : product.thumbBg,
            }}
          >
            {!product.picture && (
              <Box component="span" sx={{ fontSize: { xs: 80, md: 120 } }}>
                {product.emoji}
              </Box>
            )}
            {product.tag && (
              <Chip
                label={product.tag}
                size="small"
                color="primary"
                sx={{ position: "absolute", top: 10, left: 10 }}
              />
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {product.category !== "" && product.category != null && (
              <Box sx={{ mb: 1 }}>
                <Chip
                  label={categoryLabel(product.category)}
                  size="small"
                  sx={{ bgcolor: "rgba(76,29,149,.08)", color: "#4C1D95", fontWeight: 600 }}
                />
              </Box>
            )}
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              {product.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, lineHeight: 1.8 }}
            >
              {product.description}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <Typography
                component="span"
                sx={{ color: "#E11D48", fontSize: 30, fontWeight: 800 }}
              >
                ¥{product.price}
              </Typography>
              {product.originalPrice > product.price && (
                <Typography
                  component="del"
                  color="text.disabled"
                  sx={{ fontSize: 14 }}
                >
                  ¥{product.originalPrice}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                mb: 3,
                color: "text.secondary",
                fontSize: 13,
              }}
            >
              <span>已售 {product.sales}</span>
              {product.stock !== undefined && product.stock !== null && (
                <span>库存 {product.stock}</span>
              )}
            </Box>

            <Box
              sx={{ mt: "auto", display: "flex", gap: 1.5, flexWrap: "wrap" }}
            >
              <Button
                size="lg"
                variant="contained"
                startIcon={<span>🛒</span>}
                onClick={addToCart}
                sx={{
                  minWidth: 150,
                  bgcolor: "#F59E0B",
                  color: "#fff",
                  "&:hover": { bgcolor: "#D97706" },
                }}
              >
                加入购物车
              </Button>
              <Button
                size="lg"
                variant="contained"
                startIcon={<span>⚡</span>}
                onClick={buyNow}
                sx={{ minWidth: 150 }}
              >
                立即购买
              </Button>
              <Button
                size="lg"
                startIcon={<span>💬</span>}
                onClick={() => setChatOpen(true)}
                sx={{ minWidth: 120 }}
              >
                咨询客服
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      {/* 商品咨询聊天室(点击「咨询客服」展开) */}
      <ProductChat
        userId={userId}
        productId={product ? String(product.id) : ""}
        userName={userName}
        productName={product ? product.name : ""}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
      {/* 加购成功提示 */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
