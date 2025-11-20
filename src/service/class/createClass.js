import axiosClient from "../axiosInstance";

/**
 * 클래스 등록 (multipart/form-data)
 * @param {Object} classData - 클래스 데이터
 * @param {File[]} imageFiles - 이미지 파일 배열
 * @param {number} primaryImageIndex - 대표 이미지 인덱스
 * @returns {Promise<{classId: number, className: string, category: string}>}
 */
const createClass = async (classData, imageFiles, primaryImageIndex) => {
  try {
    const formData = new FormData();

    // 클래스 데이터를 FormData에 추가
    Object.keys(classData).forEach((key) => {
      const value = classData[key];
      if (key === "schedules" && Array.isArray(value)) {
        // schedules 배열은 인덱스 기반 필드명으로 추가
        // Spring @ModelAttribute가 List<TimeSlotDto>로 바인딩할 수 있도록
        value.forEach((schedule, index) => {
          formData.append(`schedules[${index}].date`, schedule.date);
          formData.append(`schedules[${index}].startTime`, schedule.startTime);
          formData.append(`schedules[${index}].endTime`, schedule.endTime);
        });
      } else if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // 이미지 파일 추가
    imageFiles.forEach((file) => {
      formData.append("imageFiles", file);
    });

    // 대표 이미지 인덱스 추가
    formData.append("primaryImageIndex", primaryImageIndex);

    const response = await axiosClient.post("/classes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.error?.message || "클래스 등록에 실패했습니다"
      );
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
