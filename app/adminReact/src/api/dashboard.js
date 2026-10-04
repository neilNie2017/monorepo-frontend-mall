/**
 * 后台仪表盘统计接口(baseURL=/api,实际请求 /api/admin/*)
 */
import { alovaInstance } from "./index";

/** 仪表盘统计数据 */
export const getDashboardStats = () =>
  alovaInstance.Get("/admin/dashboard/stats", { cacheFor: 30000 });
