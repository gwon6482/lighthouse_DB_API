// 수집된 설문 통계치의 모델입니다.

const mongoose = require('mongoose');

const type2ScoreSchema = new mongoose.Schema({
  O: Number,
  X: Number
}, { _id: false });

const type5ScoreSchema = new mongoose.Schema({
  A: Number,
  B: Number,
  C: Number,
  D: Number,
  E: Number
}, { _id: false });

const questionStatSchema = new mongoose.Schema({
  mean: Number,
  stddev: Number,
  count: Number,
  type2_score: type2ScoreSchema,
  type5_score: type5ScoreSchema
}, { _id: false });

const surveyStatisticsSchema = new mongoose.Schema({
  generated_at: {
    type: Date,
    default: Date.now
  },
  total_surveys: Number,
  question_stats: {
    type: Object,
    default: {}
  },
  // 상위 그룹별 통계 (개별 질문 점수의 평균으로 누적된 Welford 통계)
  // T1 그룹: T1_E, T1_C, T1_S, T1_A, T1_I, T1_R, T1_G, T1_U, T1_T
  // T21 그룹: T21_L, T21_M, T21_A, T21_S, T21_I, T21_N, T21_T, T21_B
  // 각 항목: { count, mean, stddev, M2 }
  group_stats: {
    type: Object,
    default: {}
  },
  overall_stats: {
    completion_rate: Number,
    average_time: Number
  },
  last_survey_id: {
    type: String
  }
}, {
  timestamps: { createdAt: 'generated_at', updatedAt: false }
});

const surveyDataDb = mongoose.connection.useDb(process.env.SURVEY_DATA_DB || 'survey_data');
module.exports = surveyDataDb.model('SurveyStatistics', surveyStatisticsSchema, 'survey_statistics'); 