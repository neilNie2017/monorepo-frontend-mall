/**
 * 商城整体布局:MUI AppBar 顶部导航 + 内容区 + 页脚
 */
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import MessageIcon from "./MessageIcon";
import { getMessageCenter, normalizeRooms } from "../api/messages";

/* 购物车图标 */
const CartIcon = ({ fontSize = 18 }) => (
  <svg width={fontSize} height={fontSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

/* 菜单图标(内联 SVG,零依赖) */
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  // 头像悬停菜单
  const [anchorEl, setAnchorEl] = useState(null);
  const closeTimerRef = useRef(null);
  const openMenu = (e) => {
    clearTimeout(closeTimerRef.current);
    setAnchorEl(e.currentTarget);
  };
  const keepMenuOpen = () => clearTimeout(closeTimerRef.current);
  const scheduleMenuClose = () => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setAnchorEl(null), 150);
  };
  const closeMenu = () => {
    clearTimeout(closeTimerRef.current);
    setAnchorEl(null);
  };
  const goMenu = (path) => {
    closeMenu();
    navigate(path);
  };

  // 拉取消息中心未读数,用于顶部图标上的红点提醒
  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    let active = true;
    getMessageCenter()
      .send()
      .then((res) => {
        // /chatRoom/getUserAll 无未读字段,未读数统一为 0(红点隐藏)
        if (active) setUnread(normalizeRooms(res).totalUnread);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar
        position="sticky"
        sx={{
          background: "linear-gradient(135deg, #312E81 0%, #4C1D95 100%)",
          boxShadow: "0 2px 20px rgba(49,46,129,.25)",
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            fontWeight={700}
            sx={{ textDecoration: "none", color: "#fff", mr: 2 }}
          >
            DEMO MALL
          </Typography>

          <Button
            component={NavLink}
            to="/"
            end
            color="inherit"
            sx={{
              textTransform: "none",
              "&.active": {
                bgcolor: "rgba(245,158,11,.2)",
                color: "#FCD34D",
              },
            }}
          >
            商品广场
          </Button>

          {/* 发布商品入口(登录后可见) */}
          {user && (
            <Button
              component={NavLink}
              to="/product/create"
              color="inherit"
              size="small"
              sx={{
                textTransform: "none",
                "&.active": {
                  bgcolor: "rgba(245,158,11,.2)",
                  color: "#FCD34D",
                },
              }}
            >
              ＋ 发布商品
            </Button>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <>
              {/* 购物车入口(带数量角标) */}
              <Tooltip title="购物车">
                <IconButton
                  component={Link}
                  to="/cart"
                  size="small"
                  sx={{
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(255,255,255,.15)" },
                  }}
                >
                  <Badge badgeContent={cartCount} color="error" overlap="circular">
                    <CartIcon fontSize={18} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* 消息中心入口:位于账户名左侧,单一消息图标 + 未读红点 */}
              <Tooltip title="消息中心">
                <IconButton
                  component={Link}
                  to="/messages"
                  size="small"
                  sx={{
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(255,255,255,.15)" },
                  }}
                >
                  <Badge badgeContent={unread} color="error" overlap="circular">
                    <MessageIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* 登录头像:悬停弹出 设置/个人/退出登录 菜单 */}
              <Box
                onMouseEnter={openMenu}
                onMouseLeave={scheduleMenuClose}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 0.75,
                  py: 0.5,
                  borderRadius: "8px",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "rgba(255,255,255,.12)" },
                }}
              >
                <Avatar
                  src={user?.avatar || undefined}
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 15,
                    bgcolor: "rgba(255,255,255,.25)",
                  }}
                >
                  {(user.nickname || user.username || "U").slice(0, 1).toUpperCase()}
                </Avatar>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#fff",
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.nickname || user.username}
                </Typography>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={closeMenu}
                  MenuListProps={{
                    onMouseEnter: keepMenuOpen,
                    onMouseLeave: closeMenu,
                  }}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{ paper: { sx: { minWidth: 168, mt: 0.5 } } }}
                >
                  <MenuItem onClick={() => goMenu("/settings")}>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    设置
                  </MenuItem>
                  <MenuItem onClick={() => goMenu("/profile")}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    个人
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem onClick={() => { closeMenu(); logout(); }}>
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    退出登录
                  </MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" size="small" sx={{ color: "#fff" }}>
                登录
              </Button>
              <Button
                component={Link}
                to="/register"
                size="small"
                variant="contained"
                sx={{ bgcolor: "#F59E0B", color: "#0F172A", "&:hover": { bgcolor: "#FCD34D" }, fontWeight: 600 }}
              >
                注册
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          px: 2.5,
          py: 3,
        }}
      >
        <Outlet />
      </Box>

      <Box
        component="footer"
        sx={{
          py: 2.5,
          textAlign: "center",
          color: "text.disabled",
          fontSize: 12,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <p style={{ margin: 0 }}>DEMO MALL · monorepo demo(alovajs + MUI)</p>
      </Box>
    </Box>
  );
}
