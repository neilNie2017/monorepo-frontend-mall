/**
 * 图片工具:头像文件压缩为 dataURL(供上传/本地存储)
 */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * 将选择的图片文件等比压缩后转为 base64 dataURL(用于头像)
 * @param {File} file
 * @param {number} maxSize 最长边像素,默认 240
 * @returns {Promise<string>} data:image/jpeg;base64,...
 */
export function fileToAvatarDataUrl(file, maxSize = 240) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("未选择文件"));
    if (!/^image\//.test(file.type)) return reject(new Error("请选择图片文件"));
    if (file.size > AVATAR_MAX_BYTES)
      return reject(new Error("图片不能超过 5MB"));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("图片解析失败,请换一张试试"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("当前浏览器不支持画布处理"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
