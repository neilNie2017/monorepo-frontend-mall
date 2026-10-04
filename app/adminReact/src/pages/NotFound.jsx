/**
 * 404 页面
 */
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button } from "@components";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 3,
      }}
    >
      <Typography variant="h1" fontWeight={800} sx={{ color: "#1E40AF", fontSize: 96 }}>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary">
        抱歉,您访问的页面不存在
      </Typography>
      <Button component={Link} to="/" size="lg">
        返回首页
      </Button>
    </Box>
  );
}
