import axiosClient from "../axiosInstance";

/**
 * 클래스 등록
 * @param {Object} classData - 클래스 등록 정보
 * @param {string} classData.category - 카테고리 (COOKING, CRAFTS, EXERCISE, ART, MUSIC, OTHER)
 * @param {string} classData.className - 클래스명
 * @param {string} classData.classDetail - 클래스 소개
 * @param {string} classData.curriculum - 커리큘럼
 * @param {string} classData.included - 포함 사항
 * @param {string} classData.required - 준비물
 * @param {string} classData.location - 장소
 * @param {string} classData.longitude - 경도
 * @param {string} classData.latitude - 위도
 * @param {string} classData.zipcode - 우편번호
 * @param {number} classData.maxCapacity - 최대 정원
 * @param {number} classData.price - 가격
 * @param {string[]} classData.dates - 날짜 배열 (ISO Date 형식)
 * @param {string} classData.startTime - 시작 시간 (HH:mm:ss)
 * @param {string} classData.endTime - 종료 시간 (HH:mm:ss)
 * @param {Array<{imageUrl: string, imageOrder: number}>} classData.images - 이미지 정보
 * @returns {Promise<{classId: number, className: string, category: string}>}
 */
const createClass = async (classData) => {
  try {
    const response = await axiosClient.post("/classes", classData);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error?.message || "클래스 등록에 실패했습니다");
    }
  } catch (error) {
    console.error("클래스 등록 API 오류:", error);

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error.message);
    }

    throw new Error(error.message || "클래스 등록 중 오류가 발생했습니다");
  }
};

export default createClass;
