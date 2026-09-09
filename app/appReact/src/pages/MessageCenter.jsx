/**
 * 消息中心
 * 展示当前用户的聊天室房间列表(每个商品对应一个房间)。
 * 数据来自 GET /chatRoom/getUserAll(房间数组,主键字段为大写 Id)。
 * 点击房间 → 进入独立聊天页 /chat/:roomId。
 */
import { useRequest } from "alova/client";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Avatar from "@mui/material/Avatar";
import { getMessageCenter, normalizeRooms } from "../api/messages";
import { getProduct } from "../api/products";

function formatTime(t) {
  if (!t) return "";
  const d = new Date(t);
  if (isNaN(d.getTime())) return "";
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}

/** 单个房间行:动态拉取商品信息用于展示名称/图标;无 productId 时用通用文案 */
function RoomRow({ room, onClick }) {
  const { data: product } = useRequest(() => getProduct(room.productId), {
    immediate: room.productId != null,
    initialData: null,
  });
  const hasProduct = room.productId != null;
  const hasRoom = room.roomId != null;
  const title = product?.name || (hasProduct ? `商品咨询 #${room.productId}` : "商品咨询");
  const emoji = product?.emoji || "💬";
  const sub = "点击进入聊天界面";

  return (
    <ListItemButton
      divider
      disabled={!hasRoom}
      onClick={() => onClick(room)}
    >
      <Avatar sx={{ bgcolor: "primary.light", mr: 2, fontSize: 22 }}>
        {emoji}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography fontWeight={600} noWrap sx={{ flex: 1, minWidth: 0 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.disabled" noWrap>
            {formatTime(room.updatedTime)}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          sx={{ mt: 0.5 }}
        >
          {sub}
        </Typography>
      </Box>
    </ListItemButton>
  );
}

export default function MessageCenter() {
  const navigate = useNavigate();
  const { data, loading, error } = useRequest(getMessageCenter());
  const { list: rooms } = normalizeRooms(data);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          消息中心
        </Typography>
        {rooms.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            共 {rooms.length} 个会话
          </Typography>
        )}
      </Box>

      <Paper sx={{ overflow: "hidden", borderRadius: "8px" }}>
        {loading ? (
          <Box sx={{ p: 5, textAlign: "center", color: "text.disabled" }}>
            加载中…
          </Box>
        ) : error ? (
          <Box sx={{ p: 5, textAlign: "center", color: "error.main" }}>
            {error.message || "加载失败"}
          </Box>
        ) : rooms.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center", color: "text.disabled" }}>
            暂无会话,去商品页点「咨询客服」发起第一个聊天吧
          </Box>
        ) : (
          <List disablePadding>
            {rooms.map((room) => (
              <RoomRow
                key={room.roomId ?? room.productId}
                room={room}
                onClick={(r) => {
                  if (!r.roomId) return;
                  const qs = r.productId != null ? `?productId=${encodeURIComponent(r.productId)}` : "";
                  navigate(`/chat/${encodeURIComponent(r.roomId)}${qs}`);
                }}
              />
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
