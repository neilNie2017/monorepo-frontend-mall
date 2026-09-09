/**
 * 分类商品列表页
 * 路由:/category/:categoryId
 * 左侧:分类树(来自 /api/category/tree),支持展开/折叠子分类
 * 右侧:商品网格(来自 /api/product/page?category=xxx),支持排序
 */
import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRequest } from "alova/client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import { Button } from "@components";
import { getProducts } from "../api/products";
import { getCategoryTree, normalizeCategoryTree } from "../api/categories";

/* ---------- 排序选项 ---------- */
const SORT_OPTIONS = [
  { key: "default", label: "综合" },
  { key: "sales", label: "销量" },
  { key: "price_asc", label: "价格↑" },
  { key: "price_desc", label: "价格↓" },
];

/* ---------- 商品占位渐变(与 Home.jsx 一致) ---------- */
const PRODUCT_GRADIENTS = [
  "linear-gradient(135deg, #312E81 0%, #4338CA 50%, #6366F1 100%)",
  "linear-gradient(135deg, #047857 0%, #059669 50%, #34D399 100%)",
  "linear-gradient(135deg, #BE185D 0%, #E11D48 50%, #FB7185 100%)",
  "linear-gradient(135deg, #B45309 0%, #D97706 50%, #FBBF24 100%)",
  "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #60A5FA 100%)",
  "linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A78BFA 100%)",
];
const getProductBg = (p) => {
  const id = Number(p?.id) || 0;
  return PRODUCT_GRADIENTS[Math.abs(id) % PRODUCT_GRADIENTS.length];
};

/* ---------- 商品卡片 ---------- */
function CategoryProductCard({ product, onClick }) {
  return (
    <Box
      onClick={() => onClick(product)}
      sx={{
        cursor: "pointer",
        width: "100%",
        height: 320,
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
          height: 200,
          background: product.picture
            ? `url(${product.picture}) center/cover no-repeat`
            : getProductBg(product),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "transform .4s",
          "&:hover": { transform: "scale(1.04)" },
        }}
      >
        {!product.picture && (
          <Typography sx={{ color: "rgba(255,255,255,.85)", fontSize: 56 }} role="img">
            {product.emoji || "🛍️"}
          </Typography>
        )}
        {product.tag && (
          <Chip
            label={product.tag}
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              bgcolor: "rgba(15,23,42,.7)",
              backdropFilter: "blur(8px)",
              color: "#FCD34D",
              fontWeight: 600,
              fontSize: 11,
              height: 22,
            }}
          />
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
        <Typography variant="body2" fontWeight={600} title={product.name} noWrap>
          {product.name}
        </Typography>
        {product.description && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {product.description}
          </Typography>
        )}
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
            {product.originalPrice > product.price && (
              <Typography
                component="del"
                sx={{ color: "text.disabled", fontSize: 12 }}
              >
                ¥{product.originalPrice}
              </Typography>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            已售 {product.sales ?? product.sold ?? 0}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ---------- 分类树节点 ---------- */
function CategoryTreeNode({
  node,
  selectedId,
  onSelect,
  defaultExpanded,
}) {
  const [expanded, setExpanded] = useState(
    defaultExpanded || node.children?.some((ch) => String(ch.value) === String(selectedId))
  );
  const isSelected = String(node.value) === String(selectedId);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        onClick={() => onSelect(node.value)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.875,
          borderRadius: "10px",
          cursor: "pointer",
          transition: "all .2s",
          bgcolor: isSelected ? "rgba(76,29,149,.08)" : "transparent",
          "&:hover": { bgcolor: isSelected ? "rgba(76,29,149,.12)" : "rgba(76,29,149,.04)" },
        }}
      >
        <Box sx={{ fontSize: 18, lineHeight: 1 }}>{node.emoji}</Box>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: isSelected ? 700 : 500,
            color: isSelected ? "#4C1D95" : "text.primary",
            flex: 1,
          }}
        >
          {node.label}
        </Typography>
        {hasChildren && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            sx={{ p: 0.25, color: "text.secondary" }}
          >
            <Box
              component="span"
              sx={{
                display: "inline-block",
                transition: "transform .2s",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                fontSize: 12,
              }}
            >
              ▶
            </Box>
          </IconButton>
        )}
      </Box>
      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 2.5, mt: 0.5 }}>
            {node.children.map((child) => {
              const childSelected = String(child.value) === String(selectedId);
              return (
                <Box
                  key={String(child.value)}
                  onClick={() => onSelect(child.value)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.625,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all .2s",
                    bgcolor: childSelected ? "rgba(245,158,11,.1)" : "transparent",
                    "&:hover": {
                      bgcolor: childSelected ? "rgba(245,158,11,.14)" : "rgba(76,29,149,.04)",
                    },
                  }}
                >
                  <Box sx={{ fontSize: 15, lineHeight: 1 }}>{child.emoji}</Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: childSelected ? 600 : 400,
                      color: childSelected ? "#B45309" : "text.secondary",
                    }}
                  >
                    {child.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

export default function CategoryProducts() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState("default");
  const [keyword, setKeyword] = useState("");

  /* 分类树 */
  const { data: treeData, loading: treeLoading } = useRequest(
    () => getCategoryTree(),
    { initialData: [] }
  );
  const tree = useMemo(() => normalizeCategoryTree(treeData), [treeData]);

  /* 当前分类信息 */
  const currentCategory = useMemo(() => {
    for (const node of tree) {
      if (String(node.value) === String(categoryId)) return node;
      const child = node.children?.find((ch) => String(ch.value) === String(categoryId));
      if (child) return { ...child, parentLabel: node.label, parentValue: node.value };
    }
    return null;
  }, [tree, categoryId]);

  /* 商品列表 */
  const { loading, error, data } = useRequest(
    () => getProducts({ category: categoryId }),
    [categoryId],
    { initialData: { records: [], total: 0 } }
  );

  const allProducts = useMemo(() => {
    const list = data?.records || [];
    if (sortKey === "price_asc") {
      return [...list].sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortKey === "price_desc") {
      return [...list].sort((a, b) => Number(b.price) - Number(a.price));
    }
    if (sortKey === "sales") {
      return [...list].sort((a, b) => Number(b.sales ?? 0) - Number(a.sales ?? 0));
    }
    return list;
  }, [data, sortKey]);

  const handleSelectCategory = useCallback(
    (value) => {
      navigate(`/category/${value}`);
    },
    [navigate]
  );

  const openDetail = (p) => {
    const pid = p?.productId ?? p?.id;
    if (pid) navigate(`/product/${pid}`);
  };

  return (
    <Box>
      {/* 面包屑 */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2.5, flexWrap: "wrap" }}>
        <Link to="/" style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}>
          首页
        </Link>
        <Typography sx={{ fontSize: 13, color: "#CBD5E1" }}>/</Typography>
        <Link to="/category/all" style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}>
          全部分类
        </Link>
        {currentCategory?.parentLabel && (
          <>
            <Typography sx={{ fontSize: 13, color: "#CBD5E1" }}>/</Typography>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              {currentCategory.parentLabel}
            </Typography>
          </>
        )}
        <Typography sx={{ fontSize: 13, color: "#CBD5E1" }}>/</Typography>
        <Typography sx={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>
          {currentCategory?.label || "全部分类"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2.5 }}>
        {/* 左侧分类树 */}
        <Box
          sx={{
            flex: "0 0 240px",
            bgcolor: "background.paper",
            borderRadius: "14px",
            p: 1.5,
            boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)",
            height: "fit-content",
            position: "sticky",
            top: 80,
            display: { xs: "none", md: "block" },
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ px: 1.5, py: 1, color: "#0F172A", mb: 0.5 }}
          >
            商品分类
          </Typography>

          {/* 全部商品入口 */}
          <Box
            onClick={() => navigate("/category/all")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.875,
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all .2s",
              bgcolor: categoryId === "all" ? "rgba(76,29,149,.08)" : "transparent",
              "&:hover": { bgcolor: "rgba(76,29,149,.04)" },
              mb: 0.5,
            }}
          >
            <Box sx={{ fontSize: 18, lineHeight: 1 }}>🗂️</Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: categoryId === "all" ? 700 : 500,
                color: categoryId === "all" ? "#4C1D95" : "text.primary",
              }}
            >
              全部商品
            </Typography>
          </Box>

          {treeLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Box key={`cat-skel-${i}`} sx={{ px: 1.5, py: 1 }}>
                  <Skeleton variant="text" width="80%" />
                </Box>
              ))
            : tree.map((node) => (
                <CategoryTreeNode
                  key={String(node.value)}
                  node={node}
                  selectedId={categoryId}
                  onSelect={handleSelectCategory}
                />
              ))}
        </Box>

        {/* 右侧商品区 */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* 分类标题 + 排序栏 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #312E81 0%, #4C1D95 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                {currentCategory?.emoji || "🛍️"}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A" }}>
                  {currentCategory?.label || "全部商品"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  共 {data?.total ?? 0} 件商品
                </Typography>
              </Box>
            </Box>

            {/* 排序 */}
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {SORT_OPTIONS.map((opt) => (
                <Box
                  key={opt.key}
                  onClick={() => setSortKey(opt.key)}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all .2s",
                    fontSize: 13,
                    fontWeight: sortKey === opt.key ? 700 : 400,
                    color: sortKey === opt.key ? "#4C1D95" : "text.secondary",
                    bgcolor: sortKey === opt.key ? "rgba(76,29,149,.08)" : "transparent",
                    "&:hover": { bgcolor: "rgba(76,29,149,.04)" },
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* 加载/异常提示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              加载失败:{error.message}
            </Alert>
          )}

          {/* 商品网格 */}
          {loading && allProducts.length === 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, minmax(0, 1fr))",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={320} />
              ))}
            </Box>
          ) : allProducts.length === 0 ? (
            <Box
              sx={{
                py: 10,
                textAlign: "center",
                borderRadius: "14px",
                bgcolor: "background.paper",
                boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)",
              }}
            >
              <Box sx={{ fontSize: 48, mb: 2 }}>📦</Box>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                该分类下暂无商品
              </Typography>
              <Button variant="text" size="sm" onClick={() => navigate("/category/all")}>
                查看全部商品
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, minmax(0, 1fr))",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {allProducts.map((p, i) => (
                <CategoryProductCard
                  key={p.id ?? p.productId ?? i}
                  product={p}
                  onClick={openDetail}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
