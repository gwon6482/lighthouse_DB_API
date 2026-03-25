const mongoose = require('mongoose');

const careerAttributeSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['work_activity', 'ability', 'knowledge', 'work_environment', 'personality', 'interest', 'value'],
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
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const referenceDataDb = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
module.exports = referenceDataDb.model('CareerAttribute', careerAttributeSchema, 'career_attributes');
