/**
 * 注册页
 * 表单验证与展示使用 MUI(TextField error/helperText)
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { Button, Input } from "@components";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    if (form.username.trim().length < 3) {
      nextErrors.username = "用户名至少 3 个字符";
    }
    if (form.password.length < 6) {
      nextErrors.password = "密码至少 6 位";
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "两次输入的密码不一致";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register({
        username: form.username.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.message || "注册失败,请稍后重试");
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
            创建账号
          </Typography>
          <Typography variant="body2" color="text.secondary">
            注册成为 DEMO MALL 会员
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Input
            label="用户名"
            placeholder="3 个字符以上"
            value={form.username}
            onChange={setField("username")}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="密码"
            type="password"
            placeholder="至少 6 位"
            value={form.password}
            onChange={setField("password")}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            label="确认密码"
            type="password"
            placeholder="再次输入密码"
            value={form.confirmPassword}
            onChange={setField("confirmPassword")}
            error={errors.confirmPassword}
            autoComplete="new-password"
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
            注 册
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 2.5 }}>
          已有账号?{" "}
          <Link to="/login" style={{ color: "#F59E0B", fontWeight: 600 }}>
            去登录
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
