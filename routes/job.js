const express = require('express');
const router = express.Router();
const { getJobByCode, searchJobByName } = require('../controllers/jobController');

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
router.get('/search', searchJobByName);
router.get('/:jobCode', getJobByCode);

module.exports = router;
