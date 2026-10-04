/**
 * 后台登录页
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { Button, Input } from "@components";
import { useAuth } from "../context/AuthContext";
import { USE_MOCK } from "../api";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "admin", password: "admin123" });
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
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        background:
          "linear-gradient(160deg, #0F172A 0%, #1E3A8A 50%, #1E40AF 100%)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          bgcolor: "background.paper",
          borderRadius: "14px",
          p: 4,
          boxShadow: "0 20px 60px rgba(15,23,42,.4)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              mx: "auto",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: "0 4px 16px rgba(30,64,175,.3)",
            }}
          >
            🛍️
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
            MALL 管理后台
          </Typography>
          <Typography variant="body2" color="text.secondary">
            请使用管理员账号登录
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
            演示账号:admin / admin123
          </Typography>
        )}
      </Box>
    </Box>
  );
}
