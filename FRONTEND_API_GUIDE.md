# Lighthouse DB API - Frontend 개발 가이드

## 프로젝트 개요

Lighthouse DB API는 **심리특성, 재능, 관심사, 가치관, 환경요인** 등 다차원 설문조사 시스템을 제공하는 REST API입니다.

### 기술 스택
- Backend: Node.js + Express.js
- Database: MongoDB 6.0
- 배포: Docker + PM2 클러스터 모드
- 문서화: Swagger UI

---

## 빠른 시작

### 1. API 서버 실행 (Docker)

```bash
git clone https://github.com/gwon6482/lighthouse_DB_API.git
cd lighthouse_DB_API
docker compose up -d --build
```

### 2. 접속 URL
- **API Base URL**: `http://localhost:3000`
- **Swagger 문서**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/api/health`

---

## 핵심 API 엔드포인트

### 1. 설문지 조회 (GET)

**엔드포인트**: `GET /api/survey/form`

설문지를 생성하고 질문 리스트를 반환합니다. `survey_id`는 자동 생성됩니다.

**요청 예시**:
```bash
curl http://localhost:3000/api/survey/form
```

**응답 구조**:
```json
{
  "success": true,
  "survey_id": "SURV20260123D_041741T",
  "data": {
    "client_info": {
      "ip": "::1",
      "user_agent": "Mozilla/5.0...",
      "timestamp": "2026-01-23T04:17:41.123Z"
    },
    "questions": [
      {
        "page": 1,
        "questions": [
          {
            "question_id": "T1_001",
            "question_text": "나는 새로운 사람들과 쉽게 친해진다",
            "question_type": "type_2",
            "options": ["O", "X"],
            "collection_type": "T1_personality",
            "upper_element": "외향성",
            "lower_element": "사교성"
          }
          // ... 더 많은 질문들
        ]
      }
      // ... 더 많은 페이지들
    ],
    "metadata": {
      "total_pages": 12,
      "total_questions": 199,
      "collection_breakdown": {
        "T1_personality": { "total": 43, "pages": 6 },
        "T2_1_talent": { "total": 61, "pages": 6 },
        "T2_2_interest": { "total": 33, "pages": 1 },
        "T2_3_values": { "total": 13, "pages": 1 },
        "T3_environmental": { "total": 49, "pages": 1 }
      }
    }
  }
}
```

**주요 필드 설명**:
- `survey_id`: 고유한 설문지 ID (응답 제출 시 필요)
- `questions`: 페이지별로 그룹화된 질문 배열
- `question_type`:
  - `type_2`: O/X 양자택일 (2점 척도)
  - `type_5`: A/B/C/D/E 5점 척도
  - `multiple_choice`: 다중 선택
  - `priority_choice`: 우선순위 선택 (1순위, 2순위, 3순위)
- `collection_type`: 질문 유형
  - `T1_personality`: 성격 특성
  - `T2_1_talent`: 재능
  - `T2_2_interest`: 관심사
  - `T2_3_values`: 가치관
  - `T3_environmental`: 환경 요인

---

### 2. 설문 응답 제출 (POST)

**엔드포인트**: `POST /api/survey/response`

사용자의 설문 응답을 제출하고 통계를 자동 업데이트합니다.

**요청 본문**:
```json
{
  "survey_id": "SURV20260123D_041741T",
  "respondent_id": "user_12345",
  "answers": {
    "T1_001": "O",
    "T1_002": "X",
    "T21_001": "A",
    "T21_002": "E",
    "T22_001": ["field_001", "field_003"],
    "T23_001": {
      "priority_1": "value_001",
      "priority_2": "value_005",
      "priority_3": "value_003"
    },
    "T3_001": "M"
  }
}
```

**응답 타입별 형식**:

| 타입 | 응답 형식 | 예시 |
|------|----------|------|
| **type_2** (OX) | `"O"` 또는 `"X"` | `"T1_001": "O"` |
| **type_5** (5점) | `"A"`, `"B"`, `"C"`, `"D"`, `"E"` | `"T21_001": "C"` |
| **multiple_choice** (다중) | 배열 `["id1", "id2"]` | `"T22_001": ["field_001", "field_003"]` |
| **priority_choice** (순위) | 객체 `{"priority_1": "id1", ...}` | `{"priority_1": "value_001", "priority_2": "value_002", "priority_3": "value_003"}` |
| **type_3** (XMO) | `"X"`, `"M"`, `"O"` | `"T3_001": "M"` |

**응답 예시**:
```json
{
  "success": true,
  "message": "설문 응답이 성공적으로 저장되었습니다.",
  "data": {
    "survey_id": "SURV20260123D_041741T",
    "respondent_id": "user_12345",
    "submitted_at": "2026-01-23T04:20:15.456Z"
  }
}
```

**주의사항**:
- `survey_id`는 `/api/survey/form`에서 받은 값을 그대로 사용
- `respondent_id`는 사용자 고유 식별자 (로그인 ID, 세션 ID 등)
- 모든 질문에 대한 응답을 포함해야 함
- 응답 제출 시 자동으로 통계가 업데이트됨

---

### 3. 통계 조회 (GET)

**엔드포인트**: `GET /api/survey/statistics`

전체 설문 통계를 조회합니다.

**요청 예시**:
```bash
curl http://localhost:3000/api/survey/statistics
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "generated_at": "2026-01-23T04:25:00.000Z",
    "total_surveys": 39,
    "question_stats": {
      "T1_001": {
        "mean": 0.72,
        "stddev": 0.45,
        "count": 39,
        "adoption_rate": null
      },
      "T22_001": {
        "mean": null,
        "stddev": null,
        "count": 39,
        "adoption_rate": 0.85
      }
    },
    "overall_stats": {
      "average_completion_rate": 0.95,
      "total_responses": 7761
    }
  }
}
```

**필드 설명**:
- `mean`: 평균값 (type_2, type_5용)
- `stddev`: 표준편차
- `adoption_rate`: 채택률 (T2_2_interest 다중선택용)
- `count`: 응답 수

---

### 4. 응답 리스트 조회 (GET)

**엔드포인트**: `GET /api/survey/result/list`

제출된 설문 응답 목록을 조회합니다.

**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `user_id`: 특정 사용자 응답만 조회

**요청 예시**:
```bash
# 전체 응답 조회
curl "http://localhost:3000/api/survey/result/list?page=1&limit=10"

# 특정 사용자 응답 조회
curl "http://localhost:3000/api/survey/result/list?user_id=user_12345"
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "survey_id": "SURV20260123D_041741T",
        "respondent_id": "user_12345",
        "submitted_at": "2026-01-23T04:20:15.456Z",
        "answers": { "T1_001": "O", "T1_002": "X" },
        "converted_answers": { "T1_001": 0.75, "T1_002": 0.25 }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 4,
      "total_results": 39,
      "results_per_page": 10
    }
  }
}
```

---

## 관리자 API (선택사항)

관리자 API는 질문을 CRUD하는 엔드포인트입니다. 프론트엔드에서 관리자 기능을 구현할 경우 사용합니다.

### 질문 목록 조회

**엔드포인트**: `GET /api/admin/questions/:collection_type`

**컬렉션 타입**:
- `T1_personality`
- `T2_1_talent`
- `T2_2_interest`
- `T2_3_values`
- `T3_environmental`

**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `search`: 검색어 (질문 텍스트, ID 등)

**요청 예시**:
```bash
curl "http://localhost:3000/api/admin/questions/T1_personality?page=1&limit=10"
```

### 통계 조회

**엔드포인트**: `GET /api/admin/questions/stats`

전체 질문 통계를 조회합니다.

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "by_collection": [
      {
        "collection_type": "T1_personality",
        "total_questions": 43
      },
      {
        "collection_type": "T2_1_talent",
        "total_questions": 61
      }
    ],
    "total": {
      "total_questions": 199
    }
  }
}
```

---

## Frontend 구현 가이드

### 1. 설문지 페이지 구현

```javascript
// 설문지 조회
async function fetchSurvey() {
  const response = await fetch('http://localhost:3000/api/survey/form');
  const data = await response.json();

  // survey_id 저장 (응답 제출 시 필요)
  const surveyId = data.survey_id;
  localStorage.setItem('current_survey_id', surveyId);

  // 질문 렌더링
  const questions = data.data.questions;
  renderQuestions(questions);
}

// 질문 렌더링 예시
function renderQuestions(questions) {
  questions.forEach(page => {
    page.questions.forEach(q => {
      switch(q.question_type) {
        case 'type_2':
          renderOXQuestion(q);
          break;
        case 'type_5':
          renderFivePointQuestion(q);
          break;
        case 'multiple_choice':
          renderMultipleChoice(q);
          break;
        case 'priority_choice':
          renderPriorityChoice(q);
          break;
      }
    });
  });
}
```

### 2. 응답 제출 구현

```javascript
// 응답 수집
function collectAnswers() {
  const answers = {};

  // OX 질문
  document.querySelectorAll('.question-type-2').forEach(el => {
    const questionId = el.dataset.questionId;
    const selected = el.querySelector('input[type="radio"]:checked');
    if (selected) {
      answers[questionId] = selected.value; // "O" or "X"
    }
  });

  // 5점 척도 질문
  document.querySelectorAll('.question-type-5').forEach(el => {
    const questionId = el.dataset.questionId;
    const selected = el.querySelector('input[type="radio"]:checked');
    if (selected) {
      answers[questionId] = selected.value; // "A", "B", "C", "D", "E"
    }
  });

  // 다중선택 질문
  document.querySelectorAll('.question-multiple').forEach(el => {
    const questionId = el.dataset.questionId;
    const checked = el.querySelectorAll('input[type="checkbox"]:checked');
    answers[questionId] = Array.from(checked).map(cb => cb.value);
  });

  // 우선순위 질문
  document.querySelectorAll('.question-priority').forEach(el => {
    const questionId = el.dataset.questionId;
    answers[questionId] = {
      priority_1: el.querySelector('[name="priority_1"]').value,
      priority_2: el.querySelector('[name="priority_2"]').value,
      priority_3: el.querySelector('[name="priority_3"]').value
    };
  });

  return answers;
}

// 응답 제출
async function submitSurvey() {
  const surveyId = localStorage.getItem('current_survey_id');
  const respondentId = getUserId(); // 사용자 ID 가져오기
  const answers = collectAnswers();

  const response = await fetch('http://localhost:3000/api/survey/response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      survey_id: surveyId,
      respondent_id: respondentId,
      answers: answers
    })
  });

  const result = await response.json();

  if (result.success) {
    alert('설문이 제출되었습니다!');
    // 결과 페이지로 이동
    window.location.href = '/result';
  } else {
    alert('제출 실패: ' + result.message);
  }
}
```

### 3. 통계 페이지 구현

```javascript
// 통계 조회
async function fetchStatistics() {
  const response = await fetch('http://localhost:3000/api/survey/statistics');
  const data = await response.json();

  const stats = data.data;

  // 전체 응답 수 표시
  document.getElementById('total-surveys').textContent = stats.total_surveys;

  // 질문별 통계 시각화
  Object.entries(stats.question_stats).forEach(([questionId, stat]) => {
    if (stat.mean !== null) {
      renderBarChart(questionId, stat.mean, stat.stddev);
    }
    if (stat.adoption_rate !== null) {
      renderAdoptionRate(questionId, stat.adoption_rate);
    }
  });
}
```

---

## 에러 처리

API는 다음과 같은 에러 응답을 반환합니다:

```json
{
  "success": false,
  "error": {
    "message": "에러 메시지",
    "code": "ERROR_CODE"
  }
}
```

**일반적인 에러 코드**:
- `400`: 잘못된 요청 (필수 필드 누락, 잘못된 형식)
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

**에러 처리 예시**:
```javascript
async function submitSurvey() {
  try {
    const response = await fetch('http://localhost:3000/api/survey/response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || '제출 실패');
    }

    return result;
  } catch (error) {
    console.error('제출 에러:', error);
    alert('설문 제출에 실패했습니다: ' + error.message);
  }
}
```

---

## CORS 설정

API는 CORS가 활성화되어 있어 다른 도메인에서도 요청 가능합니다.

프로덕션 환경에서는 특정 도메인만 허용하도록 설정됩니다.

---

## 개발 팁

### 1. Swagger UI 활용
브라우저에서 `http://localhost:3000/api-docs`를 열어 모든 API를 테스트할 수 있습니다.

### 2. 로컬 테스트
```bash
# 헬스 체크
curl http://localhost:3000/api/health

# 설문지 조회
curl http://localhost:3000/api/survey/form

# 통계 조회
curl http://localhost:3000/api/survey/statistics
```

### 3. MongoDB Express
MongoDB 데이터를 직접 확인하려면 `http://localhost:8081` (admin/password123)

---

## 문의 및 이슈

GitHub 이슈: https://github.com/gwon6482/lighthouse_DB_API/issues

---

## 요약: 프론트엔드 개발자가 알아야 할 것

1. **설문 시작**: `GET /api/survey/form` → `survey_id` 저장
2. **응답 수집**: 질문 타입별로 올바른 형식으로 데이터 수집
3. **응답 제출**: `POST /api/survey/response` → `survey_id` + `answers` 전송
4. **통계 조회**: `GET /api/survey/statistics` → 결과 시각화

**모든 API는 JSON 형식으로 요청/응답합니다.**
