/**
 * 应用入口
 */
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "@components/styles.css";
import "./styles.css";

// 商城主题:深蓝紫 + 琥珀金配色
const theme = createTheme({
  palette: {
    primary: {
      main: "#4C1D95",
    },
    secondary: {
      main: "#F59E0B",
    },
    error: {
      main: "#E11D48",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);
