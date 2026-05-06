const mongoose = require('mongoose');

const jobReviewSchema = new mongoose.Schema(
  {
    jobCode: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    satisfaction: { type: Number, required: true, min: 0, max: 100 },
    pros: { type: String, required: true },
    cons: { type: String, required: true },
    recommendation: { type: String, required: true },
    personalityTags: {
      type: [String],
      enum: ['E', 'C', 'S', 'A', 'I', 'R', 'G', 'U', 'T'],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    submittedBy: { type: String, enum: ['user', 'admin'], default: 'user' },
    submitterEmail: { type: String, default: '' },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

const jobDataDb = mongoose.connection.useDb(process.env.JOB_DATA_DB || 'job_data');
module.exports = jobDataDb.model('JobReview', jobReviewSchema, 'job_reviews');
