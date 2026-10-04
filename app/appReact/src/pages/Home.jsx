/**
 * 首页:大图 banner + 8 分类图标 + 限时秒杀 + 为你推荐
 * 数据:通过 alovajs 请求 /api/product/page,前 4 个进入秒杀,其余进入推荐
 * 图片:暂无真实图,按商品 id 哈希选一个渐变色占位
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRequest } from "alova/client";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Snackbar from "@mui/material/Snackbar";
import { Button } from "@components";
import homeBanner from "../assets/banner-home.webp";
import { getProducts } from "../api/products";
import { getCategoryRootList, normalizeCategoryOptions } from "../api/categories";
import { useCart } from "../context/CartContext";

/* ---------- 商品图占位渐变(按 id 哈希选取) ---------- */
const PRODUCT_GRADIENTS = [
  "linear-gradient(135deg, #312E81 0%, #4338CA 50%, #6366F1 100%)",
  "linear-gradient(135deg, #047857 0%, #059669 50%, #34D399 100%)",
  "linear-gradient(135deg, #BE185D 0%, #E11D48 50%, #FB7185 100%)",
  "linear-gradient(135deg, #B45309 0%, #D97706 50%, #FBBF24 100%)",
  "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #60A5FA 100%)",
  "linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A78BFA 100%)",
  "linear-gradient(135deg, #831843 0%, #BE185D 50%, #F472B6 100%)",
  "linear-gradient(135deg, #064E3B 0%, #047857 50%, #6EE7B7 100%)",
];
const getProductBg = (p) => {
  const id = Number(p?.id) || 0;
  return PRODUCT_GRADIENTS[Math.abs(id) % PRODUCT_GRADIENTS.length];
};

/* ---------- 秒杀倒计时(从 2 小时开始倒计) ---------- */
function useCountdown(initialSeconds = 2 * 60 * 60) {
  const [left, setLeft] = useState(initialSeconds);
  useEffect(() => {
    const timer = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);
  const hh = String(Math.floor(left / 3600)).padStart(2, "0");
  const mm = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return { hh, mm, ss, isExpired: left <= 0 };
}

/* ---------- 通用商品卡片:占位图 + 标题 + 价格 + 加购按钮 ---------- */
function ProductGridCard({ product, originalPrice, onClick, onAdd }) {
  const sales = product.sales ?? product.stock;
  const metaText = sales != null ? `已售 ${sales}` : "";
  return (
    <Box
      onClick={() => onClick(product)}
      sx={{
        cursor: onClick ? "pointer" : "default",
        width: "100%",
        height: 346,
        borderRadius: "14px",
        bgcolor: "background.paper",
        boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow .25s, transform .25s",
        "&:hover": {
          boxShadow: "0 4px 6px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.12)",
          transform: "translateY(-4px)",
        },
      }}
    >
      <Box
        sx={{
          height: 220,
          background: product.picture
            ? `url(${product.picture}) center/cover no-repeat`
            : getProductBg(product),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform .4s",
          "&:hover": { transform: "scale(1.04)" },
        }}
      >
        {!product.picture && (
          <Typography
            sx={{ color: "rgba(255,255,255,.85)", fontSize: 60 }}
            role="img"
          >
            🛍️
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          flex: 1,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          title={product.name}
          noWrap
        >
          {product.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            mt: "auto",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              component="span"
              sx={{ color: "#E11D48", fontSize: 18, fontWeight: 700 }}
            >
              ¥{product.price}
            </Typography>
            {originalPrice > product.price && (
              <Typography
                component="del"
                sx={{ color: "text.disabled", fontSize: 12 }}
              >
                ¥{originalPrice}
              </Typography>
            )}
          </Box>
          <Box
            onClick={(e) => {
              e.stopPropagation();
              if (onAdd) onAdd(product);
            }}
            role="button"
            aria-label="加入购物车"
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "1.5px solid",
              borderColor: "#F59E0B",
              color: "#F59E0B",
              bgcolor: "rgba(245,158,11,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all .2s",
              "&:hover": {
                bgcolor: "#F59E0B",
                color: "#fff",
                transform: "scale(1.1)",
                boxShadow: "0 4px 12px rgba(245,158,11,.35)",
              },
            }}
          >
            +
          </Box>
        </Box>
        {metaText && (
          <Typography variant="caption" color="text.secondary">
            {metaText}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const { addItem } = useCart();
  const [toast, setToast] = useState({ open: false, text: "" });
  const addOne = (p) => {
    addItem(p);
    setToast({ open: true, text: "已加入购物车" });
  };
  const showToast = (open) => setToast((t) => ({ ...t, open }));

  const { loading, error, data } = useRequest(() => getProducts(), {
    initialData: { records: [], total: 0 },
  });

  const allList = data?.records || [];
  const flashSaleList = useMemo(() => allList.slice(0, 4), [allList]);
  const recommendList = useMemo(() => allList.slice(4), [allList]);

  // 中间分类图标:来自 /api/category/rootList(不再写死)
  const { data: catData, loading: catLoading } = useRequest(
    () => getCategoryRootList(),
    { initialData: [] }
  );
  const catList = useMemo(() => normalizeCategoryOptions(catData), [catData]);

  const { hh, mm, ss } = useCountdown();
  const openDetail = (p) => {
    const pid = p?.productId ?? p?.id;
    if (pid) {
      navigate(`/product/${pid}`);
    }
  };

  return (
    <Box>
      {/* 顶部大图 banner */}
      <Box
        component="img"
        src={homeBanner}
        alt="首页活动 Banner"
        loading="eager"
        sx={{
          display: "block",
          width: "100%",
          height: 240,
          objectFit: "cover",
          borderRadius: "14px",
          mb: 3,
          boxShadow: "0 8px 32px rgba(76,29,149,.2)",
        }}
      />

      {/* 分类图标(来自 /api/category/rootList) */}
      {!catLoading && catList.length === 0 ? null : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(4, 1fr)",
              sm: "repeat(8, 1fr)",
            },
            gap: 1,
            mb: 4,
          }}
        >
          {catLoading && catList.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <Box key={`cat-skel-${i}`} sx={{ py: 1.5, textAlign: "center" }}>
                  <Skeleton
                    variant="circular"
                    width={34}
                    height={34}
                    sx={{ mx: "auto", mb: 0.5 }}
                  />
                  <Skeleton variant="text" width="70%" sx={{ mx: "auto" }} />
                </Box>
              ))
            : catList.map((c) => (
                <Box
                  key={String(c.value)}
                  title={c.label}
                  onClick={() => navigate(`/category/${c.value}`)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                    py: 1.5,
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all .2s",
                    "&:hover": {
                      bgcolor: "rgba(76,29,149,.06)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box sx={{ fontSize: 32, lineHeight: 1 }}>{c.emoji}</Box>
                  <Typography variant="caption" color="text.secondary">
                    {c.label}
                  </Typography>
                </Box>
              ))}
        </Box>
      )}

      {/* 加载/异常提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          加载失败:{error.message}
        </Alert>
      )}

      {/* 限时秒杀 */}
      <Box
        sx={{
          borderRadius: "14px",
          p: 2.5,
          mb: 4,
          bgcolor: "#FEF9F3",
          border: "1px solid",
          borderColor: "#F5E6D8",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 1, columnGap: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: "#0F172A" }}>
            🔥 限时秒杀
          </Typography>
          <Typography variant="body2" color="text.secondary">
            距结束
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              gap: 0.5,
              bgcolor: "#0F172A",
              color: "#FCD34D",
              borderRadius: "6px",
              px: 1,
              py: 0.25,
              fontFamily: "monospace",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>{hh}</span>
            <span>:</span>
            <span>{mm}</span>
            <span>:</span>
            <span>{ss}</span>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Button variant="text" size="sm" sx={{ color: "#F59E0B" }}>
            更多
          </Button>
        </Box>

        {loading && flashSaleList.length === 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={346} />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {flashSaleList.map((p, i) => (
              <ProductGridCard
                key={p.id ?? p.productId ?? i}
                product={p}
                // 秒杀卡用原价的 1.4 倍作为"原价"占位显示划线价
                originalPrice={Math.round(Number(p.price || 0) * 1.4)}
                onClick={openDetail}
                onAdd={addOne}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* 为你推荐 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          为你推荐
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="今日推荐" />
          <Tab label="全部已购" />
        </Tabs>
      </Box>

      {loading && recommendList.length === 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, minmax(0, 1fr))",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={346} />
          ))}
        </Box>
      ) : recommendList.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center", color: "text.disabled" }}>
          暂无推荐商品
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, minmax(0, 1fr))",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {recommendList.map((p, i) => (
            <ProductGridCard
              key={p.id ?? p.productId ?? i}
              product={p}
              onClick={openDetail}
              onAdd={addOne}
            />
          ))}
        </Box>
      )}

      {/* 加购成功提示 */}
      <Snackbar
        open={toast.open}
        autoHideDuration={1800}
        onClose={() => showToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => showToast(false)}
        >
          {toast.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
