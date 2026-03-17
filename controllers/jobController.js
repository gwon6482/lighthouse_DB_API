const mongoose = require('mongoose');

const getJobModel = () => {
  const jobDb = mongoose.connection.useDb(process.env.JOB_DATA_DB || 'job_data');
  const modelName = 'JobData';

  if (jobDb.models[modelName]) {
    return jobDb.models[modelName];
  }

  const schema = new mongoose.Schema({}, { strict: false });
  return jobDb.model(modelName, schema, 'job_info');
};

const getJobByCode = async (req, res, next) => {
  try {
    const { jobCode } = req.params;

    // jobCode 형식 검증 (6자리 숫자)
    if (!/^\d{6}$/.test(jobCode)) {
      return res.status(400).json({
        success: false,
        error: 'jobCode 형식이 올바르지 않습니다. 6자리 숫자여야 합니다.',
        received: jobCode
      });
    }

    // DB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: '데이터베이스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    const Job = getJobModel();
    const job = await Job.findOne({ jobCode }).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        error: `jobCode '${jobCode}'에 해당하는 직업을 찾을 수 없습니다.`
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    // MongoDB 타임아웃
    if (error.name === 'MongoNetworkTimeoutError' || error.name === 'MongoTimeoutError') {
      return res.status(504).json({
        success: false,
        error: '데이터베이스 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    next(error);
  }
};

module.exports = { getJobByCode };
