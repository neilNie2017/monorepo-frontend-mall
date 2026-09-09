/**
 * 认证相关接口(Spring 风格表单接口,使用 urlencoded 提交)
 * baseURL=/api,实际请求 /api/oauth/login
 * 返回 alova Method 实例,组件外通过 .send() 调用
 *
 * 注意:必须显式设置 Content-Type=application/x-www-form-urlencoded。
 * alova v3 fetch 适配器对 URLSearchParams 不会自动设置表单头,会被默认写成
 * application/json,导致后端解析不到表单字段。
 */
import { alovaInstance } from "./index";

const FORM_HEADER = { "Content-Type": "application/x-www-form-urlencoded" };

/** 登录 @param { { username: string, password: string } } */
export const login = (data) =>
  alovaInstance.Post("/oauth/login", new URLSearchParams(data), {
    headers: FORM_HEADER,
  });

/** 注册 @param { { username, password, confirmPassword } } */
export const register = (data) =>
  alovaInstance.Post("/oauth/register", new URLSearchParams(data), {
    headers: FORM_HEADER,
  });