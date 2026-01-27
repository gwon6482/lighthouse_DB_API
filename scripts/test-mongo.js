#!/usr/bin/env node

// 사용법:
// 1) .env에 MONGODB_URI 설정 후:   node scripts/test-mongo.js
// 2) 인자로 URI 전달:             node scripts/test-mongo.js "mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority&authSource=admin"

const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
  const uriFromArg = process.argv[2];
  const uri = uriFromArg || process.env.MONGODB_URI;

  if (!uri) {
    console.error('[에러] MongoDB URI가 없습니다. 인자로 전달하거나 .env의 MONGODB_URI를 설정하세요.');
    process.exit(1);
  }

  console.log('🔌 연결 시도 URI:', uri.replace(/:\w+@/, ':****@'));

  let client;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    await client.connect();

    // 핑 테스트
    const admin = client.db('admin');
    const ping = await admin.command({ ping: 1 });
    console.log('✅ ping 결과:', ping);

    // 서버 정보 일부 출력
    const buildInfo = await admin.command({ buildInfo: 1 });
    console.log('🧱 server version:', buildInfo.version);

    // 접근 가능한 데이터베이스 나열(권한에 따라 제한될 수 있음)
    try {
      const dbs = await admin.admin().listDatabases();
      console.log('📚 databases:', dbs.databases.map(d => d.name));
    } catch (e) {
      console.log('ℹ️ 데이터베이스 목록은 권한상 표시되지 않을 수 있습니다.');
    }

    console.log('🎉 MongoDB 접속 테스트 성공');
  } catch (err) {
    console.error('❌ 접속 실패:', err.message);
    process.exitCode = 1;
  } finally {
    if (client) await client.close().catch(() => {});
  }
})();


