import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Calendar } from "lucide-react";

export function Header() {
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
          <Link
            to="/instructor/register"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            강사 등록
          </Link>
          <Link
            to="/instructor/bookings"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            강사 예약관리
          </Link>
          <Link
            to="/student/bookings"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            내 예약
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            로그인
          </Button>
          <Button size="sm">회원가입</Button>
        </div>
      </div>
    </header>
  );
}
