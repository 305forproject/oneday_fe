import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Calendar, User, BookOpen, GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoutAPI from "../service/auth/logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

        {/* 로그인 상태에 따른 버튼 표시 */}
        <div className="flex items-center gap-2">
          {isAuthenticated() ? (
            <>
              {/* 로그인 상태: 드롭다운 메뉴 + 로그아웃 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />내 메뉴
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/my")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>마이페이지</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/register")}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>클래스 등록</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/teacher")}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <span>강사 페이지</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
