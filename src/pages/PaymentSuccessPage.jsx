import React, { useEffect, useRef, useState } from "react";
import {
  useSearchParams,
  useNavigate,
  useInRouterContext,
  BrowserRouter,
} from "react-router-dom";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import axiosClient from "../service/axiosInstance";

// 실제 페이지 로직이 들어있는 컴포넌트
const PaymentSuccessPageContent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // 상태: loading | success | error
  const [errorMessage, setErrorMessage] =
    useState("결제 승인 처리에 실패했습니다.");
  const isProcessing = useRef(false);

  useEffect(() => {
    const processPayment = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      // [핵심 수정 1] 파라미터가 아직 로드되지 않았다면?
      // 에러를 띄우지 말고 그냥 리턴(로딩 유지)해서 다음 렌더링을 기다립니다.
      if (!paymentKey || !orderId || !amount) {
        return;
      }

      // [핵심 수정 2] 이미 처리 중이라면 중단 (Strict Mode 등에서 두 번 실행 방지)
      if (isProcessing.current) return;
      isProcessing.current = true;

      // 세션 데이터 확인
      const savedOrderData = sessionStorage.getItem(`order_${orderId}`);

      // 파라미터는 왔는데 세션 데이터가 없다면? 이건 진짜 에러입니다.
      if (!savedOrderData) {
        console.error("주문 정보 세션 유실");
        setStatus("error");
        return;
      }

      const { timeId } = JSON.parse(savedOrderData);

      try {
        await axiosClient.post("/payments/complete", {
          timeId: Number(timeId),
          paymentKey: paymentKey,
          orderId: orderId,
          amount: Number(amount),
        });

        setStatus("success");
        sessionStorage.removeItem(`order_${orderId}`);
      } catch (error) {
        const serverData = error.response?.data;
        const serverMessage =
          serverData?.error?.message || "결제 처리에 실패했습니다.";
        setErrorMessage(serverMessage);
        setStatus("error");
        // 실패 시 재시도를 위해 lock을 풀어줄 수도 있습니다.
        isProcessing.current = false;
      }
    };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          결제가 성공했습니다!
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          예약이 확정되었습니다. 강의실에서 만나요!
        </p>
        <button
          onClick={() => navigate("/")} // 메인으로 이동 (원하는 경로로 수정 가능)
          className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
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
      <div className="text-center mb-8">
        <p className="text-red-600 font-bold text-lg mb-2">{errorMessage}</p>
        <p className="text-gray-500 text-sm">
          문제가 지속되면 고객센터에 문의해주세요.
        </p>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors">
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
