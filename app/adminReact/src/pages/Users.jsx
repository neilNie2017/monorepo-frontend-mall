/**
 * 用户管理:搜索 + 禁用/启用操作
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
import { getAdminUsers, updateUserStatus } from "../api/users";

export default function Users() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState({ open: false, text: "", severity: "success" });

  const { data, loading, send } = useRequest(
    () => getAdminUsers({ current: page + 1, pageSize, keyword }),
    { initialData: { records: [], total: 0 } }
  );

  const { send: sendStatus } = useFetcher((id, st) => updateUserStatus(id, st), {
    immediate: false,
  });

  const handleStatus = async (user) => {
    try {
      await sendStatus(user.id, user.status === 1 ? 0 : 1);
      setToast({
        open: true,
        text: user.status === 1 ? "已禁用用户" : "已启用用户",
        severity: "success",
      });
      send();
    } catch (err) {
      setToast({ open: true, text: err.message || "操作失败", severity: "error" });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        用户管理
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
            <Box sx={{ flex: "1 1 240px" }}>
              <Input
                label="用户名 / 昵称"
                placeholder="输入关键词搜索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                margin="dense"
              />
            </Box>
            <Button variant="contained" onClick={() => { setPage(0); send(); }}>
              搜索
            </Button>
            <Button
              variant="outlined"
              onClick={() => { setKeyword(""); setPage(0); send(); }}
            >
              重置
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell>用户 ID</TableCell>
                  <TableCell>用户名</TableCell>
                  <TableCell>昵称</TableCell>
                  <TableCell>邮箱</TableCell>
                  <TableCell>手机号</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>注册时间</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.records.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                      {u.id}
                    </TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.nickname}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={u.status === 1 ? "正常" : "已禁用"}
                        color={u.status === 1 ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{u.createdAt}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        color={u.status === 1 ? "error" : "success"}
                        variant={u.status === 1 ? "outlined" : "contained"}
                        onClick={() => handleStatus(u)}
                      >
                        {u.status === 1 ? "禁用" : "启用"}
                      </Button>
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
