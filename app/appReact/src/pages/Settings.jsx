/**
 * 设置页(占位)
 */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Settings() {
  return (
    <Box
      sx={{
        maxWidth: 520,
        mx: "auto",
        borderRadius: "14px",
        p: 5,
        bgcolor: "background.paper",
        boxShadow: "0 1px 3px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          mx: "auto",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #312E81 0%, #4C1D95 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          mb: 2,
        }}
      >
        ⚙️
      </Box>
      <Typography variant="h5" fontWeight={700} sx={{ mt: 1, color: "#0F172A" }}>
        设置
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        功能开发中,敬请期待~
      </Typography>
    </Box>
  );
}
