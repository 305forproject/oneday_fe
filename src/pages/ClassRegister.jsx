import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Calendar } from "../components/ui/calendar";

// 카테고리 ID → CategoryType Enum 매핑
const CATEGORY_ID_TO_TYPE = {
  1: "HEALTH_BEAUTY",
  2: "CRAFT_ART",
  3: "SPORTS_LEISURE",
  4: "COOKING_BAKING",
  5: "MUSIC_DANCE",
  6: "LANGUAGE_EDUCATION",
  7: "IT_TECHNOLOGY",
  8: "LIFESTYLE",
};
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Badge } from "../components/ui/badge";
import { Plus, X, Loader2, CalendarIcon, Upload, Star } from "lucide-react";
import { cn } from "../lib/utils";
import createClass from "../service/class/createClass";
import getCategories from "../service/class/getCategories";
import { resizeImage, getImageConfig } from "../utils/imageResizer";

export default function ClassRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resizingImages, setResizingImages] = useState(false);
  const [resizeProgress, setResizeProgress] = useState(0);

  // 카테고리 데이터 (DB에서 가져옴)
  const [categories, setCategories] = useState([]);

  // 컴포넌트 마운트 시 카테고리 로딩
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await getCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error("카테고리 로딩 실패:", error);
        alert("카테고리를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.");
      }
    };

    loadCategories();
  }, []);

  // 폼 데이터
  const [formData, setFormData] = useState({
    category: "",
    className: "",
    classDetail: "",
    curriculum: "",
    included: "",
    required: "",
    location: "",
    detailLocation: "",
    longitude: "",
    latitude: "",
    zipcode: "",
    maxCapacity: "",
    price: "",
  });

  // 일정 관련
  const [selectedDates, setSelectedDates] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  // 이미지 관련
  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // 카테고리 선택
  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  // 주소 검색 (Daum Postcode API)
  const searchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        // 우편번호와 주소 정보 설정
        const fullAddress =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

        setFormData((prev) => ({
          ...prev,
          zipcode: data.zonecode,
          location: fullAddress,
          // 경도/위도는 WAS에서 처리 예정이므로 빈 값으로 설정
          longitude: "",
          latitude: "",
        }));
      },
    }).open();
  };

  // 일정 추가
  const addTimeSlot = () => {
    if (selectedDates.length > 0 && startTime && endTime) {
      // dayjs 객체에서 HH:mm:00 형식으로 변환
      const startTimeStr = startTime.format("HH:mm:00");
      const endTimeStr = endTime.format("HH:mm:00");

      // 종료 시간이 시작 시간보다 이른지 확인
      if (startTimeStr >= endTimeStr) {
        alert("종료 시간은 시작 시간보다 늦어야 합니다");
        return;
      }

      // 새로 추가될 슬롯 생성
      const newSlots = selectedDates.map((date) => {
        // 로컬 시간대 기준으로 날짜 포맷팅 (YYYY-MM-DD)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return {
          date: `${year}-${month}-${day}`,
          startTime: startTimeStr,
          endTime: endTimeStr,
        };
      });

      // 중복 검증: 같은 날짜의 시간 중복 확인
      for (const newSlot of newSlots) {
        const isDuplicate = timeSlots.some((existingSlot) => {
          // 같은 날짜인지 확인
          if (existingSlot.date !== newSlot.date) {
            return false;
          }

          // 같은 날짜에서 시간이 중복되는지 확인
          // 1. 완전히 같은 시간
          if (
            existingSlot.startTime === newSlot.startTime &&
            existingSlot.endTime === newSlot.endTime
          ) {
            return true;
          }

          // 2. 시간대가 겹치는 경우
          // 새 시작시간이 기존 시간대 안에 있거나
          // 새 종료시간이 기존 시간대 안에 있거나
          // 새 시간대가 기존 시간대를 완전히 포함하는 경우
          const newStart = newSlot.startTime;
          const newEnd = newSlot.endTime;
          const existingStart = existingSlot.startTime;
          const existingEnd = existingSlot.endTime;

          if (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          ) {
            return true;
          }

          return false;
        });

        if (isDuplicate) {
          alert(
            `${newSlot.date} 날짜에 이미 등록된 시간과 중복됩니다.\n다른 시간을 선택해주세요.`
          );
          return;
        }
      }

      // 중복이 없으면 추가
      setTimeSlots([...timeSlots, ...newSlots]);
      setSelectedDates([]);
      setStartTime(null);
      setEndTime(null);
    } else {
      alert("날짜, 시작 시간, 종료 시간을 모두 입력해주세요");
    }
  };

  // 일정 삭제
  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  // 이미지 파일 선택 핸들러
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);

    // 최대 8개 제한
    if (images.length + files.length > 8) {
      alert("이미지는 최대 8개까지 등록 가능합니다");
      return;
    }

    // 파일 크기 및 형식 검증
    const validFiles = [];
    for (const file of files) {
      // 10MB 제한 (리사이징 전 원본 크기)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}은(는) 10MB를 초과합니다`);
        continue;
      }

      // 이미지 형식 확인
      if (!file.type.startsWith("image/")) {
        alert(`${file.name}은(는) 이미지 파일이 아닙니다`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    // 이미지 리사이징 처리
    setResizingImages(true);
    setResizeProgress(0);

    try {
      const resizedImages = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];

        // 개별 이미지 리사이징
        const resizedFile = await resizeImage(file, (progress) => {
          const totalProgress =
            ((i + progress / 100) / validFiles.length) * 100;
          setResizeProgress(Math.round(totalProgress));
        });

        // 미리보기 URL 생성
        resizedImages.push({
          file: resizedFile,
          preview: URL.createObjectURL(resizedFile),
          name: file.name,
        });
      }

      setImages((prev) => [...prev, ...resizedImages]);
    } catch (error) {
      console.error("Image processing error:", error);
      alert(error.message || "이미지 처리 중 오류가 발생했습니다");
    } finally {
      setResizingImages(false);
      setResizeProgress(0);
      e.target.value = "";
    }
  };

  // 이미지 개별 삭제
  const removeImage = (index) => {
    const imageToRemove = images[index];
    URL.revokeObjectURL(imageToRemove.preview); // 메모리 해제

    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    // 대표 이미지 인덱스 조정
    if (index === primaryImageIndex) {
      setPrimaryImageIndex(0); // 삭제된 이미지가 대표였으면 첫 번째로 변경
    } else if (index < primaryImageIndex) {
      setPrimaryImageIndex(primaryImageIndex - 1); // 앞쪽 이미지 삭제 시 인덱스 조정
    }
  };

  // 대표 이미지 설정
  const setPrimaryImage = (index) => {
    setPrimaryImageIndex(index);
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.category) {
      alert("카테고리를 선택해주세요");
      return;
    }
    if (!formData.className.trim()) {
      alert("클래스 제목을 입력해주세요");
      return;
    }
    if (!formData.location.trim()) {
      alert("장소를 입력해주세요");
      return;
    }
    if (!formData.maxCapacity || Number(formData.maxCapacity) < 1) {
      alert("최대 정원은 1명 이상이어야 합니다");
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      alert("가격을 입력해주세요");
      return;
    }
    if (timeSlots.length === 0) {
      alert("최소 1개 이상의 일정을 추가해주세요");
      return;
    }
    if (images.length === 0) {
      alert("최소 1개 이상의 이미지를 등록해주세요");
      return;
    }

    setLoading(true);

    try {
      // 날짜만 추출 (중복 제거)
      const uniqueDates = [...new Set(timeSlots.map((slot) => slot.date))];

      // 첫 번째 슬롯의 시간 사용 (모든 날짜에 동일한 시간 적용)
      const firstSlot = timeSlots[0];

      // 장소와 상세 주소 합치기
      const fullLocation = formData.detailLocation.trim()
        ? `${formData.location.trim()} ${formData.detailLocation.trim()}`
        : formData.location.trim();

      // API 요청 데이터 생성
      const requestData = {
        category: CATEGORY_ID_TO_TYPE[Number(formData.category)],
        className: formData.className.trim(),
        classDetail: formData.classDetail.trim() || null,
        curriculum: formData.curriculum.trim() || null,
        included: formData.included.trim() || null,
        required: formData.required.trim() || null,
        location: fullLocation,
        longitude: formData.longitude.trim() || null,
        latitude: formData.latitude.trim() || null,
        zipcode: formData.zipcode.trim() || null,
        maxCapacity: Number(formData.maxCapacity),
        price: Number(formData.price),
        dates: uniqueDates,
        startTime: firstSlot.startTime,
        endTime: firstSlot.endTime,
      };

      // 이미지 파일 배열 생성 (원본 순서 유지)
      const imageFiles = images.map((img) => img.file);

      // 대표 이미지 인덱스는 원본 순서 기준으로 전달
      const response = await createClass(
        requestData,
        imageFiles,
        primaryImageIndex
      );

      // 성공 시 클래스 상세 페이지로 이동
      navigate(`/classes/${response.classId}`);
    } catch (error) {
      alert(error.message || "클래스 등록에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 취소
  const handleCancel = () => {
    if (confirm("작성 중인 내용이 사라집니다. 취소하시겠습니까?")) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">클래스 등록</h1>
          <p className="text-muted-foreground">
            새로운 원데이 클래스를 등록하고 학생들과 만나보세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>
                클래스의 기본 정보를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="className">클래스 제목</Label>
                <Input
                  id="className"
                  placeholder="예: 초보자를 위한 베이킹 클래스"
                  value={formData.className}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                  disabled={categories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        categories.length === 0
                          ? "카테고리 로딩 중..."
                          : "카테고리 선택"
                      }
                    >
                      {formData.category
                        ? categories.find(
                            (cat) =>
                              String(cat.categoryId) === formData.category
                          )?.categoryName
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.categoryId}
                        value={String(cat.categoryId)}
                      >
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classDetail">클래스 소개</Label>
                <Textarea
                  id="classDetail"
                  placeholder="클래스에 대해 자세히 설명해주세요"
                  className="min-h-32"
                  value={formData.classDetail}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">최대 정원</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    placeholder="8"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">가격 (원)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="45000"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipcode">우편번호</Label>
                <div className="flex gap-2">
                  <Input
                    id="zipcode"
                    placeholder="우편번호"
                    value={formData.zipcode}
                    readOnly
                    className="flex-1 cursor-not-allowed bg-muted"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={searchAddress}
                    className="flex-shrink-0"
                  >
                    📍 주소 검색
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">기본 주소</Label>
                <Input
                  id="location"
                  placeholder="주소 검색 버튼을 클릭하세요"
                  value={formData.location}
                  readOnly
                  className="cursor-not-allowed bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="detailLocation">상세 주소</Label>
                <Input
                  id="detailLocation"
                  placeholder="상세 주소를 입력하세요 (예: 3층 301호)"
                  value={formData.detailLocation}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* 커리큘럼 */}
          <Card>
            <CardHeader>
              <CardTitle>커리큘럼</CardTitle>
              <CardDescription>
                클래스에서 진행할 내용을 단계별로 작성해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="curriculum">커리큘럼 (한 줄에 하나씩)</Label>
                <Textarea
                  id="curriculum"
                  placeholder="1. 재료 준비 및 계량하기&#10;2. 반죽 만들기&#10;3. 오븐에 굽기"
                  className="min-h-32"
                  value={formData.curriculum}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="included">포함 사항 (한 줄에 하나씩)</Label>
                <Textarea
                  id="included"
                  placeholder="재료비 포함&#10;앞치마 제공&#10;레시피 제공"
                  className="min-h-24"
                  value={formData.included}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="required">준비물 (한 줄에 하나씩)</Label>
                <Textarea
                  id="required"
                  placeholder="편한 복장&#10;긴 머리는 묶어주세요"
                  className="min-h-24"
                  value={formData.required}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* 일정 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>일정 설정</CardTitle>
              <CardDescription>
                클래스를 진행할 날짜와 시간을 추가해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label className="block mb-2">날짜 선택</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDates.length && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDates.length > 0
                          ? `${selectedDates.length}개 날짜 선택됨`
                          : "날짜를 선택하세요"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={(dates) => setSelectedDates(dates || [])}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date <= today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="block mb-2">시작 시간</Label>
                  <TimePicker
                    value={startTime}
                    onChange={(newValue) => setStartTime(newValue)}
                    timeSteps={{ minutes: 30 }}
                    format="HH:mm"
                    ampm={false}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        size: "small",
                      },
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="block mb-2">종료 시간</Label>
                  <TimePicker
                    value={endTime}
                    onChange={(newValue) => setEndTime(newValue)}
                    timeSteps={{ minutes: 30 }}
                    format="HH:mm"
                    ampm={false}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        size: "small",
                      },
                    }}
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={addTimeSlot}
              >
                <Plus className="h-4 w-4 mr-2" />
                일정 추가
              </Button>

              {timeSlots.length > 0 && (
                <div className="space-y-2">
                  <Label>추가된 일정</Label>
                  <div className="space-y-2">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{slot.date}</Badge>
                          <span className="text-sm">
                            {slot.startTime} ~ {slot.endTime}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 클래스 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle>클래스 이미지</CardTitle>
              <CardDescription>
                최대 8개의 이미지를 등록해주세요. 업로드 시 자동으로
                최적화됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 권장 사양 안내 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    📸 이미지 권장 사양
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• 비율: 4:3 (가로:세로)</li>
                    <li>• 권장 크기: 1200x900px</li>
                    <li>• 최소 크기: 800x600px</li>
                    <li>• 파일 형식: JPG, PNG, GIF, WEBP</li>
                    <li className="text-green-700 font-medium mt-2">
                      ✨ 업로드 시 자동으로 4:3 비율로 조정됩니다
                    </li>
                  </ul>
                </div>

                {/* 파일 선택 버튼 */}
                <div>
                  <Label
                    htmlFor="imageUpload"
                    className={
                      resizingImages ? "cursor-not-allowed" : "cursor-pointer"
                    }
                  >
                    <div
                      className={`border-2 border-dashed border-input rounded-lg p-6 text-center transition-colors ${
                        resizingImages
                          ? "bg-muted cursor-not-allowed"
                          : "hover:border-primary"
                      }`}
                    >
                      {resizingImages ? (
                        <>
                          <Loader2 className="mx-auto h-12 w-12 text-muted-foreground mb-2 animate-spin" />
                          <p className="text-sm font-medium mb-1">
                            이미지 처리 중... {resizeProgress}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            잠시만 기다려주세요
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium mb-1">
                            이미지 업로드
                          </p>
                          <p className="text-xs text-muted-foreground">
                            클릭하여 파일을 선택하거나 드래그하여 업로드
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, GIF, WEBP / 최대 8개
                          </p>
                        </>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={resizingImages}
                  />
                </div>

                {/* 이미지 미리보기 */}
                {images.length > 0 && (
                  <div>
                    <Label className="mb-2 block">
                      등록된 이미지 ({images.length}/8)
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className="relative group border rounded-lg overflow-hidden aspect-square"
                        >
                          <img
                            src={image.preview}
                            alt={`미리보기 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* 대표 이미지 표시 */}
                          {index === primaryImageIndex && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              대표
                            </div>
                          )}

                          {/* 호버 시 버튼 표시 */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {/* 대표 이미지 설정 버튼 */}
                            {index !== primaryImageIndex && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => setPrimaryImage(index)}
                                className="h-8 px-2"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}

                            {/* 삭제 버튼 */}
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(index)}
                              className="h-8 px-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleCancel}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                "클래스 등록하기"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
