// 설문지(프론트엔드용) API 컨트롤러 틀
// 추후 실제 로직 구현 예정

const mongoose = require('mongoose');
const { getQuestionModel } = require('./adminController');
const SurveyResult = require('../models/SurveyResult');
const SurveyQuestionnaire = require('../models/SurveyQuestionnaire');
const SurveyStatistics = require('../models/SurveyStatistics');

// 전체 설문지 조회 (GET)
const getSurveyForm = async (req, res) => {
  // 1. survey_id 자동생성 (SURVyyyyMMddD_HHmmssT)
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const survey_id = `SURV${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}D_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}T`;

  // 2. 클라이언트 정보 추출
  const client_info = {
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip,
    user_agent: req.headers['user-agent'] || '',
    etc: ''
  };

  // 3. 설문지 DB 저장
  try {
    await SurveyQuestionnaire.create({
      survey_id,
      client_info,
      created_at: now
    });
  } catch (e) {
    console.error('설문지 메타정보 저장 오류:', e);
    // 저장 실패해도 설문지는 제공
  }

  // 임시 고정값
  const twoValues = [4, 8];
  const fiveValues = [2, 4, 5, 8, 9];

  try {
    // 1. T1 (T1_personality)
    const T1Model = getQuestionModel('T1_personality');
    let t1Questions = await T1Model.find({}).sort({ question_id: 1 }).lean();
    // 시드 기반 셔플
    t1Questions = seededShuffle(t1Questions, survey_id);
    // 페이지 분할: 7,7,7,7,7,8
    const t1PageSizes = [7, 7, 7, 7, 7, 8];
    let t1Idx = 0;
    const t1Pages = t1PageSizes.map((size, i) => {
      const page = t1Questions.slice(t1Idx, t1Idx + size).map((q, idx) => ({
        question_num: (idx + 1).toString(),
        question_id: q.question_id,
        question_text: q.question_text
      }));
      t1Idx += size;
      return page;
    });
    const t1Part = { survey_part: 'T1' };
    t1Pages.forEach((page, i) => {
      t1Part[`page_T1_${i + 1}`] = page;
    });

    // 2. T21 (T2_1_talent)
    const T21Model = getQuestionModel('T2_1_talent');
    let t21Questions = await T21Model.find({}).sort({ question_id: 1 }).lean();
    // 시드 기반 셔플
    t21Questions = seededShuffle(t21Questions, survey_id);
    // 페이지 분할: 10,10,10,10,10,11
    const t21PageSizes = [10, 10, 10, 10, 10, 11];
    let t21Idx = 0;
    const t21Pages = t21PageSizes.map((size, i) => {
      const page = t21Questions.slice(t21Idx, t21Idx + size).map((q, idx) => ({
        question_num: (idx + 1).toString(),
        question_id: q.question_id,
        question_text: q.question_text
      }));
      t21Idx += size;
      return page;
    });
    const t21Part = { survey_part: 'T21' };
    t21Pages.forEach((page, i) => {
      t21Part[`page_T21_${i + 1}`] = page;
    });

    // 3. T22 (T2_2_interest)
    const T22Model = getQuestionModel('T2_2_interest');
    const t22Items = await T22Model.find({}).sort({ field_id: 1 }).lean();
    const t22Part = {
      survey_part: 'T22',
      items: t22Items.map(item => ({
        item_id: item.field_id,
        item_name: item.field_name,
        item_text: item.field_definition || ''
      }))
    };

    // 4. T23 (T2_3_values)
    const T23Model = getQuestionModel('T2_3_values');
    const t23Items = await T23Model.find({}).sort({ value_id: 1 }).lean();
    const t23Part = {
      survey_part: 'T23',
      items: t23Items.map(item => ({
        item_id: item.value_id,
        item_text: item.value_question,
        item_definition: item.value_definition || ''
      }))
    };

    // 5. T3 (T3_environmental)
    const T3Model = getQuestionModel('T3_environmental');
    const t3Items = await T3Model.find({}).sort({ item_id: 1 }).lean();
    const t3Part = {
      survey_part: 'T3',
      items: t3Items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_definition: item.item_definition || ''
      }))
    };

    // 최종 survey 배열
    const survey = [t1Part, t21Part, t22Part, t23Part, t3Part];

    res.json({
      survey_id,
      '2_values': twoValues,
      '5_values': fiveValues,
      survey
    });
  } catch (error) {
    console.error('설문지 반환 오류:', error);
    res.status(500).json({
      success: false,
      error: '설문지 반환 중 오류가 발생했습니다',
      message: error.message
    });
  }
};

// 설문 응답 제출 (POST)
const submitSurveyResponse = async (req, res) => {
  try {
    const data = req.body;
    if (!data.survey_id || !data.answers) {
      return res.status(400).json({ success: false, error: 'survey_id와 answers는 필수입니다.' });
    }

    // 1. 기존 통계치에서 환산값 받아오기
    let statistics = await SurveyStatistics.findOne({}).sort({ generated_at: -1 });
    if (!statistics) {
      // 통계치가 없으면 새로 생성
      statistics = {
        total_surveys: 0,
        question_stats: {},
        last_survey_id: null
      };
    }
    // [디버깅] 기존 통계치 출력
    // console.log('==== 기존 통계치(T23, T3) ====');
    // Object.entries(statistics.question_stats || {}).forEach(([k, v]) => {
    //   if (k.startsWith('T23_') || k.startsWith('T3_')) {
    //     console.log(k, v);
    //   }
    // });

    // 2. 환산 응답 생성 (공식 적용)
    const converted_answers = convertAnswers(data.answers, statistics, data.answer_type);
    // console.log('converted_answers:', converted_answers);

    // 3. 응답원본 + 환산응답 DB에 업로드
    const saved = await SurveyResult.create({
      survey_id: data.survey_id,
      respondent_id: data.respondent_id || null,
      answers: data.answers,
      converted_answers,
      raw_payload: data,
      submitted_at: new Date()
    });
    //console.log('save:', saved);


    // 4. 기존 통계치에 응답값을 반영해서 항목별 통계치를 업데이트 (평균, 표준편차 실제 갱신)
    const updatedStats = JSON.parse(JSON.stringify(statistics)); // deep copy
    delete updatedStats._id; // _id 중복 방지
    updatedStats.total_surveys = (updatedStats.total_surveys || 0) + 1;
    updatedStats.last_survey_id = data.survey_id;
    if (!updatedStats.question_stats) updatedStats.question_stats = {};
    // 누적 전, 기존 통계치에 M2가 없으면 계산해서 넣기
    for (const [qid, stat] of Object.entries(updatedStats.question_stats)) {
      if (stat.count > 1 && (stat.M2 === undefined || stat.M2 === null)) {
        stat.M2 = Math.pow(stat.stddev || 0, 2) * (stat.count - 1);
      }
    }
    // T1, T21: OX(2점 척도)
    for (const part of ['T1', 'T21']) {
      if (data.answers[part]) {
        for (const [qid, value] of Object.entries(data.answers[part])) {
          // updatedStats에 대해 처리
          if (!updatedStats.question_stats[qid]) {
            updatedStats.question_stats[qid] = { count: 0, mean: 0, stddev: 0, M2: 0 };
          }
          const stat = updatedStats.question_stats[qid];

          // OX 환산: O=1, X=0
          const score = value === 'O' ? 1 : 0;
          let prevCount = stat.count || 0;
          const prevMean = stat.mean || 0;
          const prevM2 = stat.M2 || 0;

          const newCount = prevCount + 1;
          const delta = score - prevMean;
          const newMean = prevMean + delta / newCount;
          const newM2 = prevM2 + delta * (score - newMean);
          const newStddev = newCount > 1 ? Math.sqrt(newM2 / (newCount - 1)) : 0;

          stat.count = newCount;
          stat.mean = newMean;
          stat.stddev = newStddev;
          stat.M2 = newM2;
        }
      }
    }
    // T22: checked 카운트 누적 및 채택률(adoption_rate) 계산
    if (data.answers.T22 && Array.isArray(data.answers.T22.checked)) {
      for (const itemId of data.answers.T22.checked) {
        if (!updatedStats.question_stats[itemId]) {
          updatedStats.question_stats[itemId] = { count: 0 };
        }
        updatedStats.question_stats[itemId].count = (updatedStats.question_stats[itemId].count || 0) + 1;
      }
    }
    // T22: 채택률(adoption_rate) 계산
    for (const [qid, stat] of Object.entries(updatedStats.question_stats)) {
      if (qid.startsWith('T22_') && stat.count !== undefined && updatedStats.total_surveys) {
        stat.adoption_rate = stat.count / updatedStats.total_surveys;
      }
    }
    // T23: priority별 카운트 누적 (배열/단일값 모두 지원, 구조 보장)
    if (data.answers.T23) {
      for (const p of ['priority_1', 'priority_2', 'priority_3']) {
        const items = data.answers.T23[p];
        if (Array.isArray(items)) {
          for (const itemId of items) {
            if (!updatedStats.question_stats[itemId]) {
              updatedStats.question_stats[itemId] = {};
            }
            updatedStats.question_stats[itemId][p] = (updatedStats.question_stats[itemId][p] || 0) + 1;
          }
        } else if (items) {
          // 단일 값일 경우도 처리
          const itemId = items;
          if (!updatedStats.question_stats[itemId]) {
            updatedStats.question_stats[itemId] = {};
          }
          updatedStats.question_stats[itemId][p] = (updatedStats.question_stats[itemId][p] || 0) + 1;
        }
      }
    }
    // T3: X/M/O 카운트 누적 (상위 그룹 키는 통계에서 제거)
    if (data.answers.T3) {
      for (const [itemId, value] of Object.entries(data.answers.T3)) {
        // 상위 그룹 키(T3_1, T3_2, T3_3 등)는 무시
        if (/^T3_\d+$/.test(itemId)) continue;
        if (["X","M","O"].includes(value)) {
          if (!updatedStats.question_stats[itemId]) {
            updatedStats.question_stats[itemId] = {};
          }
          updatedStats.question_stats[itemId][value] = (updatedStats.question_stats[itemId][value] || 0) + 1;
        }
      }
    }
    // 5점 척도(ABCDE) 통계 누적
    if (data.answer_type === 'type_5') {
      for (const part of ['T1', 'T21']) {
        if (data.answers[part]) {
          for (const [qid, value] of Object.entries(data.answers[part])) {
            // ABCDE → 1~5로 변환
            const scoreMap = { A: 1, B: 2, C: 3, D: 4, E: 5 };
            const score = scoreMap[value];
            if (score === undefined) continue;

            if (!updatedStats.question_stats[qid]) {
              updatedStats.question_stats[qid] = { count: 0, mean: 0, stddev: 0, M2: 0 };
            }
            const stat = updatedStats.question_stats[qid];

            let prevCount = stat.count || 0;
            const prevMean = stat.mean || 0;
            const prevM2 = stat.M2 || 0;

            const newCount = prevCount + 1;
            const delta = score - prevMean;
            const newMean = prevMean + delta / newCount;
            const newM2 = prevM2 + delta * (score - newMean);
            const newStddev = newCount > 1 ? Math.sqrt(newM2 / (newCount - 1)) : 0;

            stat.count = newCount;
            stat.mean = newMean;
            stat.stddev = newStddev;
            stat.M2 = newM2;
          }
        }
      }
    }
    // [디버깅] 갱신된 통계치 출력
    // console.log('==== 갱신된 통계치(T23, T3) ====');
    // Object.entries(updatedStats.question_stats || {}).forEach(([k, v]) => {
    //   if (k.startsWith('T23_') || k.startsWith('T3_')) {
    //     console.log(k, v);
    //   }
    // });
    // 빈 객체만 남은 question_stats 항목 삭제 (견고하게)
    const emptyKeys = Object.entries(updatedStats.question_stats)
      .filter(([_, stat]) => stat && typeof stat === 'object' && Object.keys(stat).length === 0)
      .map(([qid]) => qid);
    for (const qid of emptyKeys) {
      delete updatedStats.question_stats[qid];
    }
    // [디버깅] DB에 저장되는 T23, T3 파트 출력
    // console.log('==== DB 저장 직전(T23, T3) ====');
    // Object.entries(updatedStats.question_stats || {}).forEach(([k, v]) => {
    //   if (k.startsWith('T23_') || k.startsWith('T3_')) {
    //     console.log(k, v);
    //   }
    // });
    // 5. 최신통계치 DB에 업로드 (insert, 항상 새 도큐먼트)
    updatedStats.generated_at = new Date();
    await SurveyStatistics.create(updatedStats);

    res.status(201).json({ success: true, result: saved, converted_answers });
  } catch (error) {
    console.error('설문 응답 저장/통계 갱신 오류:', error);
    res.status(500).json({ success: false, error: '설문 응답 저장/통계 갱신 중 오류가 발생했습니다', message: error.message });
  }
};

// 설문 결과 조회 (GET)
const getSurveyResult = async (req, res) => {
  // TODO: 설문 결과 반환
  res.json({ message: '설문 결과 반환 (임시)' });
};

// 설문 분석 결과 조회 (GET)
const getSurveyAnalysis = async (req, res) => {
  // TODO: 설문 분석 결과 반환
  res.json({ message: '설문 분석 결과 반환 (임시)' });
};

// 통계치 갱신(누적) API 예시
// POST /api/survey/statistics/update
const updateSurveyStatistics = async (req, res) => {
  try {
    const { survey_id } = req.body;
    if (!survey_id) {
      return res.status(400).json({ success: false, error: 'survey_id는 필수입니다.' });
    }
    // 실제 통계 누적 로직은 생략, 예시로 last_survey_id만 반영
    const updated = await SurveyStatistics.findOneAndUpdate(
      {},
      { $set: { last_survey_id: survey_id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, statistics: updated });
  } catch (error) {
    console.error('통계치 갱신 오류:', error);
    res.status(500).json({ success: false, error: '통계치 갱신 중 오류가 발생했습니다', message: error.message });
  }
};

// 시드 기반 Fisher-Yates 셔플 함수
function seededShuffle(array, seed) {
  // 간단한 시드 기반 난수 생성기 (Mulberry32)
  function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
  const random = mulberry32(hashString(seed));
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// 문자열을 해시값(숫자)로 변환
function hashString(str) {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// 환산 로직 예시 (실제 변환 방식 구현)
function convertAnswers(answers, statistics, answer_type) {
  // Map 타입을 일반 객체로 변환
  const questionStats = (typeof statistics.question_stats?.entries === 'function')
    ? Object.fromEntries(statistics.question_stats.entries())
    : statistics.question_stats;

  const converted = {};
  //console.log('convertAnswers called with:', { answer_type, answers, stats: Object.keys(questionStats) });
  if (answer_type === 'type_2') {
    // OX(2점 척도) 환산
    for (const part of ['T1', 'T21']) {
      if (!answers[part]) continue;
      for (const [qid, value] of Object.entries(answers[part])) {
        const stat = questionStats[qid];
        if (stat && stat.mean !== undefined && stat.stddev !== undefined) {
          converted[qid] = stat.mean - stat.stddev;
        }
      }
    }
  } else if (answer_type === 'type_5') {
    // ABCDE(5점 척도) 환산
    for (const part of ['T1', 'T21']) {
      if (!answers[part]) continue;
      for (const [qid, value] of Object.entries(answers[part])) {
        const stat = questionStats[qid];
        if (stat && stat.mean !== undefined && stat.stddev !== undefined) {
          let score = null;
          if (value === 'A') score = stat.mean - 2 * stat.stddev;
          else if (value === 'B') score = stat.mean - stat.stddev;
          else if (value === 'C') score = stat.mean;
          else if (value === 'D') score = stat.mean + stat.stddev;
          else if (value === 'E') score = stat.mean + 2 * stat.stddev;
          converted[qid] = score;
        }
      }
    }
  }
  // type_10 등 기타 척도는 환산하지 않음
  return converted;
}

// 설문 결과 리스트 조회 (GET)
const getSurveyResultList = async (req, res) => {
  try {
    const results = await SurveyResult.find({})
      .sort({ submitted_at: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, results });
  } catch (error) {
    console.error('설문 결과 리스트 조회 오류:', error);
    res.status(500).json({ success: false, error: '설문 결과 리스트 조회 중 오류가 발생했습니다', message: error.message });
  }
};

// 통계치 조회 (GET)
const getSurveyStatistics = async (req, res) => {
  try {
    const statistics = await SurveyStatistics.findOne({}).sort({ generated_at: -1 });
    if (!statistics) {
      return res.status(404).json({ success: false, error: '통계치가 존재하지 않습니다.' });
    }
    res.json({ success: true, statistics });
  } catch (error) {
    console.error('통계치 조회 오류:', error);
    res.status(500).json({ success: false, error: '통계치 조회 중 오류가 발생했습니다', message: error.message });
  }
};

module.exports = {
  getSurveyForm,
  submitSurveyResponse,
  getSurveyResult,
  getSurveyAnalysis,
  updateSurveyStatistics,
  getSurveyStatistics,
  getSurveyResultList
};