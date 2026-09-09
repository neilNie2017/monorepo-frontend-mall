/**
 * 通用文件上传接口(POST /api/upload,multipart)
 * 头像、商品图等共用;返回图片 URL。
 */
import { alovaInstance } from "./index";

/** 上传文件(字段名默认 file,后端不同可改) */
export const uploadFile = (file, field = "file") => {
  const fd = new FormData();
  fd.append(field, file);
  return alovaInstance.Post("/upload", fd);
};

/**
 * 从上传响应中提取图片 URL
 * 兼容:data 为字符串 | { url } | { path } | { src } | 嵌套 data
 */
export const extractUploadUrl = (res) => {
  if (!res) return "";
  if (typeof res === "string") return res;
  if (typeof res === "object") {
    if (typeof res.url === "string") return res.url;
    if (typeof res.path === "string") return res.path;
    if (typeof res.src === "string") return res.src;
    if (res.data != null) {
      if (typeof res.data === "string") return res.data;
      if (typeof res.data === "object")
        return res.data.url || res.data.path || res.data.src || "";
    }
  }
  return "";
};

/** 开发代理后端源(相对路径图片 URL 补全用) */
const API_ORIGIN = (import.meta.env.VITE_API_TARGET || "").replace(/\/+$/, "");

/** 归一化图片 URL:绝对地址/dataURL 原样;相对路径(/xxx)补后端源 */
export const normalizeImageUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u) || /^data:/i.test(u)) return u;
  if (u.startsWith("/")) return API_ORIGIN ? `${API_ORIGIN}${u}` : u;
  return u;
};

/** 兼容旧命名:头像上传 */
export const uploadAvatar = (file) => uploadFile(file);
export const normalizeAvatarUrl = normalizeImageUrl;
