/**
 * 钱包面板:余额 + 充值 + 优惠券
 *  - 余额完全走后端:挂载时 GET /user 拉一次、充值回调成功后再次拉取刷新,不做本地缓存。
 *    响应里取 balance 字段;若后端字段名不同,在 fetchBalance 处改一行即可。
 *  - 优惠券为示例数据(mock),含未使用/已使用/已过期筛选。
 *  - 充值走两步:POST /recharge 创建订单拿到 orderNo → POST /recharge/success/callback 模拟支付回调。
 *    生产环境应在真实支付完成后再触发回调,此处为后端联调而直接调用。
 */
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import {
  createRechargeOrder,
  rechargeSuccessCallback,
} from "../api/wallet";
import { getUserProfile } from "../api/profile";

const RECHARGE_AMOUNTS = [50, 100, 200, 500];

/* 示例优惠券:status 1 未使用 / 2 已使用 / 3 已过期 */
const COUPONS = [
  { id: 1, title: "满 100 减 20", amount: 20, minSpend: 100, expire: "2026-12-31", status: 1 },
  { id: 2, title: "满 200 减 50", amount: 50, minSpend: 200, expire: "2026-11-30", status: 1 },
  { id: 3, title: "新人礼包 满 50 减 10", amount: 10, minSpend: 50, expire: "2026-10-31", status: 1 },
  { id: 4, title: "会员日 满 300 减 80", amount: 80, minSpend: 300, expire: "2026-09-15", status: 2 },
  { id: 5, title: "周年庆 满 500 减 120", amount: 120, minSpend: 500, expire: "2026-07-31", status: 3 },
];

const STATUS_TEXT = { 1: "未使用", 2: "已使用", 3: "已过期" };
const STATUS_COLOR = { 1: "#059669", 2: "#94A3B8", 3: "#E11D48" };

export default function WalletPanel() {
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [recharging, setRecharging] = useState(false);
  const [couponTab, setCouponTab] = useState(1);
  const [toast, setToast] = useState({ open: false, severity: "success", text: "" });

  const show = (severity, text) => setToast({ open: true, severity, text });

  /* 从 /user 拉余额。响应中 balance 字段(数字/数字字符串都行),后端字段名变了改这一行 */
  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const data = await getUserProfile().send();
      const raw = data?.balance;
      const n = typeof raw === "string" ? Number(raw) : raw;
      setBalance(Number.isFinite(n) ? n : 0);
    } catch (err) {
      setBalance(0);
      show("error", err?.message || "余额获取失败");
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const openRecharge = () => {
    setAmount(100);
    setCustom("");
    setRechargeOpen(true);
  };

  const closeRecharge = () => {
    if (recharging) return;
    setRechargeOpen(false);
  };

  /* 充值流程:1) 创建订单  2) 模拟支付成功回调  3) 回调成功再次 GET /user 刷新余额 */
  const doRecharge = async () => {
    const val = custom ? Number(custom) : Number(amount);
    if (!Number.isFinite(val) || val <= 0) {
      show("error", "请输入正确的充值金额");
      return;
    }
    setRecharging(true);
    try {
      const orderNo = await createRechargeOrder(val).send();
      if (!orderNo) {
        throw new Error("未返回订单号");
      }
      await rechargeSuccessCallback(orderNo).send();
      setRechargeOpen(false);
      await fetchBalance();
      show("success", `充值成功,到账 ¥${val.toFixed(2)}`);
    } catch (err) {
      show("error", err?.message || "充值失败,请稍后重试");
    } finally {
      setRecharging(false);
    }
  };

  const showList = COUPONS.filter((c) => c.status === couponTab);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* 余额卡 */}
      <Paper
        sx={{
          borderRadius: "14px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #312E81 0%, #4C1D95 50%, #7C2D5E 100%)",
          position: "relative",
          color: "#fff",
          p: 3,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -40,
            width: 220,
            height: 220,
            background: "radial-gradient(circle, rgba(245,158,11,.25) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <Typography fontSize={13} sx={{ opacity: 0.85 }}>
          我的余额(元)
        </Typography>
        <Typography sx={{ fontSize: 40, fontWeight: 800, color: "#FCD34D", mt: 0.5 }}>
          {balanceLoading || balance == null ? (
            <CircularProgress size={28} sx={{ color: "#FCD34D", verticalAlign: "middle" }} />
          ) : (
            `¥${balance.toFixed(2)}`
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, mt: 2.5, flexWrap: "wrap" }}>
          <Button
            size="small"
            variant="contained"
            onClick={openRecharge}
            sx={{
              textTransform: "none",
              bgcolor: "#F59E0B",
              color: "#fff",
              fontWeight: 700,
              borderRadius: "8px",
              "&:hover": { bgcolor: "#D97706" },
            }}
          >
            ⚡ 充值
          </Button>
          <Button
            size="small"
            onClick={() => show("info", "交易明细功能建设中,敬请期待~")}
            sx={{
              textTransform: "none",
              color: "#fff",
              bgcolor: "rgba(255,255,255,.14)",
              borderRadius: "8px",
              "&:hover": { bgcolor: "rgba(255,255,255,.24)" },
            }}
          >
            明细
          </Button>
          <Button
            size="small"
            onClick={() => setCouponTab(1)}
            sx={{
              textTransform: "none",
              color: "#fff",
              bgcolor: "rgba(255,255,255,.14)",
              borderRadius: "8px",
              "&:hover": { bgcolor: "rgba(255,255,255,.24)" },
            }}
          >
            优惠券 ({COUPONS.filter((c) => c.status === 1).length})
          </Button>
        </Box>
      </Paper>

      {/* 优惠券 */}
      <Paper sx={{ borderRadius: "14px", p: 2, boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)" }}>
        <Box sx={{ px: 1, pt: 0.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A" }}>
            我的优惠券
          </Typography>
          <Tabs
            value={couponTab}
            onChange={(_, v) => setCouponTab(v)}
            textColor="inherit"
            sx={{ mt: 0.5, minHeight: 36 }}
            TabIndicatorProps={{ style: { backgroundColor: "#4C1D95" } }}
          >
            {[1, 2, 3].map((s) => (
              <Tab
                key={s}
                label={STATUS_TEXT[s]}
                value={s}
                sx={{ minHeight: 36, textTransform: "none", fontSize: 14, px: 2 }}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ mt: 1 }}>
          {showList.length === 0 ? (
            <Typography color="text.disabled" sx={{ py: 5, textAlign: "center" }}>
              暂无{STATUS_TEXT[couponTab]}的优惠券
            </Typography>
          ) : (
            showList.map((c) => {
              const expired = c.status === 3;
              return (
                <Box
                  key={c.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "10px",
                    mb: 1.5,
                    overflow: "hidden",
                    opacity: expired ? 0.55 : 1,
                    bgcolor: expired ? "rgba(148,163,184,.1)" : "rgba(76,29,149,.04)",
                    border: "1px solid",
                    borderColor: expired ? "rgba(148,163,184,.35)" : "rgba(76,29,149,.14)",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 92,
                      textAlign: "center",
                      color: expired ? "#94A3B8" : "#E11D48",
                      px: 1.5,
                      py: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
                      ¥{c.amount}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, py: 1.25, pr: 1.5 }}>
                    <Typography fontWeight={600} fontSize={14} noWrap>
                      {c.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      满 {c.minSpend} 可用 · {c.expire} 到期
                    </Typography>
                  </Box>
                  <Typography
                    component="span"
                    sx={{
                      mr: 2,
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                      color: STATUS_COLOR[c.status] || "#94A3B8",
                    }}
                  >
                    {STATUS_TEXT[c.status]}
                  </Typography>
                </Box>
              );
            })
          )}
        </Box>
      </Paper>

      {/* 充值弹窗 */}
      <Dialog open={rechargeOpen} onClose={closeRecharge} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>充值</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, pt: 1 }}>
            {RECHARGE_AMOUNTS.map((a) => (
              <Button
                key={a}
                disabled={recharging}
                variant={amount === a && !custom ? "contained" : "outlined"}
                onClick={() => {
                  setAmount(a);
                  setCustom("");
                }}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  py: 1,
                  ...(amount === a && !custom
                    ? { bgcolor: "#4C1D95", "&:hover": { bgcolor: "#312E81" } }
                    : { borderColor: "#4C1D95", color: "#4C1D95" }),
                }}
              >
                ¥{a}
              </Button>
            ))}
          </Box>
          <TextField
            label="自定义金额(元)"
            size="small"
            fullWidth
            type="number"
            sx={{ mt: 2 }}
            value={custom}
            disabled={recharging}
            onChange={(e) => {
              setCustom(e.target.value);
              if (e.target.value) setAmount(0);
            }}
            inputProps={{ min: 0.01, step: 0.01 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            演示环境:已对接后端,充值即时到账,不会产生真实扣款。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={closeRecharge}
            disabled={recharging}
            sx={{ textTransform: "none" }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            onClick={doRecharge}
            disabled={recharging}
            sx={{ textTransform: "none", borderRadius: "8px", bgcolor: "#4C1D95", "&:hover": { bgcolor: "#312E81" }, px: 3 }}
          >
            {recharging ? "处理中…" : "确认充值"}
          </Button>
        </DialogActions>
      </Dialog>

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
