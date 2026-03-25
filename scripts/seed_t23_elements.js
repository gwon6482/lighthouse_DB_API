/**
 * T2_3_values 컬렉션에서 가치관 항목을 추출하여
 * reference_data.survey_elements 에 시드합니다.
 * (단일 레벨 구조 - level: 'item')
 * 실행: node scripts/seed_t23_elements.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const srcDb = mongoose.connection.useDb(process.env.SURVEY_QUESTIONS_DB || 'survey_questions');
  const docs = await srcDb.collection('T2_3_values').find({}, {
    projection: {
      value_code: 1,
      value_name: 1,
      value_definition: 1
    }
  }).toArray();

  const elements = docs.map(d => ({
    test_code: 'T23',
    area: 'values',
    level: 'item',
    code: d.value_code,
    name: d.value_name,
    definition: d.value_definition,
    parent_code: null
  }));

  const refDb = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
  const col = refDb.collection('survey_elements');
  await col.deleteMany({ test_code: 'T23' });
  await col.insertMany(elements);

  console.log(`✅ T23 시드 완료: ${elements.length}건`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ 시드 실패:', err.message);
  process.exit(1);
});
