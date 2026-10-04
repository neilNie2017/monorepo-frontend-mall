/**
 * 商品管理:搜索 + 状态筛选 + 上下架/删除操作
 */
import { useState } from "react";
import { useRequest, useFetcher } from "alova/client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
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
import { Input } from "@components";
import { getAdminProducts, updateProductStatus, deleteProduct } from "../api/products";

export default function Products() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState({ open: false, text: "", severity: "success" });
  const [confirmId, setConfirmId] = useState(null);

  const { data, loading, send } = useRequest(
    () => getAdminProducts({ current: page + 1, pageSize, keyword, status }),
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
      await sendStatus(p.id, p.status === 1 ? 0 : 1);
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

  const handleSearch = () => {
    setPage(0);
    send();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        商品管理
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        <CardContent sx={{ p: 2.5 }}>
          {/* 筛选栏 */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
            <Box sx={{ flex: "1 1 240px" }}>
              <Input
                label="商品名称"
                placeholder="输入商品名称搜索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                margin="dense"
              />
            </Box>
            <Box sx={{ width: 160 }}>
              <Input
                label="状态"
                select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                margin="dense"
                SelectProps={{
                  native: true,
                  children: [
                    <option value="">全部</option>,
                    <option value="1">已上架</option>,
                    <option value="0">已下架</option>,
                  ],
                }}
              />
            </Box>
            <Button variant="contained" onClick={handleSearch}>
              搜索
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setKeyword("");
                setStatus("");
                setPage(0);
                send();
              }}
            >
              重置
            </Button>
          </Box>

          {/* 表格 */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell>ID</TableCell>
                  <TableCell>商品名称</TableCell>
                  <TableCell>分类</TableCell>
                  <TableCell align="right">价格</TableCell>
                  <TableCell align="right">库存</TableCell>
                  <TableCell align="right">销量</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.records.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                      {p.id}
                    </TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell align="right">¥{p.price}</TableCell>
                    <TableCell align="right">{p.stock}</TableCell>
                    <TableCell align="right">{p.sales.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={p.status === 1 ? "已上架" : "已下架"}
                        color={p.status === 1 ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={p.status === 1 ? "下架" : "上架"}>
                        <IconButton size="small" onClick={() => handleStatus(p)}>
                          {p.status === 1 ? (
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
                          onClick={() => setConfirmId(p.id)}
                        >
                          <span style={{ fontSize: 16 }}>🗑️</span>
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && data.records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.disabled" }}>
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={data.total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            labelRowsPerPage="每页"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count}`}
          />
        </CardContent>
      </Card>

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
