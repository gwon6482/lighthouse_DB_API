# Lighthouse DB API

MongoDB와 소통하는 Express 기반 API 서버입니다.

## 기능

- 사용자 CRUD 작업 (생성, 조회, 수정, 삭제)
- MongoDB와 Mongoose를 사용한 데이터베이스 연동
- RESTful API 설계
- 에러 처리 및 검증
- 보안 미들웨어 (Helmet, CORS)
- PM2를 통한 프로세스 관리 및 클러스터 모드 지원
- Swagger를 통한 API 문서화
- Docker 컨테이너화 지원

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# MongoDB Atlas 연결 정보
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/?retryWrites=true&w=majority

# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스 이름
JOB_DATA_DB=job_data
SURVEY_QUESTIONS_DB=survey_questions
SURVEY_DATA_DB=survey_data
```

### 3. 서버 실행

#### 일반 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

#### PM2를 사용한 실행 (권장)
```bash
# 개발 환경에서 PM2 시작
npm run pm2:start

# 프로덕션 환경에서 PM2 시작
npm run pm2:start:prod

# PM2 프로세스 관리
npm run pm2:stop      # 서버 중지
npm run pm2:restart   # 서버 재시작
npm run pm2:delete    # 프로세스 삭제
npm run pm2:logs      # 로그 확인
npm run pm2:monit     # 모니터링 대시보드
```

## Docker 실행

### 개발 환경
```bash
# Docker Compose로 전체 스택 실행 (MongoDB + API + Mongo Express)
npm run docker:compose:up

# 로그 확인
npm run docker:compose:logs

# 서비스 중지
npm run docker:compose:down
```

### 프로덕션 환경
```bash
# 프로덕션용 Docker Compose 실행
npm run docker:compose:prod:up

# 프로덕션 서비스 중지
npm run docker:compose:prod:down
```

### 개별 Docker 명령어
```bash
# 이미지 빌드
npm run docker:build

# 컨테이너 실행
npm run docker:run
```

## API 문서

### Swagger UI
서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- **개발 환경**: http://localhost:3000/api-docs
- **프로덕션 환경**: https://api.lighthouse.com/api-docs

### API 문서 특징
- **실시간 문서**: 코드 변경 시 자동으로 문서 업데이트
- **인터랙티브 테스트**: 브라우저에서 직접 API 테스트 가능
- **스키마 정의**: 요청/응답 데이터 구조 명시
- **예제 제공**: 각 API의 사용 예제 포함

## PM2 설정

### 클러스터 모드
- CPU 코어 수만큼 인스턴스 자동 생성
- 로드 밸런싱 및 고가용성 보장
- 자동 재시작 및 헬스체크

### 로그 관리
- 로그 파일 위치: `./logs/`
- `combined.log`: 전체 로그
- `out.log`: 표준 출력
- `error.log`: 에러 로그

### 모니터링
- 메모리 사용량 모니터링
- 자동 재시작 (메모리 1GB 초과 시)
- 최대 재시작 횟수 제한 (10회)

## Docker 구성

### 컨테이너 구조
```
lighthouse-db-api/
├── lighthouse-api (Node.js + PM2)
├── mongo (MongoDB 6.0)
└── mongo-express (웹 기반 MongoDB 관리 도구)
```

### 포트 구성
- **3000**: Lighthouse API 서버
- **27017**: MongoDB 데이터베이스
- **8081**: MongoDB Express (개발 환경)

### 볼륨 마운트
- `./logs`: 애플리케이션 로그
- `./temp`: 임시 파일
- `mongodb_data`: MongoDB 데이터 영속성

## API 엔드포인트

### 기본 엔드포인트
- `GET /` - 서버 기본 정보
- `GET /api/health` - 헬스 체크
- `GET /api/info` - 서버 정보
- `GET /api-docs` - API 문서 (Swagger UI)

### 관리자 API
- `GET /api/admin/questions/stats` - 전체 통계
- `GET /api/admin/questions/:collection_type` - 컬렉션별 질문 목록
- `GET /api/admin/questions/:collection_type/stats` - 컬렉션별 통계
- `GET /api/admin/questions/:collection_type/:id` - 개별 질문 조회
- `POST /api/admin/questions/:collection_type` - 질문 생성
- `PUT /api/admin/questions/:collection_type/:id` - 질문 수정
- `DELETE /api/admin/questions/:collection_type/:id` - 질문 삭제
- `PATCH /api/admin/questions/:collection_type/:id/restore` - 질문 복구

### 설문 API
- `GET /api/survey/form` - 설문지 조회
- `POST /api/survey/response` - 설문 응답 제출
- `GET /api/survey/result/:survey_id` - 설문 결과 조회
- `GET /api/survey/analysis/:survey_id` - 설문 분석 결과
- `POST /api/survey/statistics/update` - 통계치 갱신
- `GET /api/survey/statistics` - 통계치 조회
- `GET /api/survey/result/list` - 설문 결과 리스트

### 지원 컬렉션
- T1_personality (성격)
- T2_1_talent (재능)
- T2_2_interest (관심사)
- T2_3_values (가치관)
- T3_environmental (환경)

## 프로젝트 구조

```
├── config/
│   ├── database.js          # MongoDB 연결 설정
│   └── swagger.js           # Swagger 설정
├── controllers/
│   ├── adminController.js   # 관리자 컨트롤러
│   └── surveyController.js  # 설문 컨트롤러
├── middleware/
│   └── error.js            # 에러 처리 미들웨어
├── models/
│   ├── Question.js         # 질문 모델
│   ├── SurveyQuestionnaire.js # 설문지 모델
│   ├── SurveyResult.js     # 설문 결과 모델
│   └── SurveyStatistics.js # 설문 통계 모델
├── routes/
│   ├── admin.js           # 관리자 라우트
│   └── survey.js          # 설문 라우트
├── logs/                  # PM2 로그 파일들
├── mongo-init/            # MongoDB 초기화 스크립트
├── ecosystem.config.js    # PM2 설정 파일
├── Dockerfile             # Docker 이미지 빌드 파일
├── docker-compose.yml     # 개발용 Docker Compose
├── docker-compose.prod.yml # 프로덕션용 Docker Compose
├── server.js             # 메인 서버 파일
├── package.json
└── README.md
```

## 기술 스택

- **Node.js** - 런타임 환경
- **Express.js** - 웹 프레임워크
- **MongoDB** - 데이터베이스
- **Mongoose** - MongoDB ODM
- **PM2** - 프로세스 매니저
- **Swagger** - API 문서화
- **Docker** - 컨테이너화
- **Helmet** - 보안 미들웨어
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP 요청 로깅

## PM2 모니터링

PM2 모니터링 대시보드를 통해 다음 정보를 확인할 수 있습니다:
- CPU 사용률
- 메모리 사용량
- 로그 실시간 확인
- 프로세스 상태
- 재시작 횟수

## API 테스트

### Swagger UI를 통한 테스트
1. 서버 실행 후 `http://localhost:3000/api-docs` 접속
2. 원하는 API 엔드포인트 선택
3. "Try it out" 버튼 클릭
4. 필요한 파라미터 입력
5. "Execute" 버튼으로 API 테스트

### curl을 통한 테스트
```bash
# 헬스 체크
curl http://localhost:3000/api/health

# 서버 정보
curl http://localhost:3000/api/info

# 전체 통계 조회
curl http://localhost:3000/api/admin/questions/stats
```

## 배포 가이드

### Docker 배포
```bash
# 1. 프로덕션 환경 변수 설정
cp .env.example .env.prod

# 2. 프로덕션용 Docker Compose 실행
docker-compose -f docker-compose.prod.yml up -d

# 3. 로그 확인
docker-compose -f docker-compose.prod.yml logs -f lighthouse-api
```

### 수동 배포
```bash
# 1. 서버에 코드 배포
git clone <repository-url>
cd lighthouse_DB_API

# 2. 의존성 설치
npm ci --only=production

# 3. 환경 변수 설정
cp .env.example .env

# 4. PM2로 실행
npm run pm2:start:prod
```
