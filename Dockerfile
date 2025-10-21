# Build Stage
FROM node:23.9.0-alpine AS builder

WORKDIR /app

# 의존성 파일 복사 및 설치 (캐싱 최적화)
COPY package*.json ./
RUN npm ci --silent

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine

# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
