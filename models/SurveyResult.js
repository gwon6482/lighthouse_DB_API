// 사용자에게서 수신된 설문 결과지의 모델입니다.
const mongoose = require('mongoose');

const surveyResultSchema = new mongoose.Schema({
  survey_id: {
    type: String,
    required: true,
    index: true
  },
  respondent_id: {
    type: String
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  answers: {
    type: Object,
    required: true
  },
  converted_answers: {
    type: Object
  },
  raw_payload: {
    type: Object
  }
}, {
  timestamps: { createdAt: 'submitted_at', updatedAt: false }
});

const surveyDataDb = mongoose.connection.useDb(process.env.SURVEY_DATA_DB || 'survey_data');
module.exports = surveyDataDb.model('SurveyResult', surveyResultSchema, 'survey_results'); 