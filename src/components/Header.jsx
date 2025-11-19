import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoutAPI from "../service/auth/logout";

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = async () => {
    try {
      // 백엔드 API 호출 (Refresh Token 무효화)
      await logoutAPI();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 클라이언트 측 로그아웃 (localStorage 정리 + 상태 초기화)
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">원데이클래스</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            클래스 찾기
          </Link>
          {isAuthenticated() && (
            <Link
              to="/register"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              클래스 등록
            </Link>
          )}
        </nav>

        {/* 로그인 상태에 따른 버튼 표시 */}
        <div className="flex items-center gap-2">
          {isAuthenticated() ? (
            <>
              {/* 로그인 상태: 마이페이지 + 로그아웃 */}
              <Button variant="ghost" size="sm" onClick={() => navigate("/my")}>
                마이페이지
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              {/* 비로그인 상태: 로그인 + 회원가입 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
              >
                로그인
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")}>
                회원가입
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
