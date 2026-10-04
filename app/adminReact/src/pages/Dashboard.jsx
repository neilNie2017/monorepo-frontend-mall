/**
 * 仪表盘:统计卡片 + 最近订单 + 热销商品
 */
import { useRequest } from "alova/client";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { getDashboardStats } from "../api/dashboard";

const ORDER_STATUS_MAP = {
  0: { label: "已取消", color: "default" },
  1: { label: "待发货", color: "warning" },
  2: { label: "已发货", color: "info" },
  3: { label: "已完成", color: "success" },
  4: { label: "已退款", color: "error" },
};

const StatCard = ({ label, value, icon, color }) => (
  <Card sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            bgcolor: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { loading, data } = useRequest(() => getDashboardStats(), {
    initialData: {
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalSales: 0,
      recentOrders: [],
      topProducts: [],
    },
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        仪表盘
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="商品总数"
                value={data.totalProducts}
                icon="📦"
                color="rgba(30,64,175,.1)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="订单总数"
                value={data.totalOrders}
                icon="📋"
                color="rgba(245,158,11,.1)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="用户总数"
                value={data.totalUsers}
                icon="👥"
                color="rgba(5,150,105,.1)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="销售总额"
                value={`¥${(data.totalSales || 0).toLocaleString()}`}
                icon="💰"
                color="rgba(225,29,72,.1)"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* 最近订单 & 热销商品 */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                最近订单
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={280} />
              ) : (
                <TableContainer component={Box}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>订单号</TableCell>
                        <TableCell>用户</TableCell>
                        <TableCell>商品</TableCell>
                        <TableCell align="right">金额</TableCell>
                        <TableCell>状态</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recentOrders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                            {o.id}
                          </TableCell>
                          <TableCell>{o.username}</TableCell>
                          <TableCell>{o.productName}</TableCell>
                          <TableCell align="right">¥{o.amount}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={ORDER_STATUS_MAP[o.status]?.label || o.status}
                              color={ORDER_STATUS_MAP[o.status]?.color || "default"}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                热销商品 TOP 5
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={280} />
              ) : (
                <TableContainer component={Box}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>排名</TableCell>
                        <TableCell>商品</TableCell>
                        <TableCell align="right">销量</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.topProducts.map((p, i) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "6px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#fff",
                                bgcolor:
                                  i === 0
                                    ? "#F59E0B"
                                    : i === 1
                                    ? "#94A3B8"
                                    : i === 2
                                    ? "#B45309"
                                    : "#CBD5E1",
                              }}
                            >
                              {i + 1}
                            </Box>
                          </TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell align="right">{p.sales.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
