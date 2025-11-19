import React, { useState } from "react";
import { Loader2, Sparkles, Send } from "lucide-react";

// --- AI Advisor Component (New Feature) ---
const AiAdvisorSection = ({ classData }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAi = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer(""); // 초기화

    try {
      const scheduleText =
        classData.schedules
          ?.map((s, i) => `${i + 1}회차: ${s.startAt} ~ ${s.endAt}`)
          .join("\n        ") || "일정 정보 없음";
      const apiKey = import.meta.env.VITE_GG_API_KEY; // API Key provided by environment
      const prompt = `
        당신은 이 원데이 클래스 플랫폼의 친절하고 전문적인 AI 상담사 '지니'입니다.
        아래 제공된 클래스 정보를 바탕으로 고객의 질문에 한국어로 답변해주세요.
        
        --- 클래스 정보 ---
        강의명: ${classData.className}
        강사: ${classData.teacherName}
        가격: ${classData.price}원
        장소: ${classData.location}
        상세설명: ${classData.classDetail}
        커리큘럼: ${classData.curriculum}
        포함사항: ${classData.included}
        준비물: ${classData.required}
        정원: ${classData.maxCapacity}명
        일정 목록:${scheduleText}
        ------------------
        
        규칙:
        1. 클래스 정보에 있는 내용만 답변하세요. 정보가 없다면 "해당 내용은 상세 페이지에 나와있지 않아, 강사님께 직접 문의가 필요해 보입니다."라고 정중히 답하세요.
        2. 말투는 "해요"체를 사용하여 친근하고 전문적으로 답변하세요.
        3. 질문: ${question}
      `;

      const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
      // const MODEL_NAME = "gemini-3-pro-preview-11-2025"
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiText) {
        setAnswer(aiText);
      } else {
        setAnswer("죄송합니다. 지금은 답변을 생성할 수 없습니다.");
      }
    } catch (error) {
      console.error(" API Error:", error);
      setAnswer("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-10 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div className="flex items-center text-white">
          <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
          <h3 className="font-bold text-lg">AI 수강 상담사</h3>
        </div>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
          Beta
        </span>
      </div>

      <div className="p-6 bg-gray-50">
        {answer ? (
          <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 mb-1">AI 지니</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {answer}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setAnswer("");
                setQuestion("");
              }}
              className="mt-3 text-xs text-gray-500 hover:text-gray-900 underline ml-11">
              다른 질문하기
            </button>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <p className="text-gray-600 text-sm mb-2">
              "초보자도들을 수 있나요?"
            </p>
            <p className="text-gray-400 text-xs">
              클래스에 대해 궁금한 점을 무엇이든 물어보세요!
            </p>
          </div>
        )}

        {!answer && (
          <div className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isLoading && handleAskAi()
              }
              placeholder="질문을 입력하세요..."
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white shadow-sm transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleAskAi}
              disabled={isLoading || !question.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                isLoading || !question.trim()
                  ? "text-gray-300 bg-gray-100 cursor-not-allowed"
                  : "text-white bg-gray-900 hover:bg-black shadow-md"
              }`}>
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAdvisorSection;
