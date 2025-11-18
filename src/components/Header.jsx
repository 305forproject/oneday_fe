import { Button } from './ui/button'
import { Calendar } from 'lucide-react'

export function Header() {
  const navigate = (path) => {
    window.location.href = path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">원데이클래스</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate('/')} className="text-sm font-medium hover:text-primary transition-colors">
            클래스 찾기
          </button>
          <button onClick={() => navigate('/instructor/register')} className="text-sm font-medium hover:text-primary transition-colors">
            강사 등록
          </button>
          <button onClick={() => navigate('/instructor/bookings')} className="text-sm font-medium hover:text-primary transition-colors">
            강사 예약관리
          </button>
          <button onClick={() => navigate('/student/bookings')} className="text-sm font-medium hover:text-primary transition-colors">
            내 예약
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            로그인
          </Button>
          <Button size="sm">회원가입</Button>
        </div>
      </div>
    </header>
  )
}
