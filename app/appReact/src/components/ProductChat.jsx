import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useChatRoom } from "../hooks/useChatRoom";
import ChatBubble from "./ChatBubble";

/**
 * 商品咨询聊天室(受控组件)
 *   open:    是否展开面板
 *   onClose: 点击关闭时回调
 */
export default function ProductChat({
  userId,
  productId,
  userName,
  productName,
  open,
  onClose,
}) {
  const {
    roomId,
    connected,
    messages,
    creating,
    error,
    connect,
    disconnect,
    sendMessage,
  } = useChatRoom({ userId, productId, userName, productName });
  const [text, setText] = useState("");
  const listRef = useRef(null);

  // 展开即连接,收起即断开
  useEffect(() => {
    if (open) {
      connect().catch((e) => console.error("[chat] connect failed", e));
    } else {
      disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const onSend = () => {
    const t = text.trim();
    if (!t || !connected) return;
    sendMessage(t);
    setText("");
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        right: 24,
        bottom: 92,
        width: 340,
        height: 460,
        maxHeight: "80vh",
        zIndex: 1300,
        bgcolor: "background.paper",
        borderRadius: "8px",
        boxShadow: 6,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 顶部栏 */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "primary.main",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography fontWeight={700} fontSize={14}>
            商品咨询
          </Typography>
          <Typography fontSize={11} sx={{ opacity: 0.9, mt: 0.25 }}>
            {connected
              ? "已连接"
              : creating
              ? "创建会话中…"
              : error
              ? "连接失败"
              : "未连接"}
            {roomId ? ` · 房间 ${roomId}` : ""}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
          ✕
        </IconButton>
      </Box>

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
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ m: "auto", textAlign: "center" }}
          >
            {connected ? "暂无消息,发送一条开始咨询吧~" : "正在连接客服…"}
          </Typography>
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
