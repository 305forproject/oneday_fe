import axiosClient from "../axiosInstance";

/**
 * 로그아웃 API 함수
 *
 * @returns {Promise<Object>} { message: "로그아웃되었습니다" }
 * @throws {Error} 로그아웃 실패 시 에러 발생
 *
 * @description
 * - 백엔드 API를 호출하여 Refresh Token 무효화
 * - localStorage의 토큰은 AuthContext에서 관리
 *
 * @example
 * await logout();
 */
const logout = async () => {
  try {
    const response = await axiosClient.post("/auth/logout");

    // ApiResponse<T> 형식에서 data 추출
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.error?.message || "로그아웃에 실패했습니다"
      );
    }
  } catch (error) {
    // 로그아웃 실패해도 클라이언트 측 토큰은 삭제해야 하므로
    // 에러를 던지지 않고 콘솔에만 기록
    console.error("Logout API error:", error);
    return { message: "로그아웃되었습니다" };
  }
};

export default logout;
