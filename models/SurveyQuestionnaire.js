// 사용자에게 전송된 설문지의 모델입니다.
const mongoose = require('mongoose');

const surveyQuestionnaireSchema = new mongoose.Schema({
  survey_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  client_info: {
    ip: String,
    user_agent: String,
    etc: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// survey_data DB 연결
const surveyDataDb = mongoose.connection.useDb(process.env.SURVEY_DATA_DB || 'survey_data');
module.exports = surveyDataDb.model('SurveyQuestionnaire', surveyQuestionnaireSchema, 'survey_questionnaire'); 