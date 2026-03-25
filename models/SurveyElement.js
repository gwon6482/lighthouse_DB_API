const mongoose = require('mongoose');

const surveyElementSchema = new mongoose.Schema({
  test_code: {
    type: String,
    required: true,
    enum: ['T1', 'T21', 'T22', 'T23', 'T3'],
    index: true
  },
  area: {
    type: String,
    required: true,
    enum: ['personality', 'talent', 'interest', 'values', 'environmental'],
    index: true
  },
  level: {
    type: String,
    required: true,
    enum: ['upper', 'sub', 'item'],
    index: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  definition: {
    type: String,
    default: null
  },
  parent_code: {
    type: String,
    default: null,
    index: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const referenceDataDb = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
module.exports = referenceDataDb.model('SurveyElement', surveyElementSchema, 'survey_elements');
