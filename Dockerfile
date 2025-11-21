# [수정] builder 이미지를 alpine -> slim으로 변경 (호환성 해결)
FROM node:20-slim AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package.json ./

# [수정] npm ci 대신 npm install 사용 (플랫폼 호환성 문제 방지)
RUN npm install

# 소스 코드 복사
COPY . .

ARG VITE_TOSS_CLIENT_KEY
ARG VITE_KAKAO_JAVASCRIPT_KEY
ARG VITE_GG_API_KEY

# 받은 값을 리액트 빌드 과정에서 쓸 수 있게 환경변수로 등록
ENV VITE_TOSS_CLIENT_KEY=$VITE_TOSS_CLIENT_KEY
ENV VITE_KAKAO_JAVASCRIPT_KEY=$VITE_KAKAO_JAVASCRIPT_KEY
ENV VITE_GG_API_KEY=$VITE_GG_API_KEY

# 빌드 실행
RUN npm run build

# -------------------------------------------------------
# Production Stage (여기는 Nginx만 쓰므로 Alpine 써도 됨)
FROM nginx:alpine

# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]