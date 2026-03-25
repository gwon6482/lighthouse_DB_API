/**
 * T3_environmental 컬렉션에서 카테고리/하위카테고리/항목을 추출하여
 * reference_data.survey_elements 에 시드합니다.
 * (3단계 구조: upper → sub → item)
 * 실행: node scripts/seed_t3_elements.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const srcDb = mongoose.connection.useDb(process.env.SURVEY_QUESTIONS_DB || 'survey_questions');
  const docs = await srcDb.collection('T3_environmental').find({}, {
    projection: {
      category_code: 1,
      category_name: 1,
      sub_category_code: 1,
      sub_category_name: 1,
      item_code: 1,
      item_name: 1,
      item_definition: 1
    }
  }).toArray();

  const upperMap = {};
  const subMap = {};
  const itemMap = {};

  docs.forEach(d => {
    upperMap[d.category_code] = {
      test_code: 'T3',
      area: 'environmental',
      level: 'upper',
      code: d.category_code,
      name: d.category_name,
      definition: null,
      parent_code: null
    };
    subMap[d.sub_category_code] = {
      test_code: 'T3',
      area: 'environmental',
      level: 'sub',
      code: d.sub_category_code,
      name: d.sub_category_name,
      definition: null,
      parent_code: d.category_code
    };
    itemMap[d.item_code] = {
      test_code: 'T3',
      area: 'environmental',
      level: 'item',
      code: d.item_code,
      name: d.item_name,
      definition: d.item_definition,
      parent_code: d.sub_category_code
    };
  });

  const elements = [
    ...Object.values(upperMap),
    ...Object.values(subMap),
    ...Object.values(itemMap)
  ];

  const refDb = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
  const col = refDb.collection('survey_elements');
  await col.deleteMany({ test_code: 'T3' });
  await col.insertMany(elements);

  console.log(`✅ T3 시드 완료: 카테고리 ${Object.keys(upperMap).length}개, 하위카테고리 ${Object.keys(subMap).length}개, 항목 ${Object.keys(itemMap).length}개 (총 ${elements.length}건)`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ 시드 실패:', err.message);
  process.exit(1);
});
