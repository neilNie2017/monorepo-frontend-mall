/**
 * 登录状态全局管理
 * 登录/注册成功后写入 localStorage,页面刷新后仍保持会话
 * 兼容多种后端返回格式:{token,user} | {token} | 用户对象 | 裸 token
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { TOKEN_KEY, USER_KEY } from "../api";
import { login as loginApi, register as registerApi } from "../api/auth";

const AuthContext = createContext(null);

/** token 是否为可安全放入 HTTP Header 的纯 ASCII 字符串 */
const isAsciiToken = (v) => typeof v === "string" && /^[\x21-\x7E]+$/.test(v);

/**
 * 归一化认证响应为 { token, user }
 * 兼容:
 *   body: { token } | { accessToken } | { access_token } | 裸 token 字符串 | { __data, __headers }
 *   header: authorization / x-auth-token / token / access-token
 */
function normalizeAuth(res, fallbackUsername) {
  // 拦截器为认证接口返回的包装:{ __data, __headers }
  const data =
    res && typeof res === "object" && "__data" in res ? res.__data : res;
  const headers =
    res && typeof res === "object" && "__headers" in res ? res.__headers : {};

  let token = null;
  let user = null;

  if (typeof data === "string") {
    token = isAsciiToken(data) ? data : null;
  } else if (data && typeof data === "object") {
    token =
      data.token || data.accessToken || data.access_token || data.tokenValue || null;
    if (token && !isAsciiToken(token)) token = null;
    user =
      data.user ||
      (data.username || data.nickname || data.userName ? data : null);
  }

  // 从响应头里找 token
  if (!token) {
    const raw =
      headers["authorization"] ||
      headers["x-auth-token"] ||
      headers["token"] ||
      headers["access-token"] ||
      null;
    if (raw) {
      const stripped = String(raw).replace(/^Bearer\s+/i, "").trim();
      if (isAsciiToken(stripped)) token = stripped;
    }
  }

  if (!user && fallbackUsername) {
    user = { username: fallbackUsername };
  }
  return { token, user };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });

  /** 登录,成功后返回用户信息 */
  const login = useCallback(async (payload) => {
    const raw = await loginApi(payload).send();
    // 调试:查看后端登录接口到底返回了什么(token 在 body 还是 header)
    console.info("[auth] login response:", raw);
    const { token, user: authUser } = normalizeAuth(raw, payload.username);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (authUser) localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  }, []);

  /** 注册(成功后尝试自动登录) */
  const register = useCallback(async (payload) => {
    const raw = await registerApi(payload).send();
    console.info("[auth] register response:", raw);
    const { token, user: authUser } = normalizeAuth(raw, payload.username);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (authUser) localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  /** 更新当前用户资料(合并字段并写入 localStorage),如昵称/头像 */
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(patch || {}) };
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(next));
      } catch {
        /* ignore(头像过大等) */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout, updateUser }),
    [user, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
