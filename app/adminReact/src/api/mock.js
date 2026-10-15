/**
 * 后台模拟接口(@alova/mock)
 * 仅在开发环境启用;接入真实后端后可直接关闭 mock。
 */
import { defineMock } from "@alova/mock";

/* ---------------- 内置商品数据 ---------------- */
const MOCK_PRODUCTS = [
  { id: 1001, name: "星芒 Pro 旗舰手机 12+256G", category: "手机数码", price: 4999, stock: 128, sales: 12800, status: 1, createdAt: "2026-09-01 10:20:00" },
  { id: 1002, name: "轻享降噪蓝牙耳机", category: "手机数码", price: 299, stock: 560, sales: 35600, status: 1, createdAt: "2026-09-02 14:30:00" },
  { id: 1003, name: "全能充电宝 20000mAh", category: "手机数码", price: 129, stock: 320, sales: 21000, status: 1, createdAt: "2026-09-03 09:15:00" },
  { id: 1004, name: "智能手环 8 代", category: "手机数码", price: 199, stock: 0, sales: 18900, status: 0, createdAt: "2026-09-04 16:45:00" },
  { id: 2001, name: "变频冷暖空调 1.5 匹", category: "家用电器", price: 2599, stock: 45, sales: 8600, status: 1, createdAt: "2026-09-05 11:00:00" },
  { id: 2002, name: "扫地机器人全能版", category: "家用电器", price: 1899, stock: 78, sales: 6300, status: 1, createdAt: "2026-09-06 13:20:00" },
  { id: 3001, name: "轻奢羽绒服 女款", category: "服饰鞋包", price: 699, stock: 230, sales: 9800, status: 1, createdAt: "2026-09-07 08:50:00" },
  { id: 3002, name: "透气运动跑鞋 男款", category: "服饰鞋包", price: 359, stock: 410, sales: 26700, status: 1, createdAt: "2026-09-08 15:30:00" },
  { id: 4001, name: "玻尿酸保湿面膜 20 片", category: "美妆个护", price: 89, stock: 890, sales: 42300, status: 1, createdAt: "2026-09-09 10:10:00" },
  { id: 5001, name: "赣南脐橙 10 斤装", category: "食品生鲜", price: 49.9, stock: 1500, sales: 58900, status: 1, createdAt: "2026-09-10 17:00:00" },
];

/* ---------------- 内置订单数据 ---------------- */
const MOCK_ORDERS = [
  { id: "O20260915001", username: "demo", productName: "星芒 Pro 旗舰手机 12+256G", amount: 4999, quantity: 1, status: 1, createdAt: "2026-09-15 10:20:00" },
  { id: "O20260915002", username: "alice", productName: "轻享降噪蓝牙耳机", amount: 598, quantity: 2, status: 2, createdAt: "2026-09-15 11:05:00" },
  { id: "O20260914003", username: "bob", productName: "变频冷暖空调 1.5 匹", amount: 2599, quantity: 1, status: 3, createdAt: "2026-09-14 14:30:00" },
  { id: "O20260914004", username: "demo", productName: "玻尿酸保湿面膜 20 片", amount: 178, quantity: 2, status: 4, createdAt: "2026-09-14 16:45:00" },
  { id: "O20260913005", username: "charlie", productName: "透气运动跑鞋 男款", amount: 359, quantity: 1, status: 1, createdAt: "2026-09-13 09:15:00" },
  { id: "O20260913006", username: "alice", productName: "赣南脐橙 10 斤装", amount: 99.8, quantity: 2, status: 2, createdAt: "2026-09-13 13:20:00" },
  { id: "O20260912007", username: "david", productName: "扫地机器人全能版", amount: 1899, quantity: 1, status: 0, createdAt: "2026-09-12 15:30:00" },
];

/* ---------------- 内置用户数据 ---------------- */
const MOCK_USERS = [
  { id: "u_demo", username: "demo", nickname: "演示用户", email: "demo@example.com", phone: "13800000001", status: 1, createdAt: "2026-08-01 10:00:00" },
  { id: "u_alice", username: "alice", nickname: "爱丽丝", email: "alice@example.com", phone: "13800000002", status: 1, createdAt: "2026-08-05 11:30:00" },
  { id: "u_bob", username: "bob", nickname: "鲍勃", email: "bob@example.com", phone: "13800000003", status: 1, createdAt: "2026-08-10 14:20:00" },
  { id: "u_charlie", username: "charlie", nickname: "查理", email: "charlie@example.com", phone: "13800000004", status: 0, createdAt: "2026-08-15 09:45:00" },
  { id: "u_david", username: "david", nickname: "大卫", email: "david@example.com", phone: "13800000005", status: 1, createdAt: "2026-08-20 16:00:00" },
];

/* ---------------- 后台管理员账号 ---------------- */
const ADMIN_USERS = [
  { username: "admin", password: "admin123", nickname: "超级管理员" },
];

const genToken = (user) => `admin-token-${user.username}-${Date.now()}`;

const parseBody = (data) => {
  if (!data) return {};
  if (typeof data === "string") {
    try { return JSON.parse(data); } catch { return {}; }
  }
  if (typeof data.entries === "function" && typeof data.get === "function") {
    const obj = {};
    data.forEach((value, key) => { obj[key] = value; });
    return obj;
  }
  return data;
};

export default defineMock({
  /* 后台登录 */
  "[POST]/admin/login": ({ data }) => {
    const { username, password } = parseBody(data);
    const user = ADMIN_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) {
      return { code: 401, message: "用户名或密码错误", data: null };
    }
    return {
      code: 0,
      message: "登录成功",
      data: {
        token: genToken(user),
        user: { username: user.username, nickname: user.nickname },
      },
    };
  },

  /* 商品列表 */
  "[GET]/product/page": ({ query }) => {
    const keyword = ((query?.keyword || "") + "").trim().toLowerCase();
    const status = query?.status;
    let list = MOCK_PRODUCTS;
    if (keyword) {
      list = list.filter((p) => p.name.toLowerCase().includes(keyword));
    }
    if (status !== undefined && status !== "") {
      list = list.filter((p) => p.status === Number(status));
    }
    return {
      code: 0,
      message: "ok",
      data: { records: list, total: list.length },
    };
  },

  /* 商品状态变更(上下架) */
  "[PUT]/product/{id}/status": ({ params, data }) => {
    const { status } = parseBody(data);
    const product = MOCK_PRODUCTS.find((p) => String(p.id) === String(params.id));
    if (!product) return { code: 404, message: "商品不存在", data: null };
    product.status = Number(status);
    return { code: 0, message: "操作成功", data: product };
  },

  /* 删除商品 */
  "[DELETE]/product/{id}": ({ params }) => {
    const idx = MOCK_PRODUCTS.findIndex((p) => String(p.id) === String(params.id));
    if (idx < 0) return { code: 404, message: "商品不存在", data: null };
    MOCK_PRODUCTS.splice(idx, 1);
    return { code: 0, message: "删除成功", data: null };
  },

  /* 订单列表 */
  "[GET]/order/page": ({ query }) => {
    const status = query?.status;
    let list = MOCK_ORDERS;
    if (status !== undefined && status !== "") {
      list = list.filter((o) => o.status === Number(status));
    }
    return {
      code: 0,
      message: "ok",
      data: { records: list, total: list.length },
    };
  },

  /* 订单状态变更 */
  "[PUT]/order/{id}/status": ({ params, data }) => {
    const { status } = parseBody(data);
    const order = MOCK_ORDERS.find((o) => String(o.id) === String(params.id));
    if (!order) return { code: 404, message: "订单不存在", data: null };
    order.status = Number(status);
    return { code: 0, message: "操作成功", data: order };
  },

  /* 用户列表 */
  "[GET]/user/page": ({ query }) => {
    const keyword = ((query?.keyword || "") + "").trim().toLowerCase();
    let list = MOCK_USERS;
    if (keyword) {
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(keyword) ||
          (u.nickname || "").toLowerCase().includes(keyword)
      );
    }
    return {
      code: 0,
      message: "ok",
      data: { records: list, total: list.length },
    };
  },

  /* 用户状态变更(禁用/启用) */
  "[PUT]/user/{id}/status": ({ params, data }) => {
    const { status } = parseBody(data);
    const user = MOCK_USERS.find((u) => String(u.id) === String(params.id));
    if (!user) return { code: 404, message: "用户不存在", data: null };
    user.status = Number(status);
    return { code: 0, message: "操作成功", data: user };
  },

  /* 仪表盘统计 */
  "[GET]/dashboard/stats": () => {
    return {
      code: 0,
      message: "ok",
      data: {
        totalProducts: MOCK_PRODUCTS.length,
        totalOrders: MOCK_ORDERS.length,
        totalUsers: MOCK_USERS.length,
        totalSales: MOCK_ORDERS.reduce((sum, o) => sum + o.amount, 0),
        recentOrders: MOCK_ORDERS.slice(0, 5),
        topProducts: [...MOCK_PRODUCTS]
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5),
      },
    };
  },
});
