import React, { useState, useEffect } from "react";
import axiosClient from "../service/axiosInstance";
import { useNavigate } from "react-router-dom";

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
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen font-sans">
      {/* 탭 버튼 영역 */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            activeTab === "upcoming"
              ? "bg-white text-black shadow-sm border border-gray-200"
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          }`}>
          예정된 클래스 ({schedules.upcomingSchedules?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            activeTab === "past"
              ? "bg-white text-black shadow-sm border border-gray-200"
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          }`}>
          지난 클래스 ({schedules.pastSchedules?.length || 0})
        </button>
      </div>

      {/* 리스트 영역 */}
      <div className="space-y-4">
        {currentList && currentList.length > 0 ? (
          currentList.map((reservation) => {
            const isCancelled =
              reservation.statusName === "예약 취소" ||
              reservation.statusCode === 3;

            return (
              <div
                key={reservation.reservationId}
                className={`bg-white rounded-xl border shadow-sm p-6 ${
                  isCancelled ? "opacity-70 bg-gray-50" : "border-gray-200"
                }`}>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 grayscale-[50%]">
                    <img
                      src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt="thumbnail"
                      className={`w-full h-full object-cover ${
                        isCancelled ? "grayscale" : ""
                      }`}
                    />
                  </div> */}

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3
                          className={`text-lg font-bold mb-1 ${
                            isCancelled
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}>
                          {reservation.className}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <span className="mr-2 bg-gray-100 px-1 rounded text-xs">
                            강사
                          </span>
                          {reservation.teacherName}
                        </div>
                      </div>
                      {/* ✅ 상태 배지 함수 호출 */}
                      {getStatusBadge(reservation.statusName)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="w-5 text-gray-400">📅</span>{" "}
                        {formatDate(reservation.startAt)}
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 text-gray-400">🕒</span>{" "}
                        {formatTimeAndDuration(
                          reservation.startAt,
                          reservation.endAt
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 text-gray-400">📍</span>{" "}
                        {reservation.location}
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 text-gray-400">👤</span>{" "}
                        {formatPrice(reservation.price)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-4 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-xs text-gray-500">
                    {isCancelled ? (
                      <span>취소된 예약입니다.</span>
                    ) : (
                      <span>무료 취소 가능 기간입니다.</span>
                    )}
                  </div>

                  <div className="flex space-x-3 w-full md:w-auto">
                    <button
                      onClick={() => handleViewClass(reservation.classId)}
                      className="flex-1 md:flex-none px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      클래스 보기
                    </button>

                    {/* 예정된 클래스이면서 && 취소되지 않은 상태일 때만 '취소 버튼' 노출 */}
                    {activeTab === "upcoming" && !isCancelled && (
                      <button
                        onClick={() =>
                          handleCancelReservation(reservation.reservationId)
                        }
                        className="flex-1 md:flex-none px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition">
                        예약 취소
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-gray-500">
            예약 내역이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
