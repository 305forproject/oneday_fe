import axiosClient from "../axiosInstance"

/**
 * 클래스 목록 조회 (필터링, 검색, 정렬)
 * GET /api/classes?categoryId=...&keyword=...&sort=...
 */
const getClasses = async (categoryId, keyword, sort) => {
  const params = {};

  // 1. 카테고리 (선택 안 하면 null -> 보내지 않음)
  if (categoryId !== 'all') {
    params.categoryId = categoryId;
  }

  // 2. 검색어 (keyword)
  if (keyword) {
    params.keyword = keyword; 
  }

  // 3. 정렬 (sort) - 백엔드 기본값은 latest지만 명시적으로 보냄
  if (sort) {
    params.sort = sort;
  }

  try {
    const response = await axiosClient.get('/classes', { params });
    const apiResponse = response.data;

    if (apiResponse.success) {
      return apiResponse.data;
    } else {
      throw new Error(apiResponse.error?.message || '클래스 로딩 실패');
    }
  } catch (error) {
    console.error("Fetch classes error:", error);
    throw error;
  }
};

export default getClasses;