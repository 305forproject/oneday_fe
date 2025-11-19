import axiosClient from "../axiosInstance";

/**
 * 회원가입 API 함수
 *
 * @param {string} email - 사용자 이메일
 * @param {string} password - 비밀번호
 * @param {string} name - 사용자 이름
 * @returns {Promise<Object>} { id, email, name }
 * @throws {Error} 회원가입 실패 시 에러 발생
 */
const signup = async (email, password, name) => {
  try {
    const response = await axiosClient.post("/auth/signup", {
      email,
      password,
      name,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.error?.message || "회원가입에 실패했습니다"
      );
    }
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.error?.message || "회원가입에 실패했습니다";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("서버와 연결할 수 없습니다");
    } else {
      throw new Error(error.message || "회원가입 중 오류가 발생했습니다");
    }
  }
};

export default signup;
