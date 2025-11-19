import React, { useEffect, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { X } from "lucide-react";

const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY  ; // 예제용 테스트 키
// const customerKey = "test_customer_key"; // 로그인 유저 ID (비회원은 ANONYMOUS 사용)

const PaymentWidgetModal = ({ show, onClose, amount, orderId, orderName, customerName }) => {
  const [widgets, setWidgets] = useState(null);
  const [ready, setReady] = useState(false);

  // 1. SDK 및 위젯 초기화
  useEffect(() => {
    if (!show) return;

    async function fetchPaymentWidgets() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        
        // 회원 결제: widgets({ customerKey: "USER_ID" })
        // 비회원 결제: widgets({ customerKey: ANONYMOUS })
        const widgets = tossPayments.widgets({ 
          customerKey: ANONYMOUS 
        }); 
        
        setWidgets(widgets);
      } catch (err) {
        console.error("토스 위젯 로드 실패:", err);
      }
    }
    
    fetchPaymentWidgets();
  }, [show]);

  // 2. 위젯 렌더링 (금액 설정 -> UI 그리기)
  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null || !show) {
        return;
      }

      // 결제 금액 설정
      await widgets.setAmount({
        currency: "KRW",
        value: amount,
      });

      await Promise.all([
        // 결제 UI 렌더링 (Selector ID 일치 필수)
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        // 이용약관 UI 렌더링
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets, show, amount]);

  // 3. 금액 변경 감지 및 업데이트
  useEffect(() => {
    if (widgets == null) return;
    
    widgets.setAmount({
      currency: "KRW",
      value: amount,
    });
  }, [widgets, amount]);

  const handlePaymentRequest = async () => {
    if (!widgets || !ready) return;

    try {
      // 결제 요청
      await widgets.requestPayment({
        orderId: orderId,
        orderName: orderName,
        successUrl: window.location.origin + "/payment/success",
        failUrl: window.location.origin + "/payment/fail",
        customerEmail: "customer@example.com", // 실제 유저 이메일
        customerName: customerName || "구매자",
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[500px] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* 헤더 */}
        <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">주문서</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50">
          
          {/* 상품 정보 섹션 */}
          <div className="px-6 py-6 bg-white mb-2">
            <p className="text-sm text-gray-500 font-medium mb-2">상품 정보</p>
            <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-gray-900 leading-tight w-2/3 break-keep">
                    {orderName}
                </h4>
                <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                    {amount.toLocaleString()}원
                </span>
            </div>
          </div>

          {/* ★ 토스 위젯이 그려질 영역 */}
          <div className="bg-white px-2 pb-4 pt-2">
            <div id="payment-method" className="w-full" />
            <div id="agreement" className="w-full" />
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="p-5 border-t border-gray-100 bg-white z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button
            onClick={handlePaymentRequest}
            disabled={!ready}
            className={`w-full py-4 font-bold text-lg rounded-xl shadow-md transition-all transform active:scale-[0.98] flex justify-center items-center
              ${ready 
                ? "bg-[#3282f6] text-white hover:bg-[#2b71d4]" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {ready ? "결제하기" : <span className="flex items-center">로딩 중...</span>}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default PaymentWidgetModal;