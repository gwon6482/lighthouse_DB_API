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

const searchJobByName = async (req, res, next) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'name 쿼리 파라미터가 필요합니다.'
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: '데이터베이스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    const Job = getJobModel();
    const jobs = await Job.find(
      { title: { $regex: name.trim(), $options: 'i' } },
      { jobCode: 1, title: 1, 'classification.primary': 1, 'classification.secondary': 1, _id: 0 }
    ).lean();

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        error: `'${name}'에 해당하는 직업을 찾을 수 없습니다.`
      });
    }

    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

const getJobList = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: '데이터베이스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 50;
    if (limit > 100) limit = 100;
    if (page < 1) page = 1;

    const filter = {};
    if (req.query.primary) filter['classification.primary'] = req.query.primary;
    if (req.query.secondary) filter['classification.secondary'] = req.query.secondary;
    if (req.query.major) filter['relatedMajors'] = req.query.major;

    const Job = getJobModel();
    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter, {
      jobCode: 1,
      title: 1,
      'classification.primary': 1,
      'classification.secondary': 1,
      salary: 1,
      jobSatisfaction: 1,
      relatedMajors: 1,
      relatedCertifications: 1,
      _id: 0
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: total,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      },
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobByCode, searchJobByName, getJobList };
