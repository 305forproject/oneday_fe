import axiosClient from "../axiosInstance";

/**
 * 토큰 갱신 API 함수
 *
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise<Object>} { accessToken, refreshToken, tokenType, expiresIn }
 * @throws {Error} 토큰 갱신 실패 시 에러 발생
 *
 * @description
 * - Refresh Token으로 새로운 Access Token 발급
 * - 401 에러 발생 시 자동으로 호출됨 (axiosInstance 인터셉터)
 *
 * @example
 * const tokens = await refreshToken(oldRefreshToken);
 * // tokens = { accessToken, refreshToken, tokenType: "Bearer", expiresIn: 3600 }
 */
const refreshToken = async (refreshToken) => {
  try {
    const response = await axiosClient.post("/auth/refresh", {
      refreshToken,
    });

    // ApiResponse<T> 형식에서 data 추출
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.error?.message || "토큰 갱신에 실패했습니다"
      );
    }
  } catch (error) {
    // Axios 에러 처리
    if (error.response) {
      const errorMessage =
        error.response.data?.error?.message || "토큰 갱신에 실패했습니다";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("서버와 연결할 수 없습니다");
    } else {
      throw new Error(error.message || "토큰 갱신 중 오류가 발생했습니다");
    }
  }
};

export default refreshToken;
