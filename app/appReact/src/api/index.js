/**
 * alovajs 实例配置
 * - 默认使用真实后端请求(adapterFetch);开发环境可通过 .env 的 VITE_USE_MOCK 开关回退到 @alova/mock
 * - 全局拦截:请求自动携带 Token;响应统一解包并兼容多种后端格式
 */
import { createAlova } from "alova";
import ReactHook from "alova/react";
import adapterFetch from "alova/fetch";
import { createAlovaMockAdapter } from "@alova/mock";
import mockGroup from "./mock";

export const TOKEN_KEY = "mall_token";
export const USER_KEY = "mall_user";

/** 是否启用本地 mock(默认关闭,走真实后端) */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/** token 是否为可安全放入 HTTP Header 的纯 ASCII 字符串 */
const isAsciiToken = (v) => typeof v === "string" && /^[\x21-\x7E]+$/.test(v);

/* ---------- 登录失效(401)处理:清除过期 token 并跳转登录页 ---------- */
let redirectingToLogin = false;

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const loginPath = `${import.meta.env.BASE_URL || "/"}login`.replace(/\/{2,}/g, "/");
  // 已在登录页则不重复跳转
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

// 清理历史遗留的非法 token:含中文等非 ISO-8859-1 字符会导致 fetch 请求头报错
try {
  const stale = localStorage.getItem(TOKEN_KEY);
  if (stale && !isAsciiToken(stale)) {
    localStorage.removeItem(TOKEN_KEY);
  }
} catch {
  /* ignore */
}

// mock 模式:命中 mock key 走本地数据,未命中的回落到真实 fetch
const mockAdapter = createAlovaMockAdapter([mockGroup], {
  httpAdapter: adapterFetch(),
  enable: USE_MOCK,
  delay: 400,
  mockRequestLogger: false,
});

export const alovaInstance = createAlova({
  // 后端统一 /api/* 前缀:开发环境走 Vite 代理(vite.config.js proxy),生产环境通过 VITE_API_BASE 指定
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  statesHook: ReactHook,
  requestAdapter: USE_MOCK ? mockAdapter : adapterFetch(),
  beforeRequest(method) {
    // 只发送纯 ASCII 的 token,避免含中文等非 Latin-1 字符触发 fetch header 报错
    const token = localStorage.getItem(TOKEN_KEY);
    if (isAsciiToken(token)) {
      method.config.headers = {
        ...method.config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  },
  responded: {
    /**
     * 统一解包响应,兼容常见后端格式:
     *   { code: 0, data } | { code: 200, data } | { success: true, data } | 裸数据
     * code 非 0/200 或 HTTP 非 2xx 时抛错(错误消息取 message/msg)
     */
    onSuccess: async (response, method) => {
      let json = null;
      try {
        json = await response.json();
      } catch {
        json = null;
      }

      // 401 处理:HTTP 状态码为 401 或业务码为 401(如 {msg, code:401, success:false})
      // 视为登录过期/签名无效 -> 清除过期 token 并重定向到登录页
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

      // HTTP 层失败(如 500),尽力取后端错误信息
      if (!response.ok) {
        const msg =
          (json && (json.message || json.msg)) || `请求失败(${response.status})`;
        const err = new Error(msg);
        err.code = response.status;
        throw err;
      }

      if (json && typeof json === "object") {
        // 业务码判断:约定 0 / 200 为成功
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

        // 认证接口:额外附带响应头(部分后端把 token 放在响应头里)
        if (method && /\/oauth\/(login|register)/.test(method.url || "")) {
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
