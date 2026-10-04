/**
 * 后台 alovajs 实例配置
 * - 默认使用真实后端请求(adapterFetch);开发环境可通过 .env 的 VITE_USE_MOCK 开关回退到 @alova/mock
 * - 全局拦截:请求自动携带 Token;响应统一解包并兼容多种后端格式
 * - 后台使用独立的 token/user 存储 key,与用户端商城互不干扰
 */
import { createAlova } from "alova";
import ReactHook from "alova/react";
import adapterFetch from "alova/fetch";
import { createAlovaMockAdapter } from "@alova/mock";
import mockGroup from "./mock";

export const TOKEN_KEY = "admin_token";
export const USER_KEY = "admin_user";

/** 是否启用本地 mock(默认关闭,走真实后端) */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/** token 是否为可安全放入 HTTP Header 的纯 ASCII 字符串 */
const isAsciiToken = (v) => typeof v === "string" && /^[\x21-\x7E]+$/.test(v);

/* ---------- 登录失效(401)处理:清除过期 token 并跳转登录页 ---------- */
let redirectingToLogin = false;

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const loginPath = `${import.meta.env.BASE_URL || "/"}login`.replace(/\/{2,}/g, "/");
  if (window.location.pathname === loginPath) return;
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
  window.location.replace(loginPath);
}

// 清理历史遗留的非法 token
try {
  const stale = localStorage.getItem(TOKEN_KEY);
  if (stale && !isAsciiToken(stale)) {
    localStorage.removeItem(TOKEN_KEY);
  }
} catch {
  /* ignore */
}

const mockAdapter = createAlovaMockAdapter([mockGroup], {
  httpAdapter: adapterFetch(),
  enable: USE_MOCK,
  delay: 400,
  mockRequestLogger: false,
});

export const alovaInstance = createAlova({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  statesHook: ReactHook,
  requestAdapter: USE_MOCK ? mockAdapter : adapterFetch(),
  beforeRequest(method) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (isAsciiToken(token)) {
      method.config.headers = {
        ...method.config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  },
  responded: {
    onSuccess: async (response, method) => {
      let json = null;
      try {
        json = await response.json();
      } catch {
        json = null;
      }

      const isHttp401 = response.status === 401;
      const isBiz401 =
        json && typeof json === "object" && (json.code === 401 || json.status === 401);
      if (isHttp401 || isBiz401) {
        redirectToLogin();
        const err = new Error(
          (json && (json.msg || json.message)) || "登录已过期,请重新登录"
        );
        err.code = 401;
        throw err;
      }

      if (!response.ok) {
        const msg =
          (json && (json.message || json.msg)) || `请求失败(${response.status})`;
        const err = new Error(msg);
        err.code = response.status;
        throw err;
      }

      if (json && typeof json === "object") {
        const code = json.code;
        const isOk =
          code === undefined ||
          code === 0 ||
          code === 200 ||
          json.success === true;
        if (!isOk) {
          const err = new Error(json.message || json.msg || "请求失败");
          err.code = code;
          throw err;
        }
        const data = json.data !== undefined ? json.data : json;
        if (method && /\/admin\/(login)/.test(method.url || "")) {
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return { __data: data, __headers: headers };
        }
        return data;
      }
      return json;
    },
  },
});
