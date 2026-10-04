/**
 * 后台认证相关接口(Spring 风格表单接口,使用 urlencoded 提交)
 * baseURL=/api,实际请求 /api/admin/login
 */
import { alovaInstance } from "./index";

const FORM_HEADER = { "Content-Type": "application/x-www-form-urlencoded" };

/** 后台登录 @param { { username: string, password: string } } */
export const adminLogin = (data) =>
  alovaInstance.Post("/admin/login", new URLSearchParams(data), {
    headers: FORM_HEADER,
  });
