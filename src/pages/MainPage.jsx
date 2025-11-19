import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronRight,
  Loader2,
  Heart,
  MapPin,
  User,
} from "lucide-react";
import getClasses from "../service/class/getClasses";
import { ClassCard } from "../components/ClassCard";
import getCategories from "../service/class/getCategories";

// --- Components ---

/**
 * Main Application Component
 */
export default function App() {
  const [categories, setCategories] = useState([]);
  const [popularClasses, setPopularClasses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all"); // 'all' 또는 categoryId(number)
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [apiError, setApiError] = useState(null);

  // --- Data Loading ---

  // 카테고리 데이터 로드 (컴포넌트 마운트 시 1회)
  useEffect(() => {
    setLoadingCategories(true);
    setApiError(null);
    getCategories()
      .then((data) => {
        // '전체' 카테고리를 수동으로 추가
        setCategories([{ categoryId: "all", categoryName: "전체" }, ...data]);
      })
      .catch((err) => {
        setApiError(err.message || "카테고리를 불러오지 못했습니다.");
        setCategories([{ categoryId: "all", categoryName: "전체" }]); // 에러 시에도 '전체'는 표시
      })
      .finally(() => {
        setLoadingCategories(false);
      });
  }, []); // 빈 배열: 마운트 시 1회 실행

  // 클래스 데이터 로드 (selectedCategory 또는 searchTerm 변경 시)
  const loadClasses = useCallback(() => {
    setLoadingClasses(true);
    setApiError(null);

    // 검색 폼 제출이 아닌, 카테고리 변경 시에는 검색어 초기화 (선택사항)
    // 여기서는 검색어를 유지합니다.

    getClasses(selectedCategory, searchTerm)
      .then((data) => {
        setPopularClasses(data);
      })
      .catch((err) => {
        setApiError(err.message || "클래스를 불러오지 못했습니다.");
        setPopularClasses([]);
      })
      .finally(() => {
        setLoadingClasses(false);
      });
  }, [selectedCategory, searchTerm]); // selectedCategory 또는 searchTerm이 바뀔 때마다 함수 재생성

  // selectedCategory가 변경되면 클래스를 다시 로드
  useEffect(() => {
    loadClasses();
  }, [selectedCategory, loadClasses]); // selectedCategory가 바뀔 때마다 실행

  // --- Event Handlers ---

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadClasses();
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    // searchTerm을 초기화할지 여부 결정
    // setSearchTerm(''); // 카테고리 변경 시 검색어 초기화 (주석 처리됨)
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* --- Hero / Search Section --- */}
        <section className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            새로운 취미를 시작하세요
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            다양한 원데이 클래스로 특별한 경험을 만들어보세요
          </p>

          {/* 검색 바 */}
          <form
            onSubmit={handleSearchSubmit} // 이벤트 핸들러 변경
            className="mt-8 flex w-full max-w-2xl items-center rounded-lg border border-border bg-card shadow-sm"
          >
            <div className="pl-5 pr-3 text-muted-foreground">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // state에 검색어 반영
              placeholder="클래스명, 강사명으로 찾아보세요"
              className="h-14 flex-1 bg-transparent pr-4 text-base text-foreground placeholder-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="m-2 shrink-0 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              검색
            </button>
          </form>
        </section>

        {/* --- Category Filter Section --- */}
        <section className="mt-12">
          {loadingCategories ? (
            <div className="flex justify-center space-x-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-20 animate-pulse rounded-full bg-muted"
                ></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.categoryId}
                  onClick={() => handleCategoryClick(category.categoryId)} // 이벤트 핸들러 변경
                  className={`
                    rounded-full px-5 py-2 text-sm font-semibold transition-all
                    ${
                      selectedCategory === category.categoryId
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                >
                  {category.categoryName}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* --- Popular Classes Section --- */}
        <section className="mt-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-3xl font-bold tracking-tight">인기 클래스</h2>
            <a
              href="#"
              className="group flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              전체보기
              <ChevronRight
                size={16}
                className="ml-1 transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>

          {/* API 에러 표시 */}
          {apiError && (
            <div className="mb-6 rounded-md border border-destructive bg-destructive/10 p-4 text-center text-destructive">
              {apiError}
            </div>
          )}

          {/* 클래스 그리드 */}
          {loadingClasses ? (
            // 로딩 스켈레톤
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col space-y-3 rounded-lg bg-card p-4 shadow-md border border-border"
                >
                  <div className="aspect-video w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-1/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
                  <div className="h-6 w-1/3 animate-pulse rounded bg-muted mt-auto pt-4"></div>
                </div>
              ))}
            </div>
          ) : (
            // 실제 데이터 그리드
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {popularClasses.map((classInfo) => (
                <ClassCard key={classInfo.classId} classInfo={classInfo} />
              ))}
            </div>
          )}

          {/* 클래스가 없을 때 */}
          {!loadingClasses && !apiError && popularClasses.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
              <h3 className="text-xl font-semibold text-foreground">
                표시할 클래스가 없습니다.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm
                  ? `'${searchTerm}'에 대한 검색 결과가 없습니다.`
                  : "다른 카테고리를 선택해보세요."}
              </p>
            </div>
          )}
        </section>

        {/* --- CTA Section --- */}
        <section className="mt-24 mb-12 rounded-lg bg-primary/5 py-16 px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            강사로 활동하고 싶으신가요?
          </h2>
          <p className="text-muted-foreground mb-6 text-pretty max-w-2xl mx-auto">
            여러분의 재능을 나누고 수익을 창출하세요
          </p>
          <button
            onClick={() => (window.location.href = "/register")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            강사 등록하기
          </button>
        </section>
      </main>
    </div>
  );
}
