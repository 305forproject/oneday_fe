import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useInRouterContext, BrowserRouter } from "react-router-dom";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import axiosClient from "../service/axiosInstance"; 

// 실제 페이지 로직이 들어있는 컴포넌트
const PaymentSuccessPageContent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // 상태: loading | success | error

  useEffect(() => {
    const processPayment = async () => {
      // 1. URL 파라미터에서 핵심 정보 추출
      // (토스가 리다이렉트 시켜줄 때 URL 뒤에 붙여준 값들입니다)
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");
      
      // 2. 아까 예약하기 버튼 누를 때 세션에 저장해둔 수업 정보(timeId) 가져오기
      const savedOrderData = sessionStorage.getItem(`order_${orderId}`);

      // 필수 정보가 하나라도 없으면 에러 처리
      if (!paymentKey || !orderId || !amount || !savedOrderData) {
        console.error("결제 승인 데이터 부족");
        setStatus("error");
        return;
      }

      const { timeId } = JSON.parse(savedOrderData);

      try {
        // 3. [백엔드 호출] 핵심 정보 4가지만 서버로 보냅니다.
        // "서버야, 토스에서 이런 키를 받았어. 네가 토스한테 확인하고 저장해줘."
        await axiosClient.post("/payments/complete", {
            timeId: Number(timeId),
            paymentKey: paymentKey,
            orderId: orderId,
            amount: Number(amount)
        });

        // 백엔드 처리가 성공하면 성공 화면 표시
        setStatus("success");
        // 다 쓴 세션 데이터 삭제
        sessionStorage.removeItem(`order_${orderId}`);

      } catch (error) {
        console.error("결제 승인 요청 실패:", error);
        if (error.response) {
            console.error("서버 에러 메시지:", error.response.data);
        }
        setStatus("error");
      }
    };

    // 페이지 들어오자마자 실행
    processPayment();
  }, [searchParams]);

  // --- 화면 렌더링 ---

  // 1. 로딩 중일 때
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 size={50} className="text-gray-900 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">
          결제를 확인하고 저장하는 중입니다...
        </p>
      </div>
    );
  }

  // 2. 성공했을 때
  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="bg-green-50 p-6 rounded-full mb-6">
            <CheckCircle size={64} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">결제가 성공했습니다!</h1>
        <p className="text-gray-600 mb-8 text-center">
          예약이 확정되었습니다. 강의실에서 만나요!
        </p>
        <button
          onClick={() => navigate("/")} // 메인으로 이동 (원하는 경로로 수정 가능)
          className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
        >
          홈으로 이동
        </button>
      </div>
    );
  }

  // 3. 실패했을 때
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="bg-red-50 p-6 rounded-full mb-6">
            <AlertCircle size={64} className="text-red-600" />
        </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 승인 실패</h1>
      <p className="text-gray-600 mb-8 text-center">
        서버 처리 중 오류가 발생했습니다. <br/>
        잠시 후 다시 시도하거나 고객센터에 문의해주세요.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors"
      >
        이전 화면으로
      </button>
    </div>
  );
};

// (에러 방지용 래퍼) 라우터 밖에서 실행될 경우를 대비해 안전장치를 씌웁니다.
const PaymentSuccessPage = () => {
  const inRouter = useInRouterContext();
  if (!inRouter) {
    return (
      <BrowserRouter>
        <PaymentSuccessPageContent />
      </BrowserRouter>
    );
  }
  return <PaymentSuccessPageContent />;
};

export default PaymentSuccessPage;