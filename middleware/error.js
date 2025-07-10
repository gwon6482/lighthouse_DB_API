const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose 잘못된 ObjectId
  if (err.name === 'CastError') {
    const message = '리소스를 찾을 수 없습니다';
    error = { message, statusCode: 404 };
  }

  // Mongoose 중복 키
  if (err.code === 11000) {
    const message = '중복된 필드 값이 입력되었습니다';
    error = { message, statusCode: 400 };
  }

  // Mongoose 검증 오류
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '서버 오류가 발생했습니다'
  });
};

module.exports = errorHandler; 