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
    price 
  } = classInfo;

  const navigate = () => {
    window.location.href = `/classes/${classId}`;
  };

  return (
    <Card
      onClick={navigate}
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          // 3. image -> representativeImageUrl로 변경
          src={representativeImageUrl || "/placeholder.svg"}
          // 4. title -> className으로 변경
          alt={className}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
          {/* 5. category -> categoryName으로 변경 */}
          {categoryName}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-balance">
          {/* 6. title -> className으로 변경 */}
          {className}
        </h3>
        {/* 7. teacher -> teacherName으로 변경 */}
        <p className="text-sm text-muted-foreground mb-3">{teacherName}</p>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {/* location은 키값이 같으므로 그대로 사용 */}
            <span>{location}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-2xl font-bold text-primary">
            {/* price는 키값이 같으므로 그대로 사용 */}
            {price.toLocaleString()}원
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}