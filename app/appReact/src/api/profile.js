/**
 * 个人资料接口(baseURL=/api,实际请求 /api/*)
 *  - 更新个人资料:PUT /api/user { userId, username, avatar, email, phone, description }
 *  - 头像上传见 ./upload.js(POST /api/upload)
 */
import { alovaInstance } from "./index";

/** 更新个人资料 */
export const updateUserProfile = (payload) => alovaInstance.Put("/user", payload);

// 复用通用上传(保持旧导入路径可用)
export { uploadAvatar, extractUploadUrl, normalizeAvatarUrl } from "./upload";
