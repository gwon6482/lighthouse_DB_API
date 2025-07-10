const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  collection_type: {
    type: String,
    required: true,
    enum: ['T1_personality', 'T2_1_talent', 'T2_2_interest', 'T2_3_values', 'T3_environmental'],
    index: true
  },
  upper_element: {
    type: String,
    required: true
  },
  lower_element: {
    type: String,
    required: true
  },
  question_text: {
    type: String,
    required: true
  },
  question_type: {
    type: String,
    default: 'multiple_choice'
  },
  options: [{
    value: String,
    text: String
  }],
  weight: {
    type: Number,
    default: 1
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// 인덱스 설정
questionSchema.index({ collection_type: 1, upper_element: 1 });
questionSchema.index({ collection_type: 1, lower_element: 1 });
questionSchema.index({ is_active: 1 });

// 가상 필드: 전체 질문 정보
questionSchema.virtual('full_question_info').get(function() {
  return {
    question_id: this.question_id,
    collection_type: this.collection_type,
    upper_element: this.upper_element,
    lower_element: this.lower_element,
    question_text: this.question_text,
    question_type: this.question_type,
    options: this.options,
    weight: this.weight,
    is_active: this.is_active
  };
});

// JSON 변환 시 가상 필드 포함
questionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Question', questionSchema); 