/**
 * 后台认证相关接口
 * baseURL=/api,实际请求 /api/admin/login
 * 后端以 JSON(@RequestBody)接收,故提交 application/json
 */
import { alovaInstance } from "./index";

/** 后台登录 @param { { username: string, password: string } } */
export const adminLogin = (data) =>
  alovaInstance.Post("/admin/login", data, {
    headers: { "Content-Type": "application/json" },
  });
