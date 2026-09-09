/**
 * 聊天消息气泡(共享组件)
 *   - 普通文本消息:message.content 渲染为气泡
 *   - 商品卡片消息(message.card):渲染为带商品详情的卡片(messageType=4)
 * 无真实商品图,用 emoji + 渐变色占位。
 */
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function formatTime(t) {
  try {
    const d = new Date(Number(t));
    if (isNaN(d.getTime())) return "";
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export default function ChatBubble({ message: m }) {
  const card = m?.card;
  const isCard = !!card && Object.keys(card).length > 0;

  return (
    <Box
      sx={{
        alignSelf: m.self ? "flex-end" : "flex-start",
        maxWidth: isCard ? 264 : "82%",
      }}
    >
      {!m.self && m.senderName && (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          {m.senderName}
        </Typography>
      )}

      {isCard ? (
        /* ---------- 商品卡片消息(messageType=4) ---------- */
        <Box
          sx={{
            mt: 0.25,
            width: 248,
            bgcolor: "#fff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* 图片占位(暂无真实图,用渐变 + emoji) */}
          <Box
            sx={{
              height: 116,
              background: card.thumbBg || "linear-gradient(135deg, #eef1f6, #e2e8f0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: 46, lineHeight: 1 }}>
              {card.emoji || "🛍️"}
            </Typography>
          </Box>
          <Box sx={{ p: 1.25 }}>
            <Typography fontWeight={700} fontSize={13.5} noWrap title={card.name}>
              {card.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
              <Typography
                component="span"
                sx={{ color: "#ff3b30", fontWeight: 800, fontSize: 16 }}
              >
                ¥{card.price ?? 0}
              </Typography>
              {card.originalPrice > card.price && (
                <Typography component="del" color="text.disabled" fontSize={12}>
                  ¥{card.originalPrice}
                </Typography>
              )}
            </Box>
            {card.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.5,
                }}
              >
                {card.description}
              </Typography>
            )}
            {card.productId != null && (
              <Typography
                component={Link}
                to={`/product/${card.productId}`}
                fontSize={12}
                sx={{
                  display: "inline-block",
                  mt: 1,
                  color: "primary.main",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                查看商品 ↗
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        /* ---------- 普通文本消息 ---------- */
        <Box
          sx={{
            bgcolor: m.self ? "primary.main" : "#fff",
            color: m.self ? "#fff" : "text.primary",
            px: 1.5,
            py: 1,
            borderRadius: "8px",
            fontSize: 13,
            boxShadow: 1,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            mt: 0.25,
          }}
        >
          {m.content}
        </Box>
      )}

      {m.time && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{
            display: "block",
            mt: 0.25,
            textAlign: m.self ? "right" : "left",
          }}
        >
          {formatTime(m.time)}
        </Typography>
      )}
    </Box>
  );
}
