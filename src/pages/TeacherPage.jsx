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
    <div className="max-w-4xl mx-auto p-6 bg-background min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-8">강사 대시보드</h1>

      {/* 탭 버튼 영역 */}
      <div className="flex p-1 mb-8 bg-muted rounded-xl w-fit">
        <button
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "upcoming"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("upcoming")}>
          예정된 클래스 ({schedules.upcoming.length})
        </button>
        <button
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "past"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("past")}>
          지난 클래스 ({schedules.past.length})
        </button>
      </div>

      {/* 2. 리스트 영역 */}
      <div className="space-y-6 min-h-[500px]">
          {currentList.length > 0 ? (
            currentList.map((schedule) => (
              // ClassCard는 흰색 배경을 가지고 있으므로, 회색 박스 안에서 잘 보입니다.
              <ClassCard key={schedule.timeId} schedule={schedule} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border">
              <p className="text-lg font-medium">등록된 클래스 스케줄이 없습니다.</p>
            </div>
          )}
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
    <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/50 transition-all hover:shadow-md">
      {/* 상단: 수업 정보 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold mb-2 text-foreground">{schedule.className}</h3>
          <div className="text-muted-foreground text-sm space-y-1.5">
            {/* 날짜 포맷팅은 필요에 따라 수정 (예: date-fns, dayjs 등 사용) */}
            <p className="flex items-center">
              <span className="font-medium text-foreground flex items-center">
                📅 {formatDate(schedule.startAt)}
              </span>

              {/* ✅ formatTime 함수 사용 위치 */}
              <span className="ml-3 text-foreground font-medium">
                {formatTime(schedule.startAt)}
              </span>

              {/* 소요 시간 */}
              <span className="text-muted-foreground ml-1.5">
                ({getDuration(schedule.startAt, schedule.endAt)})
              </span>
            </p>
            <p className="flex items-center">📍 {schedule.location}</p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            isPast
              ? "bg-muted text-muted-foreground" // 지난 클래스: 연회색 (종료)
              : "bg-primary text-primary-foreground" // 예정 클래스: 검정 배경 + 흰 글씨
          }`}>
          {isPast ? "종료" : "확정"}
        </span>
      </div>

      {/* 중간: 인원 정보 및 버튼 */}
      <div className="flex justify-between items-center border-t border-border/50 pt-4">
        <div className="text-foreground font-medium text-sm flex items-center">
          <span className="bg-muted p-1.5 rounded-md mr-2">👥</span>
          참가자{" "}
          <span className="font-bold ml-1">{schedule.confirmedStudentCount}</span>
          <span className="text-muted-foreground mx-1">/</span>
          {schedule.maxCapacity}명
        </div>
        <button
          onClick={toggleDetails}
          className="text-sm text-muted-foreground hover:text-foreground font-medium flex items-center transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
          {isOpen ? "접기 ▲" : "참가자 보기 ▼"}
        </button>
      </div>

      {/* 하단: 학생 목록 (Lazy Loading) */}
      {isOpen && (
        <div className="mt-4 bg-muted/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 border border-border/50">
          <p className="font-bold text-sm mb-3 text-foreground">참가자 명단</p>

          {isLoading ? (
            <div className="text-center text-sm py-4 text-muted-foreground flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              로딩 중...
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center bg-background p-3 rounded-lg border border-border/50 shadow-sm">
                  {/* 학생 아이콘 (이름 첫 글자) */}
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 text-primary font-bold text-sm">
                    {student.studentName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      {student.studentName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                      {/* DTO에 phoneNumber가 있다고 가정 */}
                      <span className="flex items-center">✉️ {student.studentEmail}</span>
                      {student.studentPhoneNumber && (
                        <span className="flex items-center">📞 {student.studentPhoneNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 bg-background rounded-lg border border-dashed border-border">
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
