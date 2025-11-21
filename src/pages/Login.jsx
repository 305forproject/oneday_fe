import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import loginAPI from "../service/auth/login";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

/**
 * 로그인 페이지
 *
 * @description
 * - 이메일/비밀번호로 로그인
 * - 로그인 성공 시 메인 페이지로 이동
 * - 에러 메시지 표시
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  /**
   * 로그인 폼 제출 핸들러
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 입력값 검증
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요");
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 형식이 아닙니다");
      return;
    }

    setLoading(true);

    try {
      // 로그인 API 호출
      const data = await loginAPI(email, password);

      // AuthContext에 로그인 정보 저장
      login(
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        {
          userId: data.userId,
          email: data.email,
          name: data.name,
        }
      );

      // 메인 페이지로 이동
      navigate("/");
    } catch (err) {
      setError(err.message || "로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] space-y-6">
        {/* 로고 및 타이틀 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">OneDay</h1>
          <p className="text-muted-foreground">
            로그인하여 원데이 클래스를 시작하세요
          </p>
        </div>

        {/* 로그인 카드 */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
            <CardDescription className="text-center">
              이메일과 비밀번호를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 에러 메시지 */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 이메일 입력 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">비밀번호</Label>
                  {/* <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    비밀번호를 잊으셨나요?
                  </Link> */}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  className="h-11"
                />
              </div>

              {/* 로그인 버튼 */}
              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
            </form>

            {/* 회원가입 링크 */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              아직 계정이 없으신가요?{" "}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                회원가입
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 메인으로 돌아가기 링크 */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            메인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
