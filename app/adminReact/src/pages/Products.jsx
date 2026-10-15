/**
 * 商品管理:基于 ProTable 通用组件
 * columns 通过 hideInSearch / hideInTable / valueType 控制过滤与表格字段
 */
import { useState } from "react";
import { useRequest, useFetcher } from "alova/client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ProTable from "../components/ProTable";
import { getAdminProducts, updateProductStatus, deleteProduct } from "../api/products";

export default function Products() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [params, setParams] = useState({ keyword: "", status: "" });
  const [toast, setToast] = useState({ open: false, text: "", severity: "success" });
  const [confirmId, setConfirmId] = useState(null);

  const { data, loading, send } = useRequest(
    () => getAdminProducts({ current: page + 1, pageSize, ...params }),
    { initialData: { records: [], total: 0 } }
  );

  const { send: sendStatus } = useFetcher((id, st) => updateProductStatus(id, st), {
    immediate: false,
  });
  const { send: sendDelete } = useFetcher((id) => deleteProduct(id), {
    immediate: false,
  });

  const handleStatus = async (p) => {
    try {
      await sendStatus(p.productId, p.status === 1 ? 0 : 1);
      setToast({ open: true, text: "状态已更新", severity: "success" });
      send();
    } catch (err) {
      setToast({ open: true, text: err.message || "操作失败", severity: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await sendDelete(confirmId);
      setToast({ open: true, text: "删除成功", severity: "success" });
      setConfirmId(null);
      send();
    } catch (err) {
      setToast({ open: true, text: err.message || "删除失败", severity: "error" });
    }
  };

  const handleSearch = (values) => {
    setParams(values);
    setPage(0);
    send();
  };

  const columns = [
    // 仅用于过滤区:商品名称 -> keyword
    {
      title: "商品名称",
      dataIndex: "name",
      searchKey: "keyword",
      hideInTable: true,
    },
    {
      title: "商品ID",
      dataIndex: "productId",
      hideInSearch: true,
      width: 200,
      render: (v) => (
        <Box sx={{ fontFamily: "monospace", fontSize: 12 }}>{v}</Box>
      ),
    },
    { title: "商品名称", dataIndex: "name", hideInSearch: true },
    { title: "分类", dataIndex: "categoryId", hideInSearch: true },
    {
      title: "价格",
      dataIndex: "price",
      valueType: "number",
      hideInSearch: true,
      align: "right",
      render: (v) => `¥${Number(v).toLocaleString()}`,
    },
    {
      title: "库存",
      dataIndex: "stock",
      valueType: "number",
      hideInSearch: true,
      align: "right",
    },
    {
      title: "秒杀",
      dataIndex: "seckillStatus",
      valueType: "select",
      hideInSearch: true,
      options: [
        { label: "进行中", value: 1 },
        { label: "未开启", value: 0 },
      ],
    },
    {
      title: "状态",
      dataIndex: "status",
      hideInSearch: true,
      render: (v) => (
        <Chip
          size="small"
          label={v === 1 ? "已上架" : "已下架"}
          color={v === 1 ? "success" : "default"}
        />
      ),
    },
    // 仅用于过滤区:状态
    {
      title: "状态",
      dataIndex: "status",
      hideInTable: true,
      valueType: "select",
      options: [
        { label: "已上架", value: 1 },
        { label: "已下架", value: 0 },
      ],
    },
    {
      title: "操作",
      dataIndex: "action",
      hideInSearch: true,
      align: "center",
      render: (_, record) => (
        <>
          <Tooltip title={record.status === 1 ? "下架" : "上架"}>
            <IconButton size="small" onClick={() => handleStatus(record)}>
              {record.status === 1 ? (
                <span style={{ fontSize: 16 }}>⏸️</span>
              ) : (
                <span style={{ fontSize: 16 }}>▶️</span>
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="删除">
            <IconButton
              size="small"
              color="error"
              onClick={() => setConfirmId(record.productId)}
            >
              <span style={{ fontSize: 16 }}>🗑️</span>
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        商品管理
      </Typography>

      <ProTable
        columns={columns}
        data={data.records}
        loading={loading}
        total={data.total}
        page={page}
        pageSize={pageSize}
        rowKey="productId"
        onSearch={handleSearch}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        toolbar={
          <Button variant="outlined" onClick={() => send()}>
            刷新
          </Button>
        }
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.text}
        </Alert>
      </Snackbar>

      <Dialog open={Boolean(confirmId)} onClose={() => setConfirmId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>确定要删除该商品吗?此操作不可恢复。</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId(null)}>取消</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
