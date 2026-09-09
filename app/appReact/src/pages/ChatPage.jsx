/**
 * 聊天页面(整页,非 modal)
 * 从消息中心点会话进入:/chat/:roomId?productId=xxx
 * 复用 useChatRoom:已有 roomId 直接连接 WebSocket,不重复创建房间。
 * 顶部展示当前商品卡片,点击「发送」→ messageType=4 商品卡片消息。
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRequest } from "alova/client";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useChatRoom } from "../hooks/useChatRoom";
import { getProduct } from "../api/products";
import { useAuth } from "../context/AuthContext";
import { normalizeProduct } from "../utils/product";
import ChatBubble from "../components/ChatBubble";

export default function ChatPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId") || "";
  const navigate = useNavigate();

  const { user } = useAuth();
  const userId = user?.id ?? user?.userId ?? "2085560549508255744";
  const userName = user?.nickname || user?.username || "我";

  // 拉取商品信息用于标题/顶部卡片(productId 为空时跳过)
  const { data } = useRequest(() => getProduct(productId), {
    immediate: !!productId,
    initialData: null,
  });
  const product = normalizeProduct(data);
  const title =
    product?.name || (productId ? `商品咨询 #${productId}` : "商品咨询");

  const {
    connected,
    messages,
    creating,
    error,
    connect,
    disconnect,
    sendMessage,
    sendProductCard,
  } = useChatRoom({
    userId,
    productId,
    userName,
    productName: title,
    initialRoomId: roomId,
  });

  const [text, setText] = useState("");
  const listRef = useRef(null);

  // 进入页面即连接,离开即断开
  useEffect(() => {
    connect().catch((e) => console.error("[chat] connect failed", e));
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 新消息自动滚动到底部
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const onSend = () => {
    const t = text.trim();
    if (!t || !connected) return;
    sendMessage(t);
    setText("");
  };

  const onSendCard = () => {
    if (!product || !connected) return;
    sendProductCard(product);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)",
        minHeight: 480,
        bgcolor: "background.paper",
        borderRadius: "8px",
        boxShadow: 1,
        overflow: "hidden",
      }}
    >
      {/* 顶部栏 */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: "primary.main",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <IconButton
          size="small"
          onClick={() => navigate("/messages")}
          sx={{ color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,.15)" } }}
          aria-label="返回消息中心"
        >
          ←
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>
            {title}
          </Typography>
          <Typography fontSize={11} sx={{ opacity: 0.9 }}>
            {connected
              ? "已连接 · 在线客服"
              : creating
              ? "正在连接…"
              : error
              ? "连接失败"
              : "未连接"}
            {roomId ? ` · 房间 ${roomId}` : ""}
          </Typography>
        </Box>
        {productId && (
          <Typography
            component={Link}
            to={`/product/${productId}`}
            fontSize={12}
            sx={{
              color: "#fff",
              textDecoration: "none",
              opacity: 0.9,
              "&:hover": { opacity: 1, textDecoration: "underline" },
            }}
          >
            查看商品 ↗
          </Typography>
        )}
      </Box>

      {/* 当前商品卡片栏:点击「发送」→ messageType=4 */}
      {product && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "#fafbfc",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "8px",
              background: product.thumbBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: 28, lineHeight: 1 }}>
              {product.emoji}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={700} fontSize={14} noWrap>
              {product.name}
            </Typography>
            <Typography sx={{ color: "#ff3b30", fontWeight: 700, fontSize: 14 }}>
              ¥{product.price}
            </Typography>
            {product.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ display: "block", mt: 0.25 }}
              >
                {product.description}
              </Typography>
            )}
          </Box>
          <Button
            size="small"
            variant="contained"
            onClick={onSendCard}
            disabled={!connected}
          >
            发送
          </Button>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: "#fff3f2",
            color: "error.main",
            fontSize: 12,
          }}
        >
          {error}
        </Box>
      )}

      {/* 消息区 */}
      <Box
        ref={listRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          bgcolor: "#f6f7f9",
        }}
      >
        {messages.length === 0 && (
          <Box
            sx={{
              m: "auto",
              textAlign: "center",
              color: "text.disabled",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            {connected ? (
              <>
                <Box component="span" sx={{ fontSize: 32 }}>
                  💬
                </Box>
                <Typography variant="caption">
                  暂无消息,发送一条开始咨询吧~
                </Typography>
              </>
            ) : (
              <>
                <CircularProgress size={22} />
                <Typography variant="caption">正在连接客服…</Typography>
              </>
            )}
          </Box>
        )}
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
      </Box>

      {/* 输入区 */}
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          gap: 1,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <TextField
          size="small"
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={connected ? "输入消息…" : "连接中…"}
          disabled={!connected}
        />
        <Button
          variant="contained"
          onClick={onSend}
          disabled={!connected || !text.trim()}
        >
          发送
        </Button>
      </Box>
    </Box>
  );
}
