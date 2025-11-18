import { Loader2, Heart, MapPin, Star} from 'lucide-react';

/**
 * Class Card Component
 * 개별 클래스 정보를 표시하는 카드 컴포넌트입니다.
 */
export default function ClassCard({ classInfo }) {
  // DTO 필드명에 맞게 props 비구조화
  const {
    representativeImageUrl,
    categoryName,
    className,
    teacherName,
    location,
    price,
  } = classInfo;

  // 가격을 콤마가 있는 형식으로 변환
  const formattedPrice = price.toLocaleString("ko-KR");

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl bg-card border border-border">
      {/* 이미지 영역 */}
      <div className="relative overflow-hidden">
        <img
          src={representativeImageUrl}
          alt={className}
          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/600x400/cccccc/333333?text=Image+Error";
          }}
        />
        <button className="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-2 text-destructive backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500">
          <Heart size={20} />
        </button>
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold text-primary">
          {categoryName}
        </span>
        <h3 className="mt-1 font-bold text-base text-card-foreground group-hover:text-primary transition-colors">
          {className}
        </h3>

        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <User size={12} className="mr-1.5 flex-shrink-0" />
          <span>{teacherName}</span>
        </div>

        <div className="mt-1 flex items-center text-xs text-muted-foreground">
          <MapPin size={12} className="mr-1.5 flex-shrink-0" />
          <span>{location}</span>
        </div>

        <div className="mt-auto pt-4">
          <span className="text-lg font-extrabold text-card-foreground">
            {formattedPrice}원
          </span>
        </div>
      </div>
    </div>
  );
}
