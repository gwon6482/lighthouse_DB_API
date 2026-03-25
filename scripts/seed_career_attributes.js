/**
 * career_attributes 컬렉션에 모든 카테고리 데이터를 시드합니다.
 * 실행: node scripts/seed_career_attributes.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const CATEGORIES = [
  {
    category: 'work_activity',
    file: '../docs/work_activities.json',
    map: d => ({ category: 'work_activity', code: d.code, name: d.activity, definition: d.description })
  },
  {
    category: 'ability',
    file: '../docs/career_ability.json',
    map: d => ({ category: 'ability', code: d.code, name: d.name, definition: d.definition })
  },
  {
    category: 'knowledge',
    file: '../docs/career_knowledge.json',
    map: d => ({ category: 'knowledge', code: d.code, name: d.name, definition: d.definition })
  },
  {
    category: 'work_environment',
    file: '../docs/career_work_environment.json',
    map: d => ({ category: 'work_environment', code: d.code, name: d.name, definition: d.definition })
  },
  {
    category: 'personality',
    file: '../docs/career_personality.json',
    map: d => ({ category: 'personality', code: d.code, name: d.name, definition: d.definition })
  },
  {
    category: 'interest',
    file: '../docs/career_interest.json',
    map: d => ({ category: 'interest', code: d.code, name: d.name, definition: d.definition })
  },
  {
    category: 'value',
    file: '../docs/career_value.json',
    map: d => ({ category: 'value', code: d.code, name: d.name, definition: d.definition })
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
  const col = db.collection('career_attributes');

  for (const { category, file, map } of CATEGORIES) {
    const data = require(path.resolve(__dirname, file));
    const docs = data.map(map);

    await col.deleteMany({ category });
    await col.insertMany(docs);
    console.log(`✅ ${category}: ${docs.length}건`);
  }

  const total = await col.countDocuments();
  console.log(`\n총 ${total}건 완료`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ 시드 실패:', err.message);
  process.exit(1);
});
