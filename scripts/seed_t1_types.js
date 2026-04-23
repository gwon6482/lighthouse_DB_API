/**
 * reference_data.t1_types 컬렉션에 T1 성격 유형 135건을 시드합니다.
 * 실행: node scripts/seed_t1_types.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const t1TypesData = require(path.join(__dirname, '../docs/t1_types.json'));

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('MongoDB 연결 성공');

  const referenceDataDb = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
  const collection = referenceDataDb.collection('t1_types');

  const existing = await collection.countDocuments();
  if (existing > 0) {
    console.log(`기존 ${existing}건 삭제 후 재삽입합니다.`);
    await collection.deleteMany({});
  }

  const result = await collection.insertMany(t1TypesData);
  console.log(`T1 유형 ${result.insertedCount}건 삽입 완료`);

  await mongoose.disconnect();
  console.log('완료');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
