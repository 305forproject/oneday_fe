import axiosClient from "../axiosInstance";

/**
 * 카테고리 목록 조회
 * GET /api/categories
 */
const getCategories = async () => {
  try {
    // baseURL이 '/api'이므로 '/categories'만 호출
    const response = await axiosClient.get('/categories'); 
    const apiResponse = response.data; // ApiResponse 객체

    if (apiResponse.success) {
      return apiResponse.data; // CategoryResponseDto[]
    } else {
      throw new Error(apiResponse.error?.message || '카테고리 로딩 실패');
    }
  } catch (error) {
    console.error("Fetch categories error:", error);
    throw error;
  }
};

export default getCategories;