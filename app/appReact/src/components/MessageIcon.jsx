/**
 * 消息图标(与 @mui/icons-material 的 MailOutline 同形,内联 SVG 以保证零额外依赖)
 *
 * 本环境无法安装 @mui/icons-material(pnpm/corepack 二进制缺失),故内联其官方 SVG 路径。
 * 若后续安装该包,可直接替换为:
 *   import MailOutlineIcon from "@mui/icons-material/MailOutline";
 *   export default MailOutlineIcon;
 */
import SvgIcon from "@mui/material/SvgIcon";

export default function MessageIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </SvgIcon>
  );
}
