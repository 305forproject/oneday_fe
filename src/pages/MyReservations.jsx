import React, { useState, useEffect } from "react";
import axiosClient from "../service/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Calendar, User } from "lucide-react";

const MyReservations = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [schedules, setSchedules] = useState({
    upcomingSchedules: [],
    pastSchedules: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    // 로컬 스토리지에서 유저 정보 확인
    const accessToken = localStorage.getItem("accessToken");
    const userInfo = localStorage.getItem("userInfo");

    if (accessToken && userInfo) {
      try {
        setUser(JSON.parse(userInfo));
        fetchReservations();
      } catch (error) {
        console.error("Failed to parse user info:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axiosClient.get("/reservations/my");

      if (response.data && response.data.data) {
        setSchedules(response.data.data);
        console.log(schedules);
      }
    } catch (error) {
      console.error("예약 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("정말로 이 예약을 취소하시겠습니까?")) return;

    try {
      await axiosClient.patch(`/reservations/${reservationId}/cancel`);
      alert("예약이 취소되었습니다.");
      fetchReservations(); // 목록 새로고침 -> 상태가 '취소'로 변경된 데이터가 옴
    } catch (error) {
      const msg = error.response?.data?.message || "오류가 발생했습니다.";
      alert(msg);
    }
  };

  const handleViewClass = (classId) => {
    navigate(`/classes/${classId}`);
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    };
    return date.toLocaleDateString("ko-KR", options);
  };

  // 시간 포맷팅
  const formatTimeAndDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const timeStr = startTime.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const durationMs = endTime - startTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    return `${timeStr} (${durationHours}시간)`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const getStatusBadge = (statusName) => {
    if (statusName === "취소" || statusName === "CANCELLED") {
      return (
        <span className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-md">
          취소됨
        </span>
      );
    }
    // 기본값 (확정 등)
    return (
      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
        {statusName || "확정"}
      </span>
    );
  };

  const currentList =
    activeTab === "upcoming"
      ? schedules.upcomingSchedules
      : schedules.pastSchedules;

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen font-sans">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">내 예약 관리</h1>
        <p className="text-muted-foreground">신청한 클래스의 예약 현황을 확인하고 관리하세요.</p>
      </div>
      
      {/* 탭 버튼 영역 */}
      <div className="flex p-1.5 mb-8 bg-muted/50 rounded-xl w-fit border border-border/50">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === "upcoming"
              ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}>
          예정된 클래스 <span className="ml-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{schedules.upcomingSchedules?.length || 0}</span>
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === "past"
              ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}>
          지난 클래스 <span className="ml-1.5 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{schedules.pastSchedules?.length || 0}</span>
        </button>
      </div>

      {/* 2. 리스트 영역 */}
      <div className="space-y-6 min-h-[500px]">
          {currentList && currentList.length > 0 ? (
            currentList.map((reservation) => {
              const isCancelled =
                reservation.statusName === "예약 취소" ||
                reservation.statusCode === 3;

              return (
                <div
                  key={reservation.reservationId}
                  className={`group bg-card rounded-2xl shadow-sm hover:shadow-md border border-border/50 p-6 transition-all duration-300 ${
                    isCancelled ? "opacity-60 grayscale bg-muted/30" : "hover:-translate-y-1"
                  }`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      {/* 상단: 제목 및 배지 */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3
                            className={`text-xl font-bold tracking-tight ${
                              isCancelled
                                ? "text-muted-foreground line-through"
                                : "text-foreground group-hover:text-primary transition-colors"
                            }`}>
                            {reservation.className}
                          </h3>
                          <div className="flex items-center text-muted-foreground text-sm mt-1.5">
                            <User className="w-4 h-4 mr-1.5" />
                            <span className="font-medium text-foreground mr-2">
                              {reservation.teacherName} 강사님
                            </span>
                          </div>
                        </div>
                        {/* 상태 배지 (우측 상단 배치) */}
                        {getStatusBadge(reservation.statusName)}
                      </div>

                      {/* 정보 그리드 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/50">
                        <div className="flex items-center">
                          <span className="w-5 text-primary">📅</span>{" "}
                          {formatDate(reservation.startAt)}
                        </div>
                        <div className="flex items-center">
                          <span className="w-5 text-primary">🕒</span>{" "}
                          {formatTimeAndDuration(
                            reservation.startAt,
                            reservation.endAt
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="w-5 text-primary">📍</span>{" "}
                          {reservation.location}
                        </div>
                        <div className="flex items-center">
                          <span className="w-5 text-primary">💰</span>{" "}
                          <span className="font-semibold text-foreground">{formatPrice(reservation.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 하단 버튼 영역 */}
                  <div className="border-t border-border/50 mt-5 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-muted">예약번호 {reservation.reservationId}</span>
                      {isCancelled && <span className="text-destructive font-bold">취소된 예약</span>}
                    </div>

                    <div className="flex space-x-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleViewClass(reservation.classId)}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold hover:bg-secondary/80 transition-colors">
                        상세 보기
                      </button>

                      {activeTab === "upcoming" && !isCancelled && (
                        <button
                          onClick={() =>
                            handleCancelReservation(reservation.reservationId)
                          }
                          className="flex-1 sm:flex-none px-5 py-2.5 border border-destructive/30 bg-destructive/5 text-destructive rounded-xl text-sm font-bold hover:bg-destructive/10 transition-colors">
                          예약 취소
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed border-border/60">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium text-foreground">예약 내역이 없습니다.</p>
              <p className="text-sm mt-2 mb-6">새로운 클래스를 예약하고 특별한 하루를 만들어보세요!</p>
              <button 
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
              >
                클래스 둘러보기
              </button>
            </div>
          )}
      </div>
    </div>
  );
};
export default MyReservations;
