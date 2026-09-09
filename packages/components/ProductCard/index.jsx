/**
 * 商品卡片组件(MUI Card 封装)
 * product: { id, name, description?, price, originalPrice?, emoji?, thumbBg?, tag?, sales?, stock? }
 * onClick: 可选,传入后整卡可点击(如跳转详情)
 */
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function ProductCard({ product, onClick }) {
  const clickable = typeof onClick === "function";
  const handleClick = () => {
    if (clickable) onClick(product);
  };

  const description = product.description || "";
  const sales = product.sales ?? product.sold;
  const stock = product.stock ?? product.inventory;
  // 无销量时展示库存,均无则留空
  const metaText =
    sales != null ? `已售 ${sales}` : stock != null ? `库存 ${stock}` : "";

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: clickable ? "pointer" : "default",
        borderRadius: "14px",
        boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)",
        transition: "box-shadow .25s ease, transform .25s ease",
        "&:hover": {
          boxShadow: "0 4px 6px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.12)",
          transform: "translateY(-4px)",
        },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        className="mfd-product-card__thumb"
        sx={{
          position: "relative",
          height: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            product.thumbBg || "linear-gradient(135deg, #eef1f6, #e2e8f0)",
        }}
      >
        <span
          className="mfd-product-card__emoji"
          role="img"
          aria-label={product.name}
        >
          {product.emoji || "🛍️"}
        </span>
        {product.tag && (
          <Chip
            label={product.tag}
            size="small"
            color="primary"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              height: 20,
              fontSize: 11,
            }}
          />
        )}
      </Box>

      <CardContent
        sx={{ p: 2, pt: 1.5, display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}
      >
        <Typography variant="subtitle1" fontWeight={600} noWrap title={product.name}>
          {product.name}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {description}
          </Typography>
        )}

        <Box
          sx={{
            mt: "auto",
            pt: 1,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography component="span" sx={{ color: "#E11D48", fontSize: 17, fontWeight: 700 }}>
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
            {metaText}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
