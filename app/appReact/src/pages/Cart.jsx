/**
 * 购物车页:列出购物车条目、改数量、删除、合计、去结算
 * 「去结算」逐项调 POST /api/order/buy 下单,成功后清空本地购物车。
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useCart } from "../context/CartContext";
import { buyNow } from "../api/order";

export default function Cart() {
  const { items, total, setQty, removeItem, clear } = useCart();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ open: false, severity: "success", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const show = (severity, text) => setToast({ open: true, severity, text });

  /** 去结算:逐项下单(productionId + quantity) */
  const checkout = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    const list = [...items];
    let failed = null;
    try {
      for (const it of list) {
        try {
          await buyNow({
            productionId: String(it.productId ?? it.key),
            quantity: it.qty,
          }).send();
        } catch (e) {
          failed = `${it.name}:${e?.message || "下单失败"}`;
          break;
        }
      }
      if (failed) {
        show("error", failed);
      } else {
        clear();
        show("success", `下单成功,共 ${list.length} 种商品`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const imgBg = (it) =>
    it.picture
      ? `url(${it.picture}) center/cover no-repeat`
      : it.thumbBg || "linear-gradient(135deg, #eef1f6, #e2e8f0)";

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Link to="/" style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}>
          ← 继续逛逛
        </Link>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
          购物车
        </Typography>
        {items.length > 0 && (
          <Button size="small" color="inherit" sx={{ color: "#E11D48" }} onClick={() => { clear(); show("success", "已清空购物车"); }}>
            清空
          </Button>
        )}
      </Box>

      {items.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center", borderRadius: "14px" }}>
          <Typography sx={{ fontSize: 44 }}>🛒</Typography>
          <Typography sx={{ mt: 1, color: "text.secondary" }}>
            购物车还是空的,去挑几件好物吧~
          </Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate("/")}>
            去逛逛
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, borderRadius: "14px" }}>
          {items.map((it) => (
            <Box
              key={it.key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 1.5,
                "& + &": { borderTop: "1px solid", borderColor: "divider" },
              }}
            >
              <Box
                sx={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "10px",
                  flexShrink: 0,
                  background: imgBg(it),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!it.picture && <Typography sx={{ fontSize: 30 }}>{it.emoji}</Typography>}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600} noWrap>
                  {it.name}
                </Typography>
                <Typography sx={{ color: "#E11D48", fontWeight: 700, fontSize: 15 }}>
                  ¥{it.price}
                </Typography>
              </Box>
              {/* 数量 + / - */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setQty(it.key, (it.qty || 0) - 1)}
                >
                  −
                </IconButton>
                <Typography sx={{ minWidth: 32, textAlign: "center", fontWeight: 600 }}>
                  {it.qty}
                </Typography>
                <IconButton size="small" onClick={() => setQty(it.key, (it.qty || 0) + 1)}>
                  ＋
                </IconButton>
              </Box>
              <IconButton size="small" color="inherit" sx={{ color: "#94A3B8" }} onClick={() => removeItem(it.key)}>
                ✕
              </IconButton>
            </Box>
          ))}

          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography color="text.secondary">
              合计:
              <Box component="span" sx={{ color: "#E11D48", fontSize: 22, fontWeight: 800, ml: 1 }}>
                ¥{total.toFixed(2)}
              </Box>
            </Typography>
            <Button
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ minWidth: 160, borderRadius: "10px" }}
              onClick={checkout}
            >
              {submitting ? "下单中…" : `去结算(${total.toFixed(2)} 元)`}
            </Button>
          </Box>
        </Paper>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={2200}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
