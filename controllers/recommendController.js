const mongoose = require('mongoose');
const SurveyResult = require('../models/SurveyResult');
const { T1_PS_MAP, T21_AB_MAP, T21_A_MAP, T22_HOLLAND_MAP, T23_VA_MAP, T23_WEIGHTS } = require('../config/matchingMaps');

// ─── 시작 시 캐시 ────────────────────────────────────────────────────────────

let _t3PartsCache = null;  // { T3_PHY: { up: [...], down: [...] }, ... }

async function getT3Parts() {
  if (_t3PartsCache) return _t3PartsCache;
  const db = mongoose.connection.useDb('survey_questions');
  const docs = await db.collection('T3_environmental')
    .find({}, { projection: { part_code: 1, related_WE: 1, _id: 0 } })
    .toArray();
  _t3PartsCache = Object.fromEntries(docs.map(d => [d.part_code, d.related_WE]));
  return _t3PartsCache;
}

function getJobModel() {
  const jobDb = mongoose.connection.useDb(process.env.JOB_DATA_DB || 'job_data');
  if (jobDb.models['JobData']) return jobDb.models['JobData'];
  const schema = new mongoose.Schema({}, { strict: false });
  return jobDb.model('JobData', schema, 'job_info');
}

// ─── 헬퍼 ───────────────────────────────────────────────────────────────────

const ANSWER_SCORE = { A: 1.0, B: 0.75, C: 0.5, D: 0.25, E: 0.0 };

// details.중요도.직업간 배열 → { code: 0~1 } 맵
function buildScoreMap(items) {
  const map = {};
  for (const { code, score } of (items || [])) {
    map[code] = score / 100;
  }
  return map;
}

// A/B/C/D/E 개별 답변 → 그룹 평균 점수
// T1_E2 → group 'E', T21_M4 → group 'M'
function calcGroupScores(answers) {
  const groups = {};
  for (const [qId, ans] of Object.entries(answers || {})) {
    const g = qId.split('_')[1][0];
    if (!groups[g]) groups[g] = [];
    groups[g].push(ANSWER_SCORE[ans] ?? 0.5);
  }
  const result = {};
  for (const [g, scores] of Object.entries(groups)) {
    result[g] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  return result;
}

// 매핑 목록에 대해 직업 scoreMap으로 가중 평균 계산
// 음수 가중치(PS11, R그룹)는 역방향으로 처리: (1 - score) * |w|
function weightedJobScore(mappings, scoreMap) {
  let totalW = 0;
  let totalScore = 0;
  for (const { code, w } of mappings) {
    const absW = Math.abs(w);
    totalW += absW;
    const raw = scoreMap[code] ?? 0;
    totalScore += w < 0 ? (1 - raw) * absW : raw * absW;
  }
  return totalW > 0 ? totalScore / totalW : 0;
}

function round3(n) { return Math.round(n * 1000) / 1000; }

// ─── 파트별 매칭 함수 ────────────────────────────────────────────────────────

// T1 성격 매칭 (20%)
// 사용자 그룹 점수(0~1) vs 직업 PS 가중 점수(0~1) → 1 - |차이| 평균
function calcT1Match(userT1, jobPS) {
  if (!userT1 || Object.keys(userT1).length === 0) return 0.5;
  const groups = Object.keys(T1_PS_MAP);
  let sum = 0;
  for (const g of groups) {
    const u = userT1[g] ?? 0.5;
    const j = weightedJobScore(T1_PS_MAP[g], jobPS);
    sum += 1 - Math.abs(u - j);
  }
  return sum / groups.length;
}

// T21 재능 매칭 (25%)
// AB(업무수행능력)와 A(업무활동) 점수 50:50 결합
function calcT21Match(userT21, jobAB, jobA) {
  if (!userT21 || Object.keys(userT21).length === 0) return 0.5;
  const groups = Object.keys(T21_AB_MAP);
  let sum = 0;
  for (const g of groups) {
    const u = userT21[g] ?? 0.5;
    const jAB = weightedJobScore(T21_AB_MAP[g], jobAB);
    const jA = weightedJobScore(T21_A_MAP[g], jobA);
    const j = (jAB + jA) / 2;
    sum += 1 - Math.abs(u - j);
  }
  return sum / groups.length;
}

// T22 흥미 매칭 (25%)
// 체크 항목 → 대분류별 카운트 → Holland 점수 → 직업 Holland와 비교
function calcT22Match(userT22, jobHolland) {
  const checked = userT22?.checked || [];
  if (checked.length === 0) return 0.5;

  // 대분류별 체크 수 (T22_SOC_1 → SOC, SOC_1 → SOC 둘 다 처리)
  const catCounts = {};
  for (const itemId of checked) {
    const parts = itemId.split('_');
    const cat = parts[0] === 'T22' ? parts[1] : parts[0];
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  }

  // user Holland 점수: 카운트 × 가중치 합산 후 정규화
  const hollandTypes = ['R', 'I', 'A', 'S', 'E', 'C'];
  const userHolland = Object.fromEntries(hollandTypes.map(h => [h, 0]));

  for (const [cat, count] of Object.entries(catCounts)) {
    for (const { code, w } of (T22_HOLLAND_MAP[cat] || [])) {
      userHolland[code] += count * w;
    }
  }

  // 0~1 정규화: 최대값 = 전체 체크 수 × 최대 가중치(1.5)
  const maxPossible = checked.length * 1.5;
  for (const h of hollandTypes) {
    userHolland[h] = Math.min(1, userHolland[h] / maxPossible);
  }

  let sum = 0;
  for (const h of hollandTypes) {
    sum += 1 - Math.abs(userHolland[h] - (jobHolland[h] ?? 0));
  }
  return sum / hollandTypes.length;
}

// T23 가치관 매칭 (20%)
// 우선순위 3개만 활용, 각 VA 직업 점수에 가중치 적용
function calcT23Match(userT23, jobVA) {
  if (!userT23?.priority_1) return 0.5;

  let totalScore = 0;
  let totalWeight = 0;
  for (const [key, weight] of Object.entries(T23_WEIGHTS)) {
    const t23Key = userT23[key];
    if (!t23Key) continue;
    const vaCode = T23_VA_MAP[t23Key];
    if (!vaCode) continue;
    totalScore += (jobVA[vaCode] ?? 0) * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? totalScore / totalWeight : 0.5;
}

// T3 업무환경 매칭 (10%)
// 파트별로 직업 WE 가중 평균 → 직업 강도 레벨(0~1) 산출 → 사용자 레벨과 비교
function calcT3Match(userT3, jobWE, t3Parts) {
  if (!userT3 || Object.keys(userT3).length === 0) return 0.5;
  const partCodes = ['T3_PHY', 'T3_PEO', 'T3_COM', 'T3_RES', 'T3_STR', 'T3_FLX'];

  let sum = 0;
  let count = 0;
  for (const partCode of partCodes) {
    const userLevel = userT3[partCode];
    if (userLevel == null) continue;

    const partDef = t3Parts[partCode];
    if (!partDef) continue;

    const { up, down } = partDef;
    const upTotalW = up.reduce((s, x) => s + x.weight, 0);
    const downTotalW = down.reduce((s, x) => s + x.weight, 0);

    const upScore = upTotalW > 0
      ? up.reduce((s, x) => s + (jobWE[x.code] ?? 0) * x.weight, 0) / upTotalW
      : null;
    const downScore = downTotalW > 0
      ? down.reduce((s, x) => s + (jobWE[x.code] ?? 0) * x.weight, 0) / downTotalW
      : null;

    // 직업 파트 레벨 (0~1): up 높음 + down 낮음 → 높은 강도
    let jobLevel;
    if (upScore !== null && downScore !== null) {
      jobLevel = (upScore + (1 - downScore)) / 2;
    } else if (upScore !== null) {
      jobLevel = upScore;
    } else {
      jobLevel = 1 - downScore;
    }

    const userLevelNorm = (userLevel - 1) / 4;  // 1~5 → 0~1
    sum += 1 - Math.abs(userLevelNorm - jobLevel);
    count++;
  }
  return count > 0 ? sum / count : 0.5;
}

// ─── 종합 매칭 ───────────────────────────────────────────────────────────────

function calcTotalMatch(userSurvey, job, t3Parts) {
  const d = job.details || {};
  const jobPS      = buildScoreMap(d['성격']?.['중요도']?.['직업간']);
  const jobHolland = buildScoreMap(d['흥미']?.['중요도']?.['직업간']);
  const jobVA      = buildScoreMap(d['가치관']?.['중요도']?.['직업간']);
  const jobAB      = buildScoreMap(d['업무수행능력']?.['중요도']?.['직업간']);
  const jobA       = buildScoreMap(d['업무활동']?.['중요도']?.['직업간']);
  const jobWE      = buildScoreMap(d['업무환경']?.['중요도']?.['직업간']);

  const t1  = calcT1Match(userSurvey.T1,   jobPS);
  const t21 = calcT21Match(userSurvey.T21, jobAB, jobA);
  const t22 = calcT22Match(userSurvey.T22, jobHolland);
  const t23 = calcT23Match(userSurvey.T23, jobVA);
  const t3  = calcT3Match(userSurvey.T3,   jobWE, t3Parts);

  const total = t1 * 0.20 + t21 * 0.25 + t22 * 0.25 + t23 * 0.20 + t3 * 0.10;

  return {
    total: round3(total),
    detail: {
      T1:  round3(t1),
      T21: round3(t21),
      T22: round3(t22),
      T23: round3(t23),
      T3:  round3(t3),
    },
  };
}

// survey_result 도큐먼트 → 매칭용 userSurvey 변환
function buildUserSurvey(surveyResult) {
  return {
    // T1_result.group_scores 우선, 없으면 answers.T1 에서 계산
    T1:  surveyResult.T1_result?.group_scores ?? calcGroupScores(surveyResult.answers?.T1),
    T21: calcGroupScores(surveyResult.answers?.T21),
    T22: surveyResult.answers?.T22 ?? { checked: [] },
    T23: surveyResult.answers?.T23 ?? {},
    T3:  surveyResult.answers?.T3  ?? {},
  };
}

// 매칭 실행 (공통 로직)
async function runRecommend(userSurvey, { limit = 10, primary = null, minScore = 0 } = {}) {
  const [t3Parts, Job] = await Promise.all([getT3Parts(), Promise.resolve(getJobModel())]);

  const filter = {};
  if (primary) filter['classification.primary'] = primary;

  const jobs = await Job.find(filter, {
    jobCode: 1, title: 1, classification: 1, salary: 1, jobSatisfaction: 1,
    'details.성격.중요도.직업간':       1,
    'details.흥미.중요도.직업간':       1,
    'details.가치관.중요도.직업간':     1,
    'details.업무수행능력.중요도.직업간': 1,
    'details.업무활동.중요도.직업간':   1,
    'details.업무환경.중요도.직업간':   1,
    _id: 0,
  }).lean();

  const results = [];
  for (const job of jobs) {
    const { total, detail } = calcTotalMatch(userSurvey, job, t3Parts);
    if (total < minScore) continue;
    results.push({
      jobCode: job.jobCode,
      title: job.title,
      classification: job.classification,
      match_score: total,
      match_detail: detail,
      salary: job.salary ?? null,
      jobSatisfaction: job.jobSatisfaction ?? null,
    });
  }

  results.sort((a, b) => b.match_score - a.match_score);

  return {
    total_jobs: jobs.length,
    data: results.slice(0, Math.min(limit, 30)),
  };
}

// ─── API 핸들러 ──────────────────────────────────────────────────────────────

// GET /api/job/recommend/:survey_id
const getJobRecommendBySurveyId = async (req, res, next) => {
  try {
    const { survey_id } = req.params;
    const limit    = Math.min(parseInt(req.query.limit) || 10, 30);
    const primary  = req.query.primary || null;
    const minScore = parseFloat(req.query.min_score) || 0;

    const surveyResult = await SurveyResult.findOne({ survey_id }).lean();
    if (!surveyResult) {
      return res.status(404).json({
        success: false,
        error: `survey_id '${survey_id}'에 해당하는 검사 결과를 찾을 수 없습니다.`,
      });
    }

    const userSurvey = buildUserSurvey(surveyResult);
    const { total_jobs, data } = await runRecommend(userSurvey, { limit, primary, minScore });

    res.json({ success: true, survey_id, total_jobs, data });
  } catch (error) {
    next(error);
  }
};

// POST /api/job/recommend
// T1/T21은 그룹 점수(0~1)를 body에 직접 전달 (테스트/프리뷰용)
const postJobRecommend = async (req, res, next) => {
  try {
    const limit    = Math.min(parseInt(req.query.limit) || 10, 30);
    const primary  = req.query.primary || null;
    const minScore = parseFloat(req.query.min_score) || 0;

    const { T1, T21, T22, T23, T3 } = req.body || {};
    if (!T1 && !T21 && !T22 && !T23 && !T3) {
      return res.status(400).json({ success: false, error: '요청 body에 검사 결과가 없습니다.' });
    }

    const userSurvey = {
      T1:  T1  ?? {},
      T21: T21 ?? {},
      T22: T22 ?? { checked: [] },
      T23: T23 ?? {},
      T3:  T3  ?? {},
    };

    const { total_jobs, data } = await runRecommend(userSurvey, { limit, primary, minScore });

    res.json({ success: true, total_jobs, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobRecommendBySurveyId, postJobRecommend };
