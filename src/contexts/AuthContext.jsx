import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

/**
 * AuthProvider - 인증 상태 관리 컨텍스트
 *
 * @description
 * - 로그인/로그아웃 기능 제공
 * - JWT 토큰 localStorage 관리
 * - 사용자 정보 상태 관리
 * - 앱 전체에서 인증 상태 공유
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 localStorage에서 토큰 확인
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userInfo = localStorage.getItem("userInfo");

    if (accessToken && userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (error) {
        console.error("Failed to parse user info:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
      }
    }
    setLoading(false);
  }, []);

  /**
   * 로그인 함수
   * @param {Object} tokens - { accessToken, refreshToken }
   * @param {Object} userInfo - 사용자 정보 (email, name 등)
   */
  const login = (tokens, userInfo) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  /**
   * 로그아웃 함수
   * - localStorage 토큰 삭제
   * - 사용자 상태 초기화
   * - 메인 페이지로 이동
   */
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  /**
   * 로그인 여부 확인
   */
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem("accessToken");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * @returns {Object} { user, loading, login, logout, isAuthenticated }
 * @throws {Error} AuthProvider 외부에서 사용 시 에러 발생
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
