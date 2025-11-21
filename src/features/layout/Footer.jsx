import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">원데이클래스</h3>
            <p className="text-sm text-muted-foreground">
              새로운 취미를 발견하고<br />
              특별한 하루를 만들어보세요.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">클래스 둘러보기</Link></li>
              <li><Link to="/register" className="hover:text-primary">강사 등록</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">고객지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary">공지사항</Link></li>
              <li><Link to="#" className="hover:text-primary">자주 묻는 질문</Link></li>
              <li><Link to="#" className="hover:text-primary">문의하기</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">SNS</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} OneDayClass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
