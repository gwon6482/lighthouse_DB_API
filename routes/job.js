const express = require('express');
const router = express.Router();
const { getJobByCode } = require('../controllers/jobController');

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
 *       404:
 *         description: 해당 jobCode의 직업을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:jobCode', getJobByCode);

module.exports = router;
