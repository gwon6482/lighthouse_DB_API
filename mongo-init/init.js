// MongoDB 초기화 스크립트
// 컨테이너 시작 시 자동으로 실행됩니다.

print('🚀 MongoDB 초기화 시작...');

// 데이터베이스 생성
db = db.getSiblingDB('job_data');
print('✅ job_data 데이터베이스 생성됨');

db = db.getSiblingDB('survey_questions');
print('✅ survey_questions 데이터베이스 생성됨');

db = db.getSiblingDB('survey_data');
print('✅ survey_data 데이터베이스 생성됨');

// 기본 컬렉션 생성 (인덱스 포함)
db = db.getSiblingDB('survey_questions');

// T1_personality 컬렉션 생성
db.createCollection('T1_personality');
db.T1_personality.createIndex({ "question_text": 1 });
db.T1_personality.createIndex({ "is_active": 1 });
print('✅ T1_personality 컬렉션 생성됨');

// T2_1_talent 컬렉션 생성
db.createCollection('T2_1_talent');
db.T2_1_talent.createIndex({ "question_text": 1 });
db.T2_1_talent.createIndex({ "is_active": 1 });
print('✅ T2_1_talent 컬렉션 생성됨');

// T2_2_interest 컬렉션 생성
db.createCollection('T2_2_interest');
db.T2_2_interest.createIndex({ "question_text": 1 });
db.T2_2_interest.createIndex({ "is_active": 1 });
print('✅ T2_2_interest 컬렉션 생성됨');

// T2_3_values 컬렉션 생성
db.createCollection('T2_3_values');
db.T2_3_values.createIndex({ "question_text": 1 });
db.T2_3_values.createIndex({ "is_active": 1 });
print('✅ T2_3_values 컬렉션 생성됨');

// T3_environmental 컬렉션 생성
db.createCollection('T3_environmental');
db.T3_environmental.createIndex({ "question_text": 1 });
db.T3_environmental.createIndex({ "is_active": 1 });
print('✅ T3_environmental 컬렉션 생성됨');

// survey_data 데이터베이스로 이동
db = db.getSiblingDB('survey_data');

// survey_results 컬렉션 생성
db.createCollection('survey_results');
db.survey_results.createIndex({ "survey_id": 1 });
db.survey_results.createIndex({ "completed_at": 1 });
print('✅ survey_results 컬렉션 생성됨');

// survey_statistics 컬렉션 생성
db.createCollection('survey_statistics');
db.survey_statistics.createIndex({ "collection_type": 1 });
print('✅ survey_statistics 컬렉션 생성됨');

print('�� MongoDB 초기화 완료!'); 