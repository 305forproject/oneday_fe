import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Users, Clock } from "lucide-react";

export function ClassCard({ classInfo }) {
  // 1. 들어오는 JSON 데이터의 키값에 맞춰 변수를 추출합니다.
  const {
    classId,
    representativeImageUrl,
    className,
    categoryName,
    teacherName,
    location,
    price,
  } = classInfo;

  const navigate = () => {
    window.location.href = `/classes/${classId}`;
  };

  return (
    <Card
      onClick={navigate}
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-border/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          // 3. image -> representativeImageUrl로 변경
          src={representativeImageUrl || "/placeholder.svg"}
          // 4. title -> className으로 변경
          alt={className}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <Badge className="absolute top-3 left-3 bg-black/60 text-white hover:bg-black/80 shadow-sm backdrop-blur-md border-0">
          {/* 5. category -> categoryName으로 변경 */}
          {categoryName}
        </Badge>
      </div>

      <CardContent className="p-5">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {/* 6. title -> className으로 변경 */}
          {className}
        </h3>
        {/* 7. teacher -> teacherName으로 변경 */}
        <p className="text-sm text-muted-foreground mb-4 font-medium">{teacherName}</p>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {/* location은 키값이 같으므로 그대로 사용 */}
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto">
        <div className="flex items-center justify-between w-full pt-4 border-t border-border/50">
          <span className="text-xl font-extrabold text-primary">
            {/* price는 키값이 같으므로 그대로 사용 */}
            {price.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-1">원</span>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
