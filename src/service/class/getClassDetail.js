import axiosClient from '../axiosInstance';

/**
 * 클래스 상세 정보를 가져옵니다.
 * @param {string | number} classId - 클래스 ID
 * @returns {Promise<Object>} 클래스 상세 데이터 DTO
 */
const getClassDetail = async (classId) => {
  try {
    // 실제 백엔드 요청
    const response = await axiosClient.get(`/classes/${classId}`);

    // 백엔드 응답 구조(ApiResponse)에 맞춰 실제 데이터만 반환
    // 예: { status: "SUCCESS", data: { ...DTO }, message: null }
    if (response.data && response.data.data) {
      console.log(response.data.data);
      return response.data.data;
    } else {
      // 구조가 다를 경우 전체를 반환하거나 에러 처리
      return response.data;
    }
  } catch (error) {
    // 에러를 호출한 곳(Component)으로 전파하여 UI에서 처리하도록 함
    console.error(`Error fetching class detail (ID: ${classId})`, error);
    throw error;
  }
};

export default getClassDetail