/**
 * 模拟后端接口(@alova/mock)
 * 仅在开发环境启用;接入真实后端后可直接关闭 mock。
 * 用户数据持久化在 localStorage,刷新后注册/登录状态仍然有效。
 */
import { defineMock } from "@alova/mock";
import { PRODUCT_CATEGORY_OPTIONS } from "../utils/categories";

export const CATEGORIES = [
  { key: "all", label: "全部" },
  { key: "phone", label: "手机数码" },
  { key: "appliance", label: "家用电器" },
  { key: "fashion", label: "服饰鞋包" },
  { key: "beauty", label: "美妆个护" },
  { key: "food", label: "食品生鲜" },
];

/* ---------------- 商品数据 ---------------- */
const PRODUCTS = [
  { id: 1001, name: "星芒 Pro 旗舰手机 12+256G", category: "phone", price: 4999, originalPrice: 5499, sales: 12800, tag: "热卖", emoji: "📱", thumbBg: "linear-gradient(135deg,#eef3ff,#dbe7ff)", description: "6.7 英寸高刷屏,5000mAh 大电池,旗舰影像系统" },
  { id: 1002, name: "轻享降噪蓝牙耳机", category: "phone", price: 299, originalPrice: 399, sales: 35600, tag: "热卖", emoji: "🎧", thumbBg: "linear-gradient(135deg,#e8fff6,#c9f5e3)", description: "主动降噪,40 小时续航,佩戴轻盈舒适" },
  { id: 1003, name: "全能充电宝 20000mAh", category: "phone", price: 129, originalPrice: 169, sales: 21000, tag: "", emoji: "🔋", thumbBg: "linear-gradient(135deg,#fff4e8,#ffe1c2)", description: "22.5W 快充,双向 Type-C,出行无忧" },
  { id: 1004, name: "智能手环 8 代", category: "phone", price: 199, originalPrice: 249, sales: 18900, tag: "新品", emoji: "⌚", thumbBg: "linear-gradient(135deg,#f3f0ff,#e3dcff)", description: "心率血氧监测,14 天续航,50 米防水" },
  { id: 2001, name: "变频冷暖空调 1.5 匹", category: "appliance", price: 2599, originalPrice: 2999, sales: 8600, tag: "热卖", emoji: "❄️", thumbBg: "linear-gradient(135deg,#e8f7ff,#c8ebff)", description: "一级能效,静音运行,智能控温省电" },
  { id: 2002, name: "扫地机器人全能版", category: "appliance", price: 1899, originalPrice: 2299, sales: 6300, tag: "", emoji: "🤖", thumbBg: "linear-gradient(135deg,#eef6e8,#d8edd0)", description: "扫拖一体,自动集尘,激光导航规划" },
  { id: 2003, name: "破壁料理机 静音款", category: "appliance", price: 399, originalPrice: 499, sales: 15400, tag: "", emoji: "🥤", thumbBg: "linear-gradient(135deg,#fff0ee,#ffdcd8)", description: "一机多用,细腻无渣,低噪不扰人" },
  { id: 2004, name: "空气净化器 除甲醛", category: "appliance", price: 1099, originalPrice: 1299, sales: 3200, tag: "新品", emoji: "🌬️", thumbBg: "linear-gradient(135deg,#f0f4ff,#dde7ff)", description: "双传感器,实时数显,除醛除菌除霾" },
  { id: 3001, name: "轻奢羽绒服 女款", category: "fashion", price: 699, originalPrice: 999, sales: 9800, tag: "热卖", emoji: "🧥", thumbBg: "linear-gradient(135deg,#fff3e8,#ffe4cb)", description: "90% 白鸭绒,轻暖蓬松,经典百搭" },
  { id: 3002, name: "透气运动跑鞋 男款", category: "fashion", price: 359, originalPrice: 459, sales: 26700, tag: "", emoji: "👟", thumbBg: "linear-gradient(135deg,#eef6ff,#d8eaff)", description: "轻量缓震,网面透气,日常通勤跑步" },
  { id: 3003, name: "复古帆布双肩包", category: "fashion", price: 129, originalPrice: 169, sales: 11200, tag: "", emoji: "🎒", thumbBg: "linear-gradient(135deg,#f5f0e8,#e8ddcc)", description: "大容量多隔层,防泼水面料,通勤利器" },
  { id: 3004, name: "羊绒围巾 秋冬保暖", category: "fashion", price: 99, originalPrice: 139, sales: 5200, tag: "新品", emoji: "🧣", thumbBg: "linear-gradient(135deg,#ffeef2,#ffd9e0)", description: "100% 绵羊绒,柔软亲肤,不扎不痒" },
  { id: 4001, name: "玻尿酸保湿面膜 20 片", category: "beauty", price: 89, originalPrice: 129, sales: 42300, tag: "热卖", emoji: "🧴", thumbBg: "linear-gradient(135deg,#e8fff9,#c8f5ea)", description: "深层补水,舒缓修护,敏感肌可用" },
  { id: 4002, name: "氨基酸洗面奶 温和洁面", category: "beauty", price: 59, originalPrice: 79, sales: 31800, tag: "", emoji: "🧼", thumbBg: "linear-gradient(135deg,#f0eeff,#e0dcff)", description: "温和不刺激,洗后不紧绷,男女通用" },
  { id: 4003, name: "防晒霜 SPF50+ 清爽款", category: "beauty", price: 119, originalPrice: 159, sales: 20600, tag: "新品", emoji: "🌞", thumbBg: "linear-gradient(135deg,#fff8e8,#ffecc2)", description: "高倍防晒不油腻,清爽成膜不假白" },
  { id: 4004, name: "香水小样礼盒 5 支装", category: "beauty", price: 169, originalPrice: 219, sales: 7400, tag: "", emoji: "🌸", thumbBg: "linear-gradient(135deg,#ffeef8,#ffd8ec)", description: "清新花果香,便携试香,送礼首选" },
  { id: 5001, name: "赣南脐橙 10 斤装", category: "food", price: 49.9, originalPrice: 69.9, sales: 58900, tag: "热卖", emoji: "🍊", thumbBg: "linear-gradient(135deg,#fff4e8,#ffe2c8)", description: "现摘现发,皮薄多汁,甜过初恋" },
  { id: 5002, name: "每日坚果礼盒 30 包", category: "food", price: 89, originalPrice: 119, sales: 36700, tag: "", emoji: "🥜", thumbBg: "linear-gradient(135deg,#f5efe8,#e8dccb)", description: "六种坚果科学配比,独立小包锁鲜" },
  { id: 5003, name: "云南高山咖啡豆 500g", category: "food", price: 79, originalPrice: 99, sales: 15800, tag: "新品", emoji: "☕", thumbBg: "linear-gradient(135deg,#f0ece8,#e0d5cc)", description: "中度烘焙,坚果可可风味,现磨现冲" },
  { id: 5004, name: "空运三文鱼刺身 300g", category: "food", price: 99, originalPrice: 129, sales: 8900, tag: "", emoji: "🐟", thumbBg: "linear-gradient(135deg,#e8f2ff,#cfe2ff)", description: "冰鲜直达,入口即化,刺身级品质" },
];

/* ---------------- 模拟用户存储 ---------------- */
const USERS_KEY = "mall_users";
export const TOKEN_KEY = "mall_token";
export const USER_KEY = "mall_user";

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

// 预置演示账号
if (!localStorage.getItem(USERS_KEY)) {
  saveUsers([
    { id: "u_demo", username: "demo", password: "123456", nickname: "演示用户" },
  ]);
}

const pickUser = ({ id, userId, username, nickname, avatar, email, phone, description }) => ({
  id: id ?? userId,
  userId: userId ?? id,
  username,
  nickname,
  avatar: avatar || "",
  email: email || "",
  phone: phone || "",
  description: description || "",
});
const genToken = (user) => `mock-token-${user.id}-${Date.now()}`;

/** 兼容 JSON 字符串 / URLSearchParams / 对象三种请求体 */
const parseBody = (data) => {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (typeof data.entries === "function" && typeof data.get === "function") {
    const obj = {};
    data.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  return data;
};

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key).filter((k) => k !== "all");

/* ---------------- 本地新建商品存储 ---------------- */
const STORED_PRODUCTS_KEY = "mall_created_products";
const getStoredProducts = () => {
  try {
    return JSON.parse(localStorage.getItem(STORED_PRODUCTS_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveStoredProducts = (list) =>
  localStorage.setItem(STORED_PRODUCTS_KEY, JSON.stringify(list));
/** 全部商品:新建的在前 + 内置数据 */
const allProducts = () => [...getStoredProducts(), ...PRODUCTS];
/** 按 id 生成占位渐变 */
const PRODUCT_GRADIENTS = [
  "linear-gradient(135deg, #6a85b6 0%, #bac8e0 100%)",
  "linear-gradient(135deg, #fcb045 0%, #fd1d1d 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
];
const gradientById = (id) => {
  const n = Math.abs(Number(id) || 0);
  return PRODUCT_GRADIENTS[n % PRODUCT_GRADIENTS.length];
};

export default defineMock({
  /* 注册 */
  "[POST]/oauth/register": ({ data }) => {
    const { username, password, confirmPassword, nickname } = parseBody(data);
    if (!username || !password) {
      return { code: 400, message: "用户名和密码不能为空", data: null };
    }
    if (username.length < 3) {
      return { code: 400, message: "用户名至少 3 个字符", data: null };
    }
    if (password.length < 6) {
      return { code: 400, message: "密码至少 6 位", data: null };
    }
    if (confirmPassword !== password) {
      return { code: 400, message: "两次输入的密码不一致", data: null };
    }
    const users = getUsers();
    if (users.some((u) => u.username === username)) {
      return { code: 400, message: "该用户名已被注册", data: null };
    }
    const user = {
      id: `u_${Date.now()}`,
      username,
      password,
      nickname: (nickname || "").trim() || username,
    };
    users.push(user);
    saveUsers(users);
    return {
      code: 0,
      message: "注册成功",
      data: { token: genToken(user), user: pickUser(user) },
    };
  },

  /* 登录 */
  "[POST]/oauth/login": ({ data }) => {
    const { username, password } = parseBody(data);
    const users = getUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) {
      return { code: 401, message: "用户名或密码错误", data: null };
    }
    return {
      code: 0,
      message: "登录成功",
      data: { token: genToken(user), user: pickUser(user) },
    };
  },

  /* 更新个人资料(与后端 Java 实体字段一致,PUT /api/user) */
  "[PUT]/user": ({ data }) => {
    const { userId, username, avatar, email, phone, description } = parseBody(data);
    if (userId == null || userId === "") {
      return { code: 400, message: "缺少 userId", data: null };
    }
    const users = getUsers();
    const user = users.find((u) => String(u.id) === String(userId));
    if (!user) {
      return { code: 404, message: "用户不存在", data: null };
    }
    if (username !== undefined && username !== null) {
      const uname = String(username).trim();
      if (uname) user.username = uname;
    }
    if (avatar !== undefined && avatar !== null) {
      if (!String(avatar).trim()) {
        return { code: 400, message: "头像数据不能为空", data: null };
      }
      user.avatar = String(avatar);
    }
    if (email !== undefined) user.email = String(email ?? "").trim();
    if (phone !== undefined) user.phone = String(phone ?? "").trim();
    if (description !== undefined) user.description = String(description ?? "").trim();
    saveUsers(users);
    return {
      code: 0,
      message: "保存成功",
      data: pickUser(user),
    };
  },

  /* 根分类列表(GET /api/category/rootList) */
  "[GET]/category/rootList": () => {
    const list = PRODUCT_CATEGORY_OPTIONS.map((c) => ({
      categoryId: c.value,
      categoryName: c.label,
      emoji: c.emoji,
    }));
    return { code: 0, message: "ok", data: list };
  },

  /* 分类树(GET /api/category/tree,含子分类) */
  "[GET]/category/tree": () => {
    const tree = [
      {
        categoryId: 1,
        categoryName: "手机数码",
        emoji: "📱",
        children: [
          { categoryId: 11, categoryName: "智能手机", emoji: "📱" },
          { categoryId: 12, categoryName: "蓝牙耳机", emoji: "🎧" },
          { categoryId: 13, categoryName: "充电电源", emoji: "🔋" },
          { categoryId: 14, categoryName: "智能穿戴", emoji: "⌚" },
        ],
      },
      {
        categoryId: 2,
        categoryName: "家用电器",
        emoji: "❄️",
        children: [
          { categoryId: 21, categoryName: "空调", emoji: "❄️" },
          { categoryId: 22, categoryName: "清洁电器", emoji: "🤖" },
          { categoryId: 23, categoryName: "厨房电器", emoji: "🥤" },
          { categoryId: 24, categoryName: "净化设备", emoji: "🌬️" },
        ],
      },
      {
        categoryId: 3,
        categoryName: "服饰鞋包",
        emoji: "🧥",
        children: [
          { categoryId: 31, categoryName: "秋冬外套", emoji: "🧥" },
          { categoryId: 32, categoryName: "运动鞋靴", emoji: "👟" },
          { categoryId: 33, categoryName: "箱包配饰", emoji: "🎒" },
          { categoryId: 34, categoryName: "围巾帽饰", emoji: "🧣" },
        ],
      },
      {
        categoryId: 4,
        categoryName: "美妆个护",
        emoji: "🧴",
        children: [
          { categoryId: 41, categoryName: "面部护理", emoji: "🧴" },
          { categoryId: 42, categoryName: "清洁洁面", emoji: "🧼" },
          { categoryId: 43, categoryName: "防晒护肤", emoji: "🌞" },
          { categoryId: 44, categoryName: "香氛香水", emoji: "🌸" },
        ],
      },
      {
        categoryId: 5,
        categoryName: "食品生鲜",
        emoji: "🍊",
        children: [
          { categoryId: 51, categoryName: "新鲜水果", emoji: "🍊" },
          { categoryId: 52, categoryName: "坚果零食", emoji: "🥜" },
          { categoryId: 53, categoryName: "咖啡饮品", emoji: "☕" },
          { categoryId: 54, categoryName: "海鲜水产", emoji: "🐟" },
        ],
      },
      {
        categoryId: 6,
        categoryName: "其他",
        emoji: "🛍️",
        children: [],
      },
    ];
    return { code: 0, message: "ok", data: tree };
  },

  /* 商品列表(与真实接口 /product/page 同结构:records/total) */
  "[GET]/product/page": ({ query }) => {
    const category = query?.category || "all";
    const keyword = ((query?.keyword || "") + "").trim().toLowerCase();
    let list = allProducts();
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    if (keyword) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          (p.description || "").toLowerCase().includes(keyword)
      );
    }
    return {
      code: 0,
      message: "ok",
      data: { records: list, total: list.length },
    };
  },

  /* 商品详情(路径参数):兼容内置(id)与新建商品(productId) */
  "[GET]/product/{id}": ({ params }) => {
    const product = allProducts().find(
      (p) =>
        String(p.id ?? "") === String(params.id) ||
        String(p.productId ?? "") === String(params.id)
    );
    if (!product) {
      return { code: 404, message: "商品不存在", data: null };
    }
    return { code: 0, message: "ok", data: product };
  },

  /* 新建商品(POST /api/product,字段对齐后端实体) */
  "[POST]/product": ({ data }) => {
    const body = parseBody(data);
    const name = String(body.name || "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock);
    if (!name) return { code: 400, message: "商品名称不能为空", data: null };
    if (!Number.isFinite(price) || price <= 0) {
      return { code: 400, message: "价格必须大于 0", data: null };
    }
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      return { code: 400, message: "库存需为不小于 0 的整数", data: null };
    }
    const productId = `p_${Date.now()}`;
    const product = {
      productId,
      name,
      categoryId: Number.isFinite(Number(body.categoryId ?? body.category))
        ? Number(body.categoryId ?? body.category)
        : 6,
      stock,
      price,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      picture: body.picture || "",
      description: String(body.description || "").trim() || "暂无描述",
      seckillStatus: body.seckillStatus == null ? 1 : Number(body.seckillStatus),
      status: body.status == null ? 1 : Number(body.status),
      // 展示辅助字段
      emoji: "🛍️",
      thumbBg: gradientById(Number(productId.replace(/[^0-9]/g, "")) || 0),
    };
    const list = getStoredProducts();
    list.unshift(product);
    saveStoredProducts(list);
    return { code: 0, message: "发布成功", data: product };
  },

  /* 下单(POST /api/order/buy;参数 productionId + quantity) */
  "[POST]/order/buy": ({ data }) => {
    const { productionId, quantity } = parseBody(data);
    if (productionId == null || String(productionId).trim() === "") {
      return { code: 400, message: "商品 id 不能为空", data: null };
    }
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return { code: 400, message: "购买数量需为不小于 1 的整数", data: null };
    }
    return {
      code: 0,
      message: "下单成功",
      data: {
        orderId: `o_${Date.now()}`,
        productionId: String(productionId),
        quantity: Number(quantity),
      },
    };
  },

  /* 创建聊天室(与真实接口 /api/chatRoom 同形参;返回 data.roomId + data.chatMessages) */
  "[POST]/chatRoom": ({ data }) => {
    const { userId, productId } = parseBody(data);
    const roomId = `room_${productId}_${userId}`;
    // 模拟历史消息:一条商家自动欢迎语(messageType 1=用户 2=商家)
    const chatMessages = [
      {
        id: `seed_${roomId}`,
        content: "您好,本商品有任何疑问都可以问我哦~",
        createdBy: "0",
        createdTime: new Date(Date.now() - 60000).toISOString().slice(0, 19),
        messageType: 2,
        roomId,
        senderId: "merchant",
      },
    ];
    return {
      code: 0,
      message: "ok",
      data: {
        roomId,
        productId,
        userId,
        chatMessages,
      },
    };
  },

  /* 消息中心会话列表(与真实接口 /api/chatRoom/getUserAll 同结构:房间数组,主键为大写 Id) */
  "[GET]/chatRoom/getUserAll": () => {
    const now = Date.now();
    const iso = (ms) => new Date(ms).toISOString().slice(0, 19);
    const rooms = [
      {
        Id: "2086008252532617218",
        productId: 1001,
        userId: "2085560549508255744",
        status: 1,
        createdTime: iso(now - 26 * 3600 * 1000),
        updatedTime: iso(now - 3600 * 1000),
        createdBy: null,
        updatedBy: null,
      },
      {
        Id: "room_2001",
        productId: 2001,
        userId: "2085560549508255744",
        status: 1,
        createdTime: iso(now - 24 * 3600 * 1000),
        updatedTime: iso(now - 2 * 3600 * 1000),
        createdBy: null,
        updatedBy: null,
      },
      {
        Id: "room_5001",
        productId: 5001,
        userId: "2085560549508255744",
        status: 1,
        createdTime: iso(now - 20 * 3600 * 1000),
        updatedTime: iso(now - 26 * 3600 * 1000),
        createdBy: null,
        updatedBy: null,
      },
    ];
    return { code: 0, message: "ok", data: rooms };
  },

  /* 模拟文件上传(POST /api/upload):把文件读成 dataURL 当作"上传后的图片地址"返回 */
  "[POST]/upload": async ({ data }) => {
    const body =
      typeof FormData !== "undefined" && data instanceof FormData
        ? Object.fromEntries(data.entries())
        : parseBody(data);
    const file = body.file ?? body.avatar ?? body.image;
    if (!file || typeof file.arrayBuffer !== "function") {
      return { code: 400, message: "缺少上传文件", data: null };
    }
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    // 分块转 base64,避免大数组展开爆栈
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    const dataUrl = `data:${file.type || "image/jpeg"};base64,${btoa(bin)}`;
    return { code: 0, message: "ok", data: dataUrl };
  },
});
