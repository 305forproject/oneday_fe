import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  User,
  CheckCircle,
} from "lucide-react";
import getClassDetail from "../service/class/getClassDetail";
import AiAdvisorSection from "../features/class/AIAdvisor";
import PaymentWidgetModal from "../features/payment/PaymentModal";
import { initKakaoMap } from "../utils/kakaoMap";

// --- Main Page Component ---
const ClassDetailPage = () => {
  const { classId } = useParams();

  // --- State Management ---
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  const [clickCount, setClickCount] = useState(0);
  const [showAi, setShowAi] = useState(false);

  // 3번 클릭 감지 핸들러
  const handleTitleClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setShowAi(true); // 3번 도달하면 보여주기
        return 0; // 카운트 초기화
      }
      return newCount;
    });
  };

  // 모달 상태
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState("");

  // --- API Data Fetching ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        // API 호출 (가상 함수)
        const data = await getClassDetail(classId);
        setClassData(data);

        if (data && data.schedules && data.schedules.length > 0) {
          const firstDate = data.schedules[0].startAt.split(" ")[0];
          setSelectedDate(firstDate);
        }
      } catch (err) {
        console.error(err);
        setError("클래스 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      loadData();
    }
  }, [classId]);

  // Kakao Map 초기화
  useEffect(() => {
    if (classData && classData.latitude && classData.longitude) {
      // DOM이 렌더링된 후 지도 초기화
      setTimeout(() => {
        initKakaoMap(classData.latitude, classData.longitude);
      }, 100);
    }
  }, [classData]);

  // --- Helper Functions ---
  const getDayOfWeek = (dateStr) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  const uniqueDates = useMemo(() => {
    if (!classData?.schedules) return [];
    const dates = classData.schedules.map((s) => {
      const datePart = s.startAt.split(" ")[0];
      return {
        date: datePart,
        day: getDayOfWeek(datePart),
        displayDate: datePart.substring(5).replace("-", "/"),
      };
    });
    const uniqueMap = new Map();
    dates.forEach((item) => {
      if (!uniqueMap.has(item.date)) uniqueMap.set(item.date, item);
    });
    return Array.from(uniqueMap.values());
  }, [classData]);

  const availableTimes = useMemo(() => {
    if (!classData?.schedules || !selectedDate) return [];

    const now = new Date(); // 현재 시간

    return classData.schedules
      .filter((s) => s.startAt.startsWith(selectedDate))
      .map((s) => {
        // "YYYY-MM-DD HH:mm:ss" 형식을 Date 객체로 변환 (Safari 호환성을 위해 T로 치환 권장)
        const scheduleDate = new Date(s.startAt.replace(" ", "T"));
        const isPast = scheduleDate < now; // 현재 시간보다 이전인지 확인

        return {
          timeId: s.timeId,
          timeStr: s.startAt.split(" ")[1].substring(0, 5),
          endTimeStr: s.endAt.split(" ")[1].substring(0, 5),
          isPast: isPast, // 지난 시간 여부 플래그
        };
      });
  }, [classData, selectedDate]);

  const classDuration = useMemo(() => {
    if (!classData?.schedules || classData.schedules.length === 0) return "-";
    const schedule = classData.schedules[0];
    const start = new Date(schedule.startAt.replace(" ", "T"));
    const end = new Date(schedule.endAt.replace(" ", "T"));
    const diffMs = end - start;
    if (isNaN(diffMs)) return "-";
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
  }, [classData]);

  const nextImage = () => {
    if (!classData?.imageUrls || classData.imageUrls.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % classData.imageUrls.length);
  };

  const prevImage = () => {
    if (!classData?.imageUrls || classData.imageUrls.length === 0) return;
    setCurrentImageIndex(
      (prev) =>
        (prev - 1 + classData.imageUrls.length) % classData.imageUrls.length
    );
  };

  const renderTextList = (text, type = "dot") => {
    if (!text) return <p className="text-gray-400 text-sm">정보가 없습니다.</p>;
    const items = text.split(/\\n|\n/).filter((item) => item.trim() !== "");

    if (type === "number") {
      return (
        <ol className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                {index + 1}
              </span>
              <span className="text-gray-700 leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      );
    } else {
      return (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start text-gray-600">
              <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    }
  };

  const handleReserveClick = () => {
    if (!selectedDate || !selectedScheduleId) return;

    // 1. 주문 ID 생성
    const newOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    setCurrentOrderId(newOrderId);

    // 2. 중요: Success Page에서 timeId를 알 수 있도록 저장
    sessionStorage.setItem(
      `order_${newOrderId}`,
      JSON.stringify({
        classId: classId,
        timeId: selectedScheduleId,
        amount: classData.price,
      })
    );

    // 3. 모달 열기
    setShowPaymentModal(true);
  };

  // --- UI Rendering ---
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="flex flex-col items-center text-blue-600">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p>클래스 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-6">
            {error || "데이터를 찾을 수 없습니다."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const images = classData.imageUrls || [];

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Image Slider */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden group shadow-sm">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={`Class view ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/800x500?text=No+Image";
                    }}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                  <span>이미지가 없습니다.</span>
                </div>
              )}
              {classData.categoryName && (
                <span className="absolute top-4 left-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {classData.categoryName}
                </span>
              )}
            </div>

            {/* Class Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {classData.className}
              </h1>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
                <div className="flex items-center text-yellow-500 font-medium bg-yellow-50 px-2 py-1 rounded">
                  <Star size={16} className="fill-current mr-1" />
                  4.8{" "}
                  <span className="text-gray-400 font-normal ml-1">(127)</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1.5 text-gray-400" />
                  {classData.location}
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1.5 text-gray-400" />
                  {classDuration}
                </div>
                <div className="flex items-center">
                  <User size={16} className="mr-1.5 text-gray-400" />
                  최대 {classData.maxCapacity}명
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Teacher */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                강사 소개
              </h3>
              <div className="flex items-center p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 mr-4">
                  {classData.teacherName ? classData.teacherName[0] : "T"}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {classData.teacherName}
                  </p>
                  {/* <p className="text-sm text-gray-500 mt-0.5">전문 강사</p> */}
                </div>
              </div>
            </div>

            {/* Details & Curriculum (Icon Style) */}
            <div>
              <h3
                onClick={handleTitleClick}
                className="text-lg font-bold text-gray-900 mb-5 cursor-pointer select-none active:text-gray-600 transition-colors"
              >
                클래스 소개
              </h3>

              <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100">
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {classData.classDetail}
                </p>
              </div>

              {showAi && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <AiAdvisorSection classData={classData} />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">커리큘럼</h3>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                {renderTextList(classData.curriculum, "number")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-50/50 p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle size={20} className="mr-2 text-green-600" />
                  포함 사항
                </h3>
                {renderTextList(classData.included, "dot")}
              </div>
              <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle size={20} className="mr-2 text-orange-500" />
                  준비물
                </h3>
                {renderTextList(classData.required, "dot")}
              </div>
            </div>

            {/* Kakao Map */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">위치</h3>
              <div
                id="map"
                className="w-full h-64 bg-gray-100 rounded-xl border border-gray-200"
              ></div>
              <p className="text-sm text-gray-600 mt-3 flex items-center">
                <MapPin size={16} className="mr-1.5 text-gray-400" />
                {classData.location}
              </p>
            </div>
          </div>

          {/* Right Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-baseline mb-6 border-b border-gray-100 pb-6">
                <span className="text-2xl font-bold text-gray-900">
                  {classData.price?.toLocaleString()}원
                </span>
                <span className="text-gray-400 text-sm">/ 1인</span>
              </div>

              {/* Date Select */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  날짜 선택
                </h4>
                {uniqueDates.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {uniqueDates.map((item) => (
                      <button
                        key={item.date}
                        onClick={() => {
                          setSelectedDate(item.date);
                          setSelectedScheduleId(null);
                        }}
                        className={`flex flex-col items-center py-2 px-1 rounded-lg border transition-all ${
                          selectedDate === item.date
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`text-xs mb-1 ${
                            selectedDate === item.date
                              ? "text-gray-300"
                              : "text-gray-400"
                          }`}
                        >
                          {item.day}
                        </span>
                        <span className="font-bold text-sm">
                          {item.displayDate}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    예약 가능한 날짜가 없습니다.
                  </p>
                )}
              </div>

              {/* Time Select */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  시간 선택
                </h4>
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimes.map((timeInfo) => (
                      <button
                        key={timeInfo.timeId}
                        // [수정됨] 지난 시간일 경우 disabled 처리
                        disabled={timeInfo.isPast}
                        onClick={() => setSelectedScheduleId(timeInfo.timeId)}
                        className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all ${
                          selectedScheduleId === timeInfo.timeId
                            ? "bg-gray-900 text-white border-gray-900"
                            : timeInfo.isPast
                            ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed" // [수정됨] 지난 시간 스타일
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        {timeInfo.timeStr}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                    날짜를 먼저 선택해주세요
                  </p>
                )}
              </div>

              <button
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedDate && selectedScheduleId
                    ? "bg-gray-900 text-white shadow-lg hover:bg-black"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!selectedDate || !selectedScheduleId}
                onClick={handleReserveClick}
              >
                예약하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {classData && (
        <PaymentWidgetModal
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={classData.price}
          orderName={classData.className}
          orderId={currentOrderId}
          customerName="홍길동"
        />
      )}
    </div>
  );
};

export default ClassDetailPage;
