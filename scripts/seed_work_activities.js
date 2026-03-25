/**
 * 업무활동 코드 데이터를 reference_data DB에 시드합니다.
 * 실행: node scripts/seed_work_activities.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const workActivities = require('../docs/work_activities.json');

const workActivitySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  activity: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
  const WorkActivity = db.model('WorkActivity', workActivitySchema, 'work_activities');

  await WorkActivity.deleteMany({});
  await WorkActivity.insertMany(workActivities);

  console.log(`✅ work_activities 시드 완료: ${workActivities.length}건`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ 시드 실패:', err.message);
  process.exit(1);
});
