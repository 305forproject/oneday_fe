import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * ProtectedRoute - 인증된 사용자만 접근 가능한 라우트
 *
 * @param {ReactNode} children - 보호할 컴포넌트
 * @returns {ReactNode} 인증되었으면 children, 아니면 로그인 페이지로 리다이렉트
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // 로딩 중에는 아무것도 렌더링하지 않음
  if (loading) {
    return null;
  }

  // 인증되지 않았으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // 인증되었으면 컴포넌트 렌더링
  return children;
}
