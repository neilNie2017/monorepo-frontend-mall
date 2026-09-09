/**
 * 404 页面
 */
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="notfound">
      <span className="notfound__code">404</span>
      <p>页面不存在或已被移除</p>
      <Link to="/" className="notfound__link">
        返回首页
      </Link>
    </div>
  );
}
