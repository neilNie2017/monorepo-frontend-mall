/**
 * 后台用户管理接口(baseURL=/api,实际请求 /api/admin/*)
 */
import { alovaInstance } from "./index";

/** 用户列表(分页) @param { { current?, pageSize?, keyword? } } */
export const getAdminUsers = (params) =>
  alovaInstance.Get("/admin/user/page", {
    params: { current: 1, pageSize: 10, ...params },
  });

/** 禁用/启用用户 @param { string|number } id @param { number } status */
export const updateUserStatus = (id, status) =>
  alovaInstance.Put(`/admin/user/${id}/status`, { status });
