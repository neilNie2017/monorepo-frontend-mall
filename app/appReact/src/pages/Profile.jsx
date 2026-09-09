/**
 * 个人中心:左侧菜单(个人信息/钱包/地址)+ 右侧内容
 * 默认显示个人信息(原样式不变);钱包/地址暂为占位面板。
 * 后端字段对齐 Java 实体:userId / username / avatar / email / phone / description
 *
 * 注意:尺寸一律用字符串 px,避免 MUI sx 间距倍数(×8)把数值放大。
 */
import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useAuth } from "../context/AuthContext";
import {
  updateUserProfile,
  uploadAvatar,
  extractUploadUrl,
  normalizeAvatarUrl,
} from "../api/profile";
import { USE_MOCK } from "../api";
import { fileToAvatarDataUrl } from "../utils/image";
import WalletPanel from "../components/WalletPanel";

/* 信息行图标(内联 SVG,零依赖) */
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IdIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const FIELD_ICONS = {
  "用户名": <UserIcon />,
  "邮箱": <MailIcon />,
  "手机号": <PhoneIcon />,
  "用户 ID": <IdIcon />,
};

/* 左侧菜单 */
const MENUS = [
  { key: "info", label: "个人信息", icon: <UserIcon /> },
  { key: "wallet", label: "钱包", icon: <WalletIcon /> },
  { key: "address", label: "地址", icon: <LocationIcon /> },
];

/* 占位面板(钱包/地址待接接口) */
function PlaceholderPanel({ icon, title, desc }) {
  return (
    <Box
      sx={{
        borderRadius: "14px",
        p: 6,
        textAlign: "center",
        bgcolor: "background.paper",
        boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)",
      }}
    >
      <Box sx={{ fontSize: 44, lineHeight: 1 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={700} sx={{ mt: 1.5, color: "#0F172A" }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        {desc}
      </Typography>
    </Box>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [section, setSection] = useState("info"); // info / wallet / address
  const [editing, setEditing] = useState(false);

  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, severity: "success", text: "" });
  const fileRef = useRef(null);

  const username = user?.username || "";
  const userId = user?.userId ?? user?.id ?? "";
  const displayName = user?.nickname || username || "未登录";
  const currentAvatar = previewUrl || user?.avatar || "";

  const showToast = (severity, text) => setToast({ open: true, severity, text });

  const resetEditState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setPreviewUrl("");
    setEmail("");
    setPhone("");
    setDescription("");
  };

  const startEdit = () => {
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setDescription(user?.description || "");
    setPendingFile(null);
    setPreviewUrl("");
    setEditing(true);
  };
  const cancelEdit = () => {
    resetEditState();
    setEditing(false);
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\//.test(file.type)) return showToast("error", "请选择图片文件");
    if (file.size > 5 * 1024 * 1024)
      return showToast("error", "图片不能超过 5MB");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = user?.avatar || "";
      if (pendingFile) {
        try {
          const res = await uploadAvatar(pendingFile).send();
          avatarUrl = normalizeAvatarUrl(extractUploadUrl(res));
          if (!avatarUrl) throw new Error("上传接口未返回图片地址");
        } catch (e) {
          if (USE_MOCK) avatarUrl = await fileToAvatarDataUrl(pendingFile);
          else throw e;
        }
      }

      await updateUserProfile({
        userId,
        username,
        email: email.trim(),
        phone: phone.trim(),
        description: description.trim(),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      }).send();

      updateUser({
        email: email.trim(),
        phone: phone.trim(),
        description: description.trim(),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      });
      resetEditState();
      setEditing(false);
      showToast("success", "保存成功");
    } catch (err) {
      showToast("error", err?.message || "保存失败,请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 920, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          gap: 2.5,
          alignItems: "flex-start",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        {/* 左侧菜单 */}
        <Box
          sx={{
            width: { xs: "100%", sm: 200 },
            flexShrink: 0,
            display: "flex",
            flexDirection: { xs: "row", sm: "column" },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            gap: 0.75,
            p: 1.25,
            bgcolor: "background.paper",
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)",
            alignSelf: { xs: "stretch", sm: "flex-start" },
          }}
        >
          {MENUS.map((m) => {
            const active = section === m.key;
            return (
              <Button
                key={m.key}
                onClick={() => {
                  setSection(m.key);
                  // 切走再切回时若处于编辑态,退出编辑
                  if (m.key !== "info" && editing) cancelEdit();
                }}
                startIcon={m.icon}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  borderRadius: "10px",
                  py: 1,
                  color: active ? "#fff" : "#475569",
                  background: active
                    ? "linear-gradient(135deg, #4C1D95 0%, #7C2D5E 100%)"
                    : "transparent",
                  boxShadow: active ? "0 4px 12px rgba(76,29,149,.25)" : "none",
                  "&:hover": {
                    background: active
                      ? "linear-gradient(135deg, #312E81 0%, #6B21A8 100%)"
                      : "rgba(76,29,149,.06)",
                  },
                  "& .MuiButton-startIcon": { m: 0, mr: 1 },
                }}
              >
                {m.label}
              </Button>
            );
          })}
        </Box>

        {/* 右侧内容 */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: 640, mx: { xs: "auto", sm: 0 }, width: "100%" }}>
          {section === "info" ? (
            <>
              {/* 顶部个人资料卡片(样式保持原样) */}
              <Box
                sx={{
                  borderRadius: "14px",
                  overflow: "hidden",
                  mb: 3,
                  boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)",
                  bgcolor: "background.paper",
                }}
              >
                {/* 渐变 banner 背景 */}
                <Box
                  sx={{
                    height: 120,
                    background: "linear-gradient(135deg, #312E81 0%, #4C1D95 50%, #7C2D5E 100%)",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -40,
                      right: -40,
                      width: 200,
                      height: 200,
                      background: "radial-gradient(circle, rgba(245,158,11,.2) 0%, transparent 70%)",
                      borderRadius: "50%",
                    },
                  }}
                >
                  {/* 编辑按钮浮在 banner 右上角 */}
                  {!editing && (
                    <Button
                      size="small"
                      onClick={startEdit}
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        bgcolor: "rgba(255,255,255,.15)",
                        backdropFilter: "blur(8px)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,.25)",
                        textTransform: "none",
                        fontSize: 13,
                        "&:hover": { bgcolor: "rgba(255,255,255,.25)" },
                      }}
                    >
                      ✏️ 编辑资料
                    </Button>
                  )}
                </Box>

                {/* 头像 + 名称区 */}
                <Box sx={{ px: 3, pb: 3, position: "relative" }}>
                  <Avatar
                    src={currentAvatar || undefined}
                    sx={{
                      width: "80px",
                      height: "80px",
                      fontSize: 30,
                      mt: "-40px",
                      border: "4px solid",
                      borderColor: "background.paper",
                      bgcolor: "linear-gradient(135deg, #4C1D95, #7C2D5E)",
                      background: "linear-gradient(135deg, #4C1D95 0%, #7C2D5E 100%)",
                      color: "#FCD34D",
                      fontWeight: 700,
                      boxShadow: "0 4px 16px rgba(76,29,149,.3)",
                    }}
                  >
                    {displayName.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 1.5, color: "#0F172A" }}>
                    {displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{username}
                  </Typography>
                  {user?.description && !editing && (
                    <Typography
                      fontSize={13}
                      color="text.secondary"
                      sx={{
                        mt: 1.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.6,
                        p: 1.5,
                        bgcolor: "rgba(76,29,149,.04)",
                        borderRadius: "10px",
                        borderLeft: "3px solid",
                        borderColor: "#4C1D95",
                      }}
                    >
                      {user.description}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* 信息列表 / 编辑表单(样式保持原样) */}
              <Box
                sx={{
                  borderRadius: "14px",
                  p: 3,
                  bgcolor: "background.paper",
                  boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)",
                }}
              >
                {!editing ? (
                  <>
                    {[
                      ["用户名", username || "-"],
                      ["邮箱", user?.email || "未设置"],
                      ["手机号", user?.phone || "未设置"],
                      ["用户 ID", userId || "-"],
                    ].map(([label, value]) => (
                      <Box
                        key={label}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 1.75,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "rgba(76,29,149,.08)",
                            color: "#4C1D95",
                            flexShrink: 0,
                          }}
                        >
                          {FIELD_ICONS[label]}
                        </Box>
                        <Typography color="text.secondary" fontSize={14} sx={{ flexShrink: 0, minWidth: 60 }}>
                          {label}
                        </Typography>
                        <Typography
                          fontSize={14}
                          fontWeight={500}
                          sx={{ wordBreak: "break-all", ml: "auto", textAlign: "right", color: "#0F172A" }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    ))}

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={startEdit}
                      sx={{
                        mt: 2.5,
                        textTransform: "none",
                        borderColor: "#4C1D95",
                        color: "#4C1D95",
                        borderRadius: "10px",
                        py: 1,
                        fontWeight: 600,
                        "&:hover": {
                          bgcolor: "rgba(76,29,149,.04)",
                          borderColor: "#312E81",
                        },
                      }}
                    >
                      编辑资料
                    </Button>
                  </>
                ) : (
                  /* ---------- 编辑模式 ---------- */
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={currentAvatar || undefined}
                        sx={{
                          width: "64px",
                          height: "64px",
                          fontSize: 26,
                          bgcolor: "transparent",
                          background: "linear-gradient(135deg, #4C1D95 0%, #7C2D5E 100%)",
                          color: "#FCD34D",
                          fontWeight: 700,
                        }}
                      >
                        {displayName.slice(0, 1).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => fileRef.current?.click()}
                          sx={{
                            textTransform: "none",
                            borderColor: "#F59E0B",
                            color: "#B45309",
                            borderRadius: "8px",
                            "&:hover": { borderColor: "#D97706", bgcolor: "rgba(245,158,11,.06)" },
                          }}
                        >
                          上传头像
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          支持 jpg/png,自动压缩
                        </Typography>
                      </Box>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={onPickFile}
                      />
                    </Box>

                    <TextField
                      label="用户名(登录账号)"
                      size="small"
                      fullWidth
                      value={username}
                      disabled
                      helperText="用户名不可修改"
                    />
                    <TextField
                      label="邮箱"
                      size="small"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                    />
                    <TextField
                      label="手机号"
                      size="small"
                      fullWidth
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="请输入手机号"
                    />
                    <TextField
                      label="简介"
                      size="small"
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="介绍一下自己吧~"
                    />

                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Button
                        onClick={cancelEdit}
                        disabled={saving}
                        sx={{ textTransform: "none", borderRadius: "8px" }}
                      >
                        取消
                      </Button>
                      <Button
                        variant="contained"
                        onClick={onSave}
                        disabled={saving}
                        startIcon={
                          saving ? <CircularProgress size={16} color="inherit" /> : null
                        }
                        sx={{
                          textTransform: "none",
                          borderRadius: "8px",
                          bgcolor: "#4C1D95",
                          "&:hover": { bgcolor: "#312E81" },
                          px: 3,
                        }}
                      >
                        保存
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          ) : section === "wallet" ? (
            <WalletPanel />
          ) : (
            <PlaceholderPanel
              icon="📍"
              title="收货地址"
              desc="新增/管理收货地址功能建设中,敬请期待~"
            />
          )}
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
