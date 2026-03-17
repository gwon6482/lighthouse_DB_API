const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lighthouse DB API',
      version: '1.0.0',
      description: 'MongoDB와 소통하는 Express 기반 설문조사 API 서버',
      contact: {
        name: 'API Support',
        email: 'support@lighthouse.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버'
      },
      {
        //url: 'https://api.lighthouse.com',
        url: 'http://218.155.36.75:3000',
        description: '프로덕션 서버'
      }
    ],
    components: {
      schemas: {
        Question: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: '질문 ID'
            },
            question_text: {
              type: 'string',
              description: '질문 내용'
            },
            question_type: {
              type: 'string',
              description: '질문 타입'
            },
            options: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: '선택지 옵션들'
            },
            category: {
              type: 'string',
              description: '질문 카테고리'
            },
            is_active: {
              type: 'boolean',
              description: '활성화 상태'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '생성일'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: '수정일'
            }
          }
        },
        SurveyResult: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: '설문 결과 ID'
            },
            survey_id: {
              type: 'string',
              description: '설문 ID'
            },
            completed_at: {
              type: 'string',
              format: 'date-time',
              description: '완료 시간'
            },
            is_completed: {
              type: 'boolean',
              description: '완료 여부'
            },
            temp_save: {
              type: 'object',
              properties: {
                part: {
                  type: 'string',
                  nullable: true
                },
                page: {
                  type: 'string',
                  nullable: true
                },
                question_num: {
                  type: 'string',
                  nullable: true
                }
              },
              description: '임시 저장 정보'
            },
            answer_type: {
              type: 'string',
              description: '응답 타입'
            },
            answers: {
              type: 'object',
              description: '컬렉션별 응답',
              properties: {
                T1: {
                  type: 'object',
                  description: '성격 관련 응답',
                  additionalProperties: {
                    type: 'string',
                    enum: ['O', 'X']
                  }
                },
                T21: {
                  type: 'object',
                  description: '재능 관련 응답',
                  additionalProperties: {
                    type: 'string',
                    enum: ['O', 'X']
                  }
                },
                T22: {
                  type: 'object',
                  description: '관심사 관련 응답',
                  properties: {
                    checked: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    }
                  }
                },
                T23: {
                  type: 'object',
                  description: '가치관 관련 응답',
                  properties: {
                    priority_1: {
                      type: 'string'
                    },
                    priority_2: {
                      type: 'string'
                    },
                    priority_3: {
                      type: 'string'
                    },
                    no_priority: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    }
                  }
                },
                T3: {
                  type: 'object',
                  description: '환경 관련 응답',
                  additionalProperties: {
                    type: 'string',
                    enum: ['O', 'X', 'M']
                  }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: '에러 메시지'
            }
          }
        }
      },
      parameters: {
        collectionType: {
          name: 'collection_type',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            enum: ['T1_personality', 'T2_1_talent', 'T2_2_interest', 'T2_3_values', 'T3_environmental']
          },
          description: '컬렉션 타입'
        },
        questionId: {
          name: 'question_id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: '질문 ID'
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: '서버 상태 확인 API'
      },
      {
        name: 'Admin',
        description: '관리자 API - 질문 관리'
      },
      {
        name: 'Survey',
        description: '설문조사 API'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './server.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 