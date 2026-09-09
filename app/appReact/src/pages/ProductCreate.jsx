/**
 * 发布商品页(需登录,入口:顶栏「+ 发布商品」)
 * 提交字段对齐后端实体:
 *   { name, category(Integer), stock, price, startTime, endTime,
 *     picture, description, seckillStatus(1普通/0秒杀), status(1正常/0禁用) }
 * 图片先上传 POST /api/upload 拿 URL 存入 picture;未传图时用占位。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRequest } from "alova/client";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { createProduct } from "../api/products";
import { uploadFile, extractUploadUrl, normalizeImageUrl } from "../api/upload";
import { PRODUCT_CATEGORY_OPTIONS } from "../utils/categories";
import { getCategoryRootList, normalizeCategoryOptions } from "../api/categories";

const initialForm = {
  name: "",
  category: 1,
  stock: "",
  price: "",
  startTime: "",
  endTime: "",
  description: "",
  seckillStatus: 1, // 1 普通, 0 秒杀
  status: 1, // 1 正常, 0 禁用
};

/** datetime-local → 后端 LocalDateTime 字符串(yyyy-MM-dd HH:mm:ss) */
const toLocalDateTime = (v) => {
  if (!v) return null;
  const t = String(v).replace("T", " ");
  return t.length === 16 ? `${t}:00` : t;
};

export default function ProductCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [pendingPic, setPendingPic] = useState(null); // 待上传商品图
  const [picPreview, setPicPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, severity: "success", text: "" });
  const fileRef = useRef(null);

  // 分类:优先取 /api/category/rootList,失败/加载中回退内置静态分类
  const { data: catData } = useRequest(getCategoryRootList, {
    initialData: [],
  });
  const categoryOptions = useMemo(() => {
    const opts = normalizeCategoryOptions(catData);
    return opts.length ? opts : PRODUCT_CATEGORY_OPTIONS;
  }, [catData]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // 分类数据就绪后,若默认值不在其中则切到第一项
  useEffect(() => {
    if (
      categoryOptions.length > 0 &&
      !categoryOptions.some((o) => String(o.value) === String(form.category))
    ) {
      setForm((f) => ({ ...f, category: categoryOptions[0].value }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryOptions]);

  const showToast = (severity, text) => setToast({ open: true, severity, text });

  const onPickPic = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\//.test(file.type)) return showToast("error", "请选择图片文件");
    if (file.size > 5 * 1024 * 1024)
      return showToast("error", "图片不能超过 5MB");
    if (picPreview) URL.revokeObjectURL(picPreview);
    setPendingPic(file);
    setPicPreview(URL.createObjectURL(file));
  };

  const onSubmit = async () => {
    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!name) return showToast("error", "请输入商品名称");
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock))
      return showToast("error", "库存需为不小于 0 的整数");
    if (!Number.isFinite(price) || price <= 0)
      return showToast("error", "价格需大于 0");

    setSubmitting(true);
    try {
      // 1) 有选图先上传拿 URL
      let pictureUrl = "";
      if (pendingPic) {
        const res = await uploadFile(pendingPic).send();
        pictureUrl = normalizeImageUrl(extractUploadUrl(res));
        if (!pictureUrl) throw new Error("图片上传失败:接口未返回地址");
      }

      // 2) 提交商品
      const payload = {
        name,
        categoryId: Number(form.category),
        stock: Number(stock),
        price: Number(price),
        description: form.description.trim(),
        seckillStatus: Number(form.seckillStatus),
        status: Number(form.status),
        ...(pictureUrl ? { picture: pictureUrl } : {}),
        ...(form.startTime ? { startTime: toLocalDateTime(form.startTime) } : {}),
        ...(form.endTime ? { endTime: toLocalDateTime(form.endTime) } : {}),
      };
      const created = await createProduct(payload).send();
      const id = created?.productId ?? created?.id;
      showToast("success", "发布成功");
      if (picPreview) URL.revokeObjectURL(picPreview);
      setTimeout(() => navigate(id ? `/product/${id}` : "/"), 800);
    } catch (err) {
      showToast("error", err?.message || "发布失败,请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Box sx={{ mb: 2 }}>
        <Link to="/" style={{ fontSize: 13, color: "#7a8290", textDecoration: "none" }}>
          ← 返回商品广场
        </Link>
      </Box>

      <Paper sx={{ p: 3.5, borderRadius: "8px" }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          ＋ 发布商品
        </Typography>

        {/* 图片上传(可选) */}
        <Box sx={{ mb: 3, p: 2, borderRadius: "8px", bgcolor: "#fafbfc", border: "1px dashed", borderColor: "rgba(255,92,0,.3)" }}>
          <Typography fontSize={13} fontWeight={600} sx={{ mb: 1.5 }}>
            商品主图
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: "120px",
                height: "120px",
                borderRadius: "8px",
                flexShrink: 0,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: picPreview
                  ? `url(${picPreview}) center/cover no-repeat`
                  : "linear-gradient(135deg, #eef1f6, #e2e8f0)",
              }}
            >
              {!picPreview && <Typography sx={{ fontSize: 40 }}>🛍️</Typography>}
            </Box>
            <Box>
              <Button variant="outlined" size="small" onClick={() => fileRef.current?.click()}>
                {picPreview ? "重新选择" : "上传图片"}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                支持 jpg/png,不传则使用占位图
              </Typography>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickPic} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="商品名称" size="small" fullWidth required value={form.name} onChange={set("name")} placeholder="输入商品名称" />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField select label="分类" size="small" sx={{ flex: 1, minWidth: 180 }} value={form.category} onChange={set("category")}>
              {categoryOptions.map((c) => (
                <MenuItem key={String(c.value)} value={c.value}>
                  {c.emoji} {c.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="库存" size="small" type="number" sx={{ flex: 1, minWidth: 120 }} required value={form.stock} onChange={set("stock")} inputProps={{ min: 0, step: 1 }} />
            <TextField label="价格(¥)" size="small" type="number" sx={{ flex: 1, minWidth: 120 }} required value={form.price} onChange={set("price")} inputProps={{ min: 0.01, step: 0.01 }} />
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField select label="秒杀状态" size="small" sx={{ flex: 1, minWidth: 150 }} value={form.seckillStatus} onChange={set("seckillStatus")}>
              <MenuItem value={1}>普通</MenuItem>
              <MenuItem value={0}>秒杀</MenuItem>
            </TextField>
            <TextField select label="商品状态" size="small" sx={{ flex: 1, minWidth: 150 }} value={form.status} onChange={set("status")}>
              <MenuItem value={1}>正常(上架)</MenuItem>
              <MenuItem value={0}>禁用(下架)</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField label="秒杀开始时间(可选)" size="small" type="datetime-local" sx={{ flex: 1, minWidth: 220 }} value={form.startTime} onChange={set("startTime")} InputLabelProps={{ shrink: Boolean(form.startTime) }} />
            <TextField label="秒杀结束时间(可选)" size="small" type="datetime-local" sx={{ flex: 1, minWidth: 220 }} value={form.endTime} onChange={set("endTime")} InputLabelProps={{ shrink: Boolean(form.endTime) }} />
          </Box>

          <TextField label="商品描述" size="small" fullWidth multiline minRows={3} maxRows={6} value={form.description} onChange={set("description")} placeholder="介绍商品卖点…" />

          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 1 }}>
            <Button onClick={() => navigate("/")} disabled={submitting}>取消</Button>
            <Button variant="contained" onClick={onSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}>
              发布
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={toast.open} autoHideDuration={2500} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
