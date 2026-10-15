/**
 * 仪表盘统计接口(baseURL=/api,实际请求 /api/*)
 */
import { alovaInstance } from "./index";

/** 仪表盘统计数据 */
export const getDashboardStats = () =>
  alovaInstance.Get("/dashboard/stats", { cacheFor: 30000 });
