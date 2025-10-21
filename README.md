# oneday_fe

React 프론트엔드 프로젝트 - Docker & Nginx 기반 배포

---

## 📦 기술 스택

- **React** - UI 라이브러리
- **Vite** - 빌드 도구
- **React Router** - 클라이언트 사이드 라우팅
- **Axios** - HTTP 클라이언트
- **Docker** - 컨테이너화
- **Nginx** - 웹 서버

---

## 🚀 시작하기

### 1. 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 2. Docker로 실행하기

#### Docker Compose 사용 (권장)

```bash
# 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

#### Docker 단독 사용

```bash
# 이미지 빌드
docker build -t oneday-frontend .

# 컨테이너 실행
docker run -p 5173:80 oneday-frontend
```

#### 접속

- **프론트엔드**: http://localhost:5173

---

## 📁 프로젝트 구조

```
oneday_fe/
├── src/                  # 소스 코드
│   ├── assets/          # 정적 파일 (이미지, 아이콘 등)
│   ├── App.jsx          # 메인 앱 컴포넌트
│   └── main.jsx         # 엔트리 포인트
├── public/              # 공개 정적 파일
├── Dockerfile           # Docker 이미지 빌드 설정
├── docker-compose.yml   # Docker Compose 설정
├── nginx.conf           # Nginx 웹 서버 설정
└── .dockerignore        # Docker 빌드 제외 파일
```

---

## 🔧 주요 설정

### Docker Multi-stage Build

프로젝트는 **Multi-stage build**를 사용하여 최적화된 이미지를 생성합니다:

1. **빌드 스테이지**: Node.js 환경에서 React 앱 빌드
2. **실행 스테이지**: Nginx로 정적 파일 서빙

**이미지 크기**: 약 30-50MB (일반 빌드 대비 95% 감소)

### Nginx 설정

- ✅ **React Router SPA 지원** - 모든 라우트를 `index.html`로 폴백
- ✅ **Gzip 압축** - JS/CSS 파일 크기 감소
- ✅ **정적 파일 캐싱** - 브라우저 캐시 최적화 (1년)
- ✅ **보안 헤더** - XSS, 클릭재킹 방지

### API 연동 (준비됨)

백엔드 API 연동이 필요한 경우 `nginx.conf`의 주석을 해제하세요:

```nginx
location /api {
    proxy_pass http://host.docker.internal:8080;
    # ... 설정
}
```

---

## 🛠️ 개발 가이드

### 환경 변수

`.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:

```env
VITE_API_BASE_URL=/api
```

### 빌드 최적화

- **코드 스플리팅**: Vite가 자동으로 처리
- **이미지 최적화**: `public/` 폴더의 이미지는 빌드시 복사됨
- **CSS 최적화**: 사용하지 않는 CSS 자동 제거

---

## 📝 참고사항

### Node.js 버전

- **권장 버전**: 23.9.0
- **최소 버전**: 18.x

### 포트 변경

`docker-compose.yml`에서 포트를 변경할 수 있습니다:

```yaml
ports:
  - "원하는포트:80"  # 예: "3000:80"
```

### 백엔드 연동

백엔드 서버가 준비되면:

1. `nginx.conf`의 `/api` 프록시 설정 주석 해제
2. `proxy_pass` 주소를 백엔드 주소로 변경
3. 컨테이너 재시작: `docker-compose restart`

---

## 🐛 트러블슈팅

### React Router 404 에러

Nginx의 `try_files` 설정이 올바른지 확인하세요:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 백엔드 연결 실패

Docker 컨테이너 내부에서 호스트 머신 접근:

```nginx
# Mac/Windows
proxy_pass http://host.docker.internal:8080;

# Linux - docker-compose.yml에 추가 필요
# extra_hosts:
#   - "host.docker.internal:host-gateway"
```

### 빌드 에러

캐시 삭제 후 재빌드:

```bash
docker-compose down
docker system prune -a
docker-compose up --build
```