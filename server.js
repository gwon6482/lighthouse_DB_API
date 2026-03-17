const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');

// Swagger 설정
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// 라우터 가져오기
const adminRoutes = require('./routes/admin');
const surveyRoutes = require('./routes/survey');
const jobRoutes = require('./routes/job');

const app = express();

// MongoDB 연결
connectDB();

// 미들웨어
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Lighthouse DB API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true
  }
}));

// 라우터
app.use('/api/admin', adminRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/job', jobRoutes);

// 기본 라우트
/**
 * @swagger
 * /:
 *   get:
 *     summary: 서버 기본 정보
 *     description: Lighthouse DB API 서버의 기본 정보와 사용 가능한 엔드포인트를 반환합니다.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서버 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lighthouse DB API 서버에 오신 것을 환영합니다!"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 status:
 *                   type: string
 *                   example: "running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 endpoints:
 *                   type: object
 *                 collection_types:
 *                   type: array
 *                   items:
 *                     type: string
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Lighthouse DB API 서버에 오신 것을 환영합니다!',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      docs: '/api-docs',
      admin: {
        all_stats: '/api/admin/questions/stats',
        collection_questions: '/api/admin/questions/:collection_type',
        collection_stats: '/api/admin/questions/:collection_type/stats',
        question_by_id: '/api/admin/questions/:collection_type/:question_id'
      }
    },
    collection_types: ['T1_personality', 'T2_1_talent', 'T2_2_interest', 'T2_3_values', 'T3_environmental']
  });
});

// 헬스 체크 엔드포인트
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 서버 헬스 체크
 *     description: 서버의 현재 상태와 데이터베이스 연결 상태를 확인합니다.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 헬스 체크 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: 서버 실행 시간 (초)
 *                 memory:
 *                   type: object
 *                   description: 메모리 사용량 정보
 *                 database:
 *                   type: string
 *                   example: "connected"
 *                   description: 데이터베이스 연결 상태
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 서버 정보 엔드포인트
/**
 * @swagger
 * /api/info:
 *   get:
 *     summary: 서버 상세 정보
 *     description: 서버의 상세한 설정 정보를 반환합니다.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서버 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Lighthouse DB API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 port:
 *                   type: number
 *                   example: 3000
 *                 database:
 *                   type: object
 *                   properties:
 *                     job_data:
 *                       type: string
 *                     survey_questions:
 *                       type: string
 */
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Lighthouse DB API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    database: {
      job_data: process.env.JOB_DATA_DB || 'job_data',
      survey_questions: process.env.SURVEY_QUESTIONS_DB || 'survey_questions'
    }
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 리소스를 찾을 수 없습니다',
    path: req.originalUrl
  });
});

// 에러 핸들러
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 Lighthouse DB API 서버가 시작되었습니다!');
  console.log(`📍 서버 주소: http://localhost:${PORT}`);
  console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 시작 시간: ${new Date().toLocaleString('ko-KR')}`);
  console.log('📋 사용 가능한 엔드포인트:');
  console.log(`   - GET  / (기본 정보)`);
  console.log(`   - GET  /api/health (헬스 체크)`);
  console.log(`   - GET  /api/info (서버 정보)`);
  console.log(`   - GET  /api-docs (API 문서)`);
  console.log('🔧 관리자 API:');
  console.log(`   - GET    /api/admin/questions/stats (전체 통계)`);
  console.log(`   - GET    /api/admin/questions/:collection_type (컬렉션별 질문 목록)`);
  console.log(`   - GET    /api/admin/questions/:collection_type/stats (컬렉션별 통계)`);
  console.log(`   - GET    /api/admin/questions/:collection_type/:id (개별 질문)`);
  console.log(`   - POST   /api/admin/questions/:collection_type (질문 생성)`);
  console.log(`   - PUT    /api/admin/questions/:collection_type/:id (질문 수정)`);
  console.log(`   - DELETE /api/admin/questions/:collection_type/:id (질문 삭제)`);
  console.log(`   - PATCH  /api/admin/questions/:collection_type/:id/restore (질문 복구)`);
  console.log('📊 지원 컬렉션: T1_personality, T2_1_talent, T2_2_interest, T2_3_values, T3_environmental');
  console.log('');
}); 