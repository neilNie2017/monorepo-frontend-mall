/**
 * 订单管理:状态筛选 + 发货/完成/取消操作
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
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Input } from "@components";
import { getAdminOrders, updateOrderStatus } from "../api/orders";

const ORDER_STATUS_MAP = {
  0: { label: "已取消", color: "default" },
  1: { label: "待发货", color: "warning" },
  2: { label: "已发货", color: "info" },
  3: { label: "已完成", color: "success" },
  4: { label: "已退款", color: "error" },
};

export default function Orders() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState({ open: false, text: "", severity: "success" });

  const { data, loading, send } = useRequest(
    () => getAdminOrders({ current: page + 1, pageSize, status }),
    { initialData: { records: [], total: 0 } }
  );

  const { send: sendStatus } = useFetcher((id, st) => updateOrderStatus(id, st), {
    immediate: false,
  });

  const handleAction = async (order, st) => {
    try {
      await sendStatus(order.id, st);
      setToast({ open: true, text: "操作成功", severity: "success" });
      send();
    } catch (err) {
      setToast({ open: true, text: err.message || "操作失败", severity: "error" });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        订单管理
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
            <Box sx={{ width: 200 }}>
              <Input
                label="订单状态"
                select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                margin="dense"
                SelectProps={{
                  native: true,
                  children: [
                    <option value="">全部</option>,
                    <option value="1">待发货</option>,
                    <option value="2">已发货</option>,
                    <option value="3">已完成</option>,
                    <option value="0">已取消</option>,
                    <option value="4">已退款</option>,
                  ],
                }}
              />
            </Box>
            <Button variant="contained" onClick={() => { setPage(0); send(); }}>
              查询
            </Button>
            <Button
              variant="outlined"
              onClick={() => { setStatus(""); setPage(0); send(); }}
            >
              重置
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell>订单号</TableCell>
                  <TableCell>用户</TableCell>
                  <TableCell>商品</TableCell>
                  <TableCell align="right">数量</TableCell>
                  <TableCell align="right">金额</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>下单时间</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.records.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                      {o.id}
                    </TableCell>
                    <TableCell>{o.username}</TableCell>
                    <TableCell>{o.productName}</TableCell>
                    <TableCell align="right">{o.quantity}</TableCell>
                    <TableCell align="right">¥{o.amount}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ORDER_STATUS_MAP[o.status]?.label || o.status}
                        color={ORDER_STATUS_MAP[o.status]?.color || "default"}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{o.createdAt}</TableCell>
                    <TableCell align="center">
                      {o.status === 1 && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAction(o, 2)}
                        >
                          发货
                        </Button>
                      )}
                      {o.status === 2 && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleAction(o, 3)}
                        >
                          完成
                        </Button>
                      )}
                      {(o.status === 1 || o.status === 2) && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleAction(o, 0)}
                          sx={{ ml: 1 }}
                        >
                          取消
                        </Button>
                      )}
                      {(o.status === 0 || o.status === 3 || o.status === 4) && (
                        <Typography variant="caption" color="text.disabled">
                          —
                        </Typography>
                      )}
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
    </Box>
  );
}
