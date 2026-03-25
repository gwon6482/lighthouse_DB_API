/**
 * T2_2_interest 컬렉션에서 상위/하위 필드 정의를 추출하여
 * reference_data.survey_elements 에 시드합니다.
 * 실행: node scripts/seed_t22_elements.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const srcDb = mongoose.connection.useDb(process.env.SURVEY_QUESTIONS_DB || 'survey_questions');
  const docs = await srcDb.collection('T2_2_interest').find({}, {
    projection: {
      upper_field_code: 1,
      upper_field_name: 1,
      field_code: 1,
      field_name: 1,
      field_definition: 1
    }
  }).toArray();

  const upperMap = {};
  const subMap = {};
  docs.forEach(d => {
    upperMap[d.upper_field_code] = {
      test_code: 'T22',
      area: 'interest',
      level: 'upper',
      code: d.upper_field_code,
      name: d.upper_field_name,
      definition: null,
      parent_code: null
    };
    subMap[d.field_code] = {
      test_code: 'T22',
      area: 'interest',
      level: 'sub',
      code: d.field_code,
      name: d.field_name,
      definition: d.field_definition,
      parent_code: d.upper_field_code
    };
  });

  const elements = [...Object.values(upperMap), ...Object.values(subMap)];

  const refDb = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
  const col = refDb.collection('survey_elements');
  await col.deleteMany({ test_code: 'T22' });
  await col.insertMany(elements);

  console.log(`✅ T22 시드 완료: 상위 ${Object.keys(upperMap).length}개, 하위 ${Object.keys(subMap).length}개 (총 ${elements.length}건)`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ 시드 실패:', err.message);
  process.exit(1);
});
