const express = require('express');
const router = express.Router();
const { getJobByCode, searchJobByName, getJobList, createJob, updateJob, deleteJob, getClassifications, getMajors } = require('../controllers/jobController');
const { getJobRecommendBySurveyId, postJobRecommend } = require('../controllers/recommendController');

/**
 * @swagger
 * /api/job/{jobCode}:
 *   get:
 *     summary: 직업 정보 조회
 *     description: jobCode로 특정 직업의 상세 정보를 조회합니다.
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: jobCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 직업 코드
 *         example: "011102"
 *     responses:
 *       200:
 *         description: 직업 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobCode:
 *                       type: string
 *                     classification:
 *                       type: object
 *                       properties:
 *                         primary:
 *                           type: string
 *                         secondary:
 *                           type: string
 *                     title:
 *                       type: string
 *                     overview:
 *                       type: string
 *                     duties:
 *                       type: array
 *                       items:
 *                         type: string
 *                     details:
 *                       type: object
 *                     salary:
 *                       type: object
 *                       properties:
 *                         lower:
 *                           type: number
 *                           description: 하위(25%) 임금 (만원)
 *                         median:
 *                           type: number
 *                           description: 중위값 임금 (만원)
 *                         upper:
 *                           type: number
 *                           description: 상위(25%) 임금 (만원)
 *                     jobSatisfaction:
 *                       type: number
 *                       description: 직업만족도 (백점 기준, 예 80.3)
 *       404:
 *         description: 해당 jobCode의 직업을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/job/search:
 *   get:
 *     summary: 직업명으로 직업 코드 검색
 *     description: 직업명(일부 포함)으로 검색하여 jobCode 목록을 반환합니다.
 *     tags: [Job]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색할 직업명 (부분 일치)
 *         example: "공무원"
 *     responses:
 *       200:
 *         description: 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jobCode:
 *                         type: string
 *                       title:
 *                         type: string
 *                       classification:
 *                         type: object
 *       404:
 *         description: 검색 결과 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/job/list:
 *   get:
 *     summary: 전체 직업 목록 조회 (페이지네이션)
 *     description: 전체 직업 목록을 페이지네이션으로 조회합니다. 대분류/소분류/관련학과 필터를 지원합니다.
 *     tags: [Job]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: 페이지당 항목 수 (최대 100)
 *       - in: query
 *         name: primary
 *         schema:
 *           type: string
 *         description: 대분류 필터 (classification.primary 일치)
 *       - in: query
 *         name: secondary
 *         schema:
 *           type: string
 *         description: 소분류 필터 (classification.secondary 일치)
 *       - in: query
 *         name: major
 *         schema:
 *           type: string
 *         description: 관련학과 필터 (relatedMajors 배열에 포함)
 *     responses:
 *       200:
 *         description: 직업 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                   description: 전체 항목 수
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *                     items_per_page:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jobCode:
 *                         type: string
 *                       title:
 *                         type: string
 *                       classification:
 *                         type: object
 *                         properties:
 *                           primary:
 *                             type: string
 *                           secondary:
 *                             type: string
 *                       salary:
 *                         type: object
 *                         properties:
 *                           lower:
 *                             type: number
 *                           median:
 *                             type: number
 *                           upper:
 *                             type: number
 *                       jobSatisfaction:
 *                         type: number
 *                       relatedMajors:
 *                         type: array
 *                         items:
 *                           type: string
 *                       relatedCertifications:
 *                         type: array
 *                         items:
 *                           type: string
 */
/**
 * @swagger
 * /api/job/classifications:
 *   get:
 *     summary: 대분류/소분류 트리 조회
 *     description: 전체 직업의 대분류와 소분류 목록을 트리 형태로 반환합니다. 필터 드롭다운 구성에 사용합니다.
 *     tags: [Job]
 *     responses:
 *       200:
 *         description: 분류 트리 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: "{ 대분류명: [소분류명, ...] } 형태의 객체"
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: string
 */
/**
 * @swagger
 * /api/job/majors:
 *   get:
 *     summary: 관련학과 전체 목록 조회
 *     description: job_info 컬렉션의 relatedMajors 배열에서 고유한 학과명 전체를 정렬하여 반환합니다.
 *     tags: [Job]
 *     responses:
 *       200:
 *         description: 학과 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */
/**
 * @swagger
 * /api/job:
 *   post:
 *     summary: 직업 생성
 *     description: 새로운 직업 정보를 job_info 컬렉션에 추가합니다.
 *     tags: [Job]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobCode
 *               - title
 *             properties:
 *               jobCode:
 *                 type: string
 *                 description: 6자리 직업 코드
 *                 example: "999999"
 *               title:
 *                 type: string
 *               classification:
 *                 type: object
 *                 properties:
 *                   primary:
 *                     type: string
 *                   secondary:
 *                     type: string
 *               overview:
 *                 type: string
 *               salary:
 *                 type: object
 *               jobSatisfaction:
 *                 type: number
 *     responses:
 *       201:
 *         description: 직업 생성 성공
 *       400:
 *         description: jobCode 형식 오류
 *       409:
 *         description: jobCode 중복
 */
/**
 * @swagger
 * /api/job/{jobCode}:
 *   put:
 *     summary: 직업 정보 수정
 *     description: jobCode로 직업 정보를 수정합니다. jobCode 자체는 변경 불가합니다.
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: jobCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 수정할 직업 코드
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 수정할 필드만 포함 (jobCode 제외)
 *     responses:
 *       200:
 *         description: 수정 성공
 *       404:
 *         description: 해당 jobCode 없음
 *   delete:
 *     summary: 직업 삭제
 *     description: jobCode에 해당하는 직업을 삭제합니다.
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: jobCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 직업 코드
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 해당 jobCode 없음
 */
router.get('/list', getJobList);
router.get('/classifications', getClassifications);
router.get('/majors', getMajors);
router.get('/search', searchJobByName);
router.get('/recommend/:survey_id', getJobRecommendBySurveyId);
router.post('/recommend', postJobRecommend);
router.post('/', createJob);
router.get('/:jobCode', getJobByCode);
router.put('/:jobCode', updateJob);
router.delete('/:jobCode', deleteJob);

module.exports = router;
