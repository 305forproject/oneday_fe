import axiosClient from "../axiosInstance";

/**
 * 로그인 API 함수
 *
 * @param {string} email - 사용자 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} { accessToken, refreshToken, tokenType, expiresIn }
 * @throws {Error} 로그인 실패 시 에러 발생
 *
 * @example
 * const response = await login("user@example.com", "password123");
 * // response.data = { accessToken, refreshToken, tokenType: "Bearer", expiresIn: 3600 }
 */
const login = async (email, password) => {
  try {
    const response = await axiosClient.post("/auth/login", {
      email,
      password,
    });

    // ApiResponse<T> 형식에서 data 추출
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error?.message || "로그인에 실패했습니다");
    }
  } catch (error) {
    // Axios 에러 처리
    if (error.response) {
      // 서버 응답이 있는 경우
      const errorMessage =
        error.response.data?.error?.message || "로그인에 실패했습니다";
      throw new Error(errorMessage);
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      throw new Error("서버와 연결할 수 없습니다");
    } else {
      // 그 외 에러
      throw new Error(error.message || "로그인 중 오류가 발생했습니다");
    }
  }
};

export default login;
