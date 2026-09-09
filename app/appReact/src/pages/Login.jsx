/**
 * 登录页(mock 模式预填演示账号 demo / 123456)
 * 表单验证与展示使用 MUI(TextField error/helperText)
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { Button, Input } from "@components";
import { useAuth } from "../context/AuthContext";
import { USE_MOCK } from "../api";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(() =>
    USE_MOCK
      ? { username: "demo", password: "123456" }
      : { username: "nick", password: "123456" }
  );
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 已登录直接进入商城
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = "请输入用户名";
    if (!form.password) nextErrors.password = "请输入密码";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(form);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.message || "登录失败,请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      className="auth-page"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        background:
          "linear-gradient(160deg, #312E81 0%, #4C1D95 40%, #7C2D5E 80%, #BE185D 100%)",
      }}
    >
      <Box
        className="auth-card"
        sx={{
          width: "100%",
          maxWidth: 400,
          bgcolor: "background.paper",
          borderRadius: "14px",
          p: 4,
          boxShadow: "0 12px 48px rgba(49,46,129,.3)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              mx: "auto",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #312E81 0%, #4C1D95 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: "0 4px 16px rgba(76,29,149,.3)",
            }}
          >
            🛍️
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
            欢迎回来
          </Typography>
          <Typography variant="body2" color="text.secondary">
            登录 DEMO MALL,发现更多好物
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Input
            label="用户名"
            placeholder="请输入用户名"
            value={form.username}
            onChange={setField("username")}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="密码"
            type="password"
            placeholder="请输入密码"
            value={form.password}
            onChange={setField("password")}
            error={errors.password}
            autoComplete="current-password"
          />

          {serverError && (
            <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <Button
            type="submit"
            block
            size="lg"
            loading={submitting}
            disabled={submitting}
            sx={{ mt: 2 }}
          >
            登 录
          </Button>
        </Box>

        {USE_MOCK && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", mt: 2 }}
          >
            演示账号:demo / 123456
          </Typography>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 2.5 }}
        >
          还没有账号?{" "}
          <Link to="/register" style={{ color: "#F59E0B", fontWeight: 600 }}>
            去注册
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
