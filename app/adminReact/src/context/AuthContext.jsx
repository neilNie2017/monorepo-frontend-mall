/**
 * 后台登录状态全局管理
 * 登录成功后写入 localStorage,页面刷新后仍保持会话
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
import { adminLogin } from "../api/auth";

const AuthContext = createContext(null);

const isAsciiToken = (v) => typeof v === "string" && /^[\x21-\x7E]+$/.test(v);

function normalizeAuth(res, fallbackUsername) {
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

  const login = useCallback(async (payload) => {
    const raw = await adminLogin(payload).send();
    console.info("[admin auth] login response:", raw);
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

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
