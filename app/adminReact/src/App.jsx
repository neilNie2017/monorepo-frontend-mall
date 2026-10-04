/**
 * 后台路由
 */
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* 登录页(未登录可访问) */}
      <Route path="/login" element={<Login />} />

      {/* 需要登录的后台页面 */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
