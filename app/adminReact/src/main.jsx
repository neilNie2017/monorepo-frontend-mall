/**
 * 后台管理入口
 */
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "@components/styles.css";
import "./styles.css";

// 后台主题:专业深靛蓝 + 强调琥珀金,与商城端品牌一致但更沉稳
const theme = createTheme({
  palette: {
    primary: {
      main: "#1E40AF",
    },
    secondary: {
      main: "#F59E0B",
    },
    error: {
      main: "#E11D48",
    },
    success: {
      main: "#059669",
    },
    background: {
      default: "#F1F5F9",
      paper: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);
