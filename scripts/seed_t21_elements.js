/**
 * T2_1_talent 컬렉션에서 상위/하위 요소 정의를 추출하여
 * reference_data.survey_elements 에 시드합니다.
 * 실행: node scripts/seed_t21_elements.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  // 원본 데이터 읽기
  const srcDb = mongoose.connection.useDb(process.env.SURVEY_QUESTIONS_DB || 'survey_questions');
  const docs = await srcDb.collection('T2_1_talent').find({}, {
    projection: {
      upper_element_code: 1,
      upper_element_name: 1,
      upper_element_definition: 1,
      sub_element_code: 1,
      sub_element_name: 1,
      sub_element_definition: 1
    }
  }).toArray();

  // 중복 제거
  const upperMap = {};
  const subMap = {};
  docs.forEach(d => {
    upperMap[d.upper_element_code] = {
      test_code: 'T21',
      area: 'talent',
      level: 'upper',
      code: d.upper_element_code,
      name: d.upper_element_name,
      definition: d.upper_element_definition,
      parent_code: null
    };
    subMap[d.sub_element_code] = {
      test_code: 'T21',
      area: 'talent',
      level: 'sub',
      code: d.sub_element_code,
      name: d.sub_element_name,
      definition: d.sub_element_definition,
      parent_code: d.upper_element_code
    };
  });

  const elements = [...Object.values(upperMap), ...Object.values(subMap)];

  // 기존 T21 데이터 삭제 후 삽입
  const refDb = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
  const col = refDb.collection('survey_elements');
  await col.deleteMany({ test_code: 'T21' });
  await col.insertMany(elements);

  console.log(`✅ T21 시드 완료: 상위 ${Object.keys(upperMap).length}개, 하위 ${Object.keys(subMap).length}개 (총 ${elements.length}건)`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ 시드 실패:', err.message);
  process.exit(1);
});
