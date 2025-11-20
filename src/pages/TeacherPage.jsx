import React, { useState, useEffect } from "react";
import axiosClient from "../service/axiosInstance";

const TeacherPage = () => {
  const [schedules, setSchedules] = useState({ upcoming: [], past: [] });
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'past'

  useEffect(() => {
    fetchMySchedule();
  }, []);

  const fetchMySchedule = async () => {
    try {
      const response = await axiosClient.get("teachers/my-schedule");

      console.log(response.data.data);
      setSchedules({
        upcoming: response.data.data.upcomingSchedules,
        past: response.data.data.pastSchedules,
      });
    } catch (error) {
      console.error("스케줄 로딩 실패", error);
    }
  };

  const currentList =
    activeTab === "upcoming" ? schedules.upcoming : schedules.past;

  return (
    // 1. 전체 페이지 배경을 흰색(bg-white)으로 변경
    <div className="max-w-3xl mx-auto p-4 bg-white min-h-screen font-sans">
      {/* 탭 버튼 영역 */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            activeTab === "upcoming"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("upcoming")}>
          예정된 클래스 ({schedules.upcoming.length})
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            activeTab === "past"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("past")}>
          지난 클래스 ({schedules.past.length})
        </button>
      </div>

      {/* 2. 리스트 영역을 회색 박스(bg-gray-50)로 감싸기 */}
      <div className="bg-gray-50 rounded-2xl p-4 min-h-[500px]">
        <div className="space-y-4">
          {currentList.length > 0 ? (
            currentList.map((schedule) => (
              // ClassCard는 흰색 배경을 가지고 있으므로, 회색 박스 안에서 잘 보입니다.
              <ClassCard key={schedule.timeId} schedule={schedule} />
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              등록된 클래스 스케줄이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 개별 카드 컴포넌트
const ClassCard = ({ schedule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // 한 번 로드했으면 다시 안 부르기 위해

  const toggleDetails = async () => {
    if (!isOpen && !isLoaded) {
      setIsLoading(true);
      try {
        const response = await axiosClient.get(
          `teachers/schedule/${schedule.timeId}/students`
        );

        setStudents(response.data.data);
        setIsLoaded(true);
      } catch (error) {
        console.error("학생 목록 로딩 실패", error);
        alert("데이터를 불러오지 못했습니다.");
        return;
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  // ✅ 날짜 포맷팅 함수 (요일 추가)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // 옵션: 년, 월, 일, 요일(짧게)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short", // 이 옵션이 '(목)' 처럼 요일을 붙여줍니다.
    });
  };

  // ✅ 시간 포맷팅 함수 (예: 10:00)
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24시간제 (취향에 따라 true로 변경 가능)
    });
  };

  const getDuration = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return `${diffHours}시간`; // 예: "2시간"
  };

  const isPast = new Date(schedule.endAt) < new Date();

  return (
    <div className="bg-white rounded-lg shadow p-5 relative">
      {/* 상단: 수업 정보 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold mb-2">{schedule.className}</h3>
          <div className="text-gray-600 text-sm space-y-1">
            {/* 날짜 포맷팅은 필요에 따라 수정 (예: date-fns, dayjs 등 사용) */}
            <p>
              <span className="font-medium">
                📅 {formatDate(schedule.startAt)}
              </span>

              {/* ✅ formatTime 함수 사용 위치 */}
              <span className="ml-2 text-gray-800">
                {formatTime(schedule.startAt)}
              </span>

              {/* 소요 시간 */}
              <span className="text-gray-600 ml-1">
                ({getDuration(schedule.startAt, schedule.endAt)})
              </span>
            </p>
            <p>📍 {schedule.location}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded ${
            isPast
              ? "bg-gray-100 text-gray-400" // 지난 클래스: 연회색 (종료)
              : "bg-blue-600 text-white" // 예정 클래스: 검정 배경 + 흰 글씨
          }`}>
          {isPast ? "종료" : "확정"}
        </span>
      </div>

      {/* 중간: 인원 정보 및 버튼 */}
      <div className="flex justify-between items-center border-t pt-3">
        <div className="text-gray-700 font-medium text-sm">
          👥 참가자{" "}
          <span className="font-bold">{schedule.confirmedStudentCount}</span>/
          {schedule.maxCapacity}명
        </div>
        <button
          onClick={toggleDetails}
          className="text-sm text-gray-500 hover:text-gray-800 font-medium">
          {isOpen ? "접기 ▲" : "보기 ▼"}
        </button>
      </div>

      {/* 하단: 학생 목록 (Lazy Loading) */}
      {isOpen && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3 animate-fade-in-down">
          <p className="font-bold text-sm mb-2 text-gray-700">참가자 명단</p>

          {isLoading ? (
            <div className="text-center text-sm py-2 text-gray-400">
              로딩 중...
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center bg-white p-3 rounded border shadow-sm">
                  {/* 학생 아이콘 (이름 첫 글자) */}
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-gray-600 font-bold text-xs">
                    {student.studentName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm">
                      {student.studentName}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {/* DTO에 phoneNumber가 있다고 가정 */}
                      <span className="mr-2">✉️ {student.studentEmail}</span>
                      {student.studentPhoneNumber && (
                        <span>📞 {student.studentPhoneNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  등록된 학생이 없습니다.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherPage;
