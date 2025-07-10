# 우분투 22.04 LTS를 기반으로 사용
FROM ubuntu:22.04

# 환경 변수 설정
ENV NODE_VERSION=18.19.0
ENV NPM_VERSION=10.2.4
ENV PM2_VERSION=5.3.0

# 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Node.js 설치
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# npm 업데이트
RUN npm install -g npm@${NPM_VERSION}

# PM2 글로벌 설치
RUN npm install -g pm2@${PM2_VERSION}

# 작업 디렉토리 생성
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 애플리케이션 소스 코드 복사
COPY . .

# 로그 디렉토리 생성
RUN mkdir -p logs

# 포트 노출
EXPOSE 3000

# PM2 설정 파일 복사
COPY ecosystem.config.js ./

# PM2를 통한 애플리케이션 시작
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"] 