const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 메인 MongoDB 연결
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB 연결 성공: ${conn.connection.host}`);
    
    // job_data 데이터베이스 연결 테스트
    const jobDataDb = mongoose.connection.useDb(process.env.JOB_DATA_DB || 'job_data');
    console.log(`✅ job_data 데이터베이스 연결 확인: ${process.env.JOB_DATA_DB || 'job_data'}`);
    
    // survey_questions 데이터베이스 연결 테스트
    const surveyQuestionsDb = mongoose.connection.useDb(process.env.SURVEY_QUESTIONS_DB || 'survey_questions');
    console.log(`✅ survey_questions 데이터베이스 연결 확인: ${process.env.SURVEY_QUESTIONS_DB || 'survey_questions'}`);
    
    // survey_data 데이터베이스 연결 테스트
    const surveyDataDb = mongoose.connection.useDb(process.env.SURVEY_DATA_DB || 'survey_data');
    console.log(`✅ survey_data 데이터베이스 연결 확인: ${process.env.SURVEY_DATA_DB || 'survey_data'}`);

    // reference_data 데이터베이스 연결 테스트
    const referenceDataDb = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
    console.log(`✅ reference_data 데이터베이스 연결 확인: ${process.env.REFERENCE_DATA_DB || 'reference_data'}`);
    
    // 데이터베이스 상태 확인
    const adminDb = mongoose.connection.db.admin();
    const dbList = await adminDb.listDatabases();
    const dbNames = dbList.databases.map(db => db.name);
    
    console.log('📊 사용 가능한 데이터베이스 목록:');
    dbNames.forEach(dbName => {
      console.log(`   - ${dbName}`);
    });
    
    // 특정 데이터베이스 존재 여부 확인
    if (dbNames.includes(process.env.JOB_DATA_DB || 'job_data')) {
      console.log(`✅ ${process.env.JOB_DATA_DB || 'job_data'} 데이터베이스가 존재합니다`);
    } else {
      console.log(`⚠️  ${process.env.JOB_DATA_DB || 'job_data'} 데이터베이스가 존재하지 않습니다`);
    }
    
    if (dbNames.includes(process.env.SURVEY_QUESTIONS_DB || 'survey_questions')) {
      console.log(`✅ ${process.env.SURVEY_QUESTIONS_DB || 'survey_questions'} 데이터베이스가 존재합니다`);
    } else {
      console.log(`⚠️  ${process.env.SURVEY_QUESTIONS_DB || 'survey_questions'} 데이터베이스가 존재하지 않습니다`);
    }
    
    if (dbNames.includes(process.env.SURVEY_DATA_DB || 'survey_data')) {
      console.log(`✅ ${process.env.SURVEY_DATA_DB || 'survey_data'} 데이터베이스가 존재합니다`);
    } else {
      console.log(`⚠️  ${process.env.SURVEY_DATA_DB || 'survey_data'} 데이터베이스가 존재하지 않습니다`);
    }
    
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 