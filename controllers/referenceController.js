const SurveyElement = require('../models/SurveyElement');
const CareerAttribute = require('../models/CareerAttribute');

// GET /api/reference/survey-elements?test_code=T1&area=personality&level=upper&parent_code=A
const getSurveyElements = async (req, res, next) => {
  try {
    const { test_code, area, level, parent_code } = req.query;
    const filter = {};
    if (test_code) filter.test_code = test_code.toUpperCase();
    if (area) filter.area = area.toLowerCase();
    if (level) filter.level = level;
    if (parent_code) filter.parent_code = parent_code.toUpperCase();

    const elements = await SurveyElement.find(filter, '-__v').sort({ code: 1 });
    res.json({ success: true, count: elements.length, data: elements });
  } catch (err) {
    next(err);
  }
};

// GET /api/reference/survey-elements/:code
const getSurveyElementByCode = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const element = await SurveyElement.findOne({ code }, '-__v');
    if (!element) {
      return res.status(404).json({ success: false, error: '해당 코드의 요소를 찾을 수 없습니다' });
    }
    // sub 요소면 parent도 함께 반환
    let parent = null;
    if (element.parent_code) {
      parent = await SurveyElement.findOne({ code: element.parent_code }, '-__v');
    }
    res.json({ success: true, data: element, parent: parent || undefined });
  } catch (err) {
    next(err);
  }
};

// GET /api/reference/career-attributes?category=ability
const getCareerAttributes = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category.toLowerCase();

    const attributes = await CareerAttribute.find(filter, '-__v').sort({ code: 1 });
    res.json({ success: true, count: attributes.length, data: attributes });
  } catch (err) {
    next(err);
  }
};

// GET /api/reference/career-attributes/:code
const getCareerAttributeByCode = async (req, res, next) => {
  try {
    const attribute = await CareerAttribute.findOne({ code: req.params.code.toUpperCase() }, '-__v');
    if (!attribute) {
      return res.status(404).json({ success: false, error: '해당 코드의 속성을 찾을 수 없습니다' });
    }
    res.json({ success: true, data: attribute });
  } catch (err) {
    next(err);
  }
};

// POST /api/reference/survey-elements
const createSurveyElement = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'code 필드가 필요합니다.' });

    const existing = await SurveyElement.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(409).json({ success: false, error: `code '${code}'가 이미 존재합니다.` });

    const element = await SurveyElement.create({ ...req.body, code: code.toUpperCase() });
    res.status(201).json({ success: true, data: element });
  } catch (err) {
    next(err);
  }
};

// PUT /api/reference/survey-elements/:code
const updateSurveyElement = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    delete req.body.code; // code 자체는 변경 불가

    const updated = await SurveyElement.findOneAndUpdate(
      { code },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, error: `code '${code}'에 해당하는 요소를 찾을 수 없습니다.` });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reference/survey-elements/:code
const deleteSurveyElement = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const deleted = await SurveyElement.findOneAndDelete({ code });
    if (!deleted) return res.status(404).json({ success: false, error: `code '${code}'에 해당하는 요소를 찾을 수 없습니다.` });

    res.json({ success: true, message: `code '${code}' 요소가 삭제되었습니다.` });
  } catch (err) {
    next(err);
  }
};

// POST /api/reference/career-attributes
const createCareerAttribute = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'code 필드가 필요합니다.' });

    const existing = await CareerAttribute.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(409).json({ success: false, error: `code '${code}'가 이미 존재합니다.` });

    const attribute = await CareerAttribute.create({ ...req.body, code: code.toUpperCase() });
    res.status(201).json({ success: true, data: attribute });
  } catch (err) {
    next(err);
  }
};

// PUT /api/reference/career-attributes/:code
const updateCareerAttribute = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    delete req.body.code;

    const updated = await CareerAttribute.findOneAndUpdate(
      { code },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, error: `code '${code}'에 해당하는 속성을 찾을 수 없습니다.` });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reference/career-attributes/:code
const deleteCareerAttribute = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const deleted = await CareerAttribute.findOneAndDelete({ code });
    if (!deleted) return res.status(404).json({ success: false, error: `code '${code}'에 해당하는 속성을 찾을 수 없습니다.` });

    res.json({ success: true, message: `code '${code}' 속성이 삭제되었습니다.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSurveyElements, getSurveyElementByCode, getCareerAttributes, getCareerAttributeByCode,
  createSurveyElement, updateSurveyElement, deleteSurveyElement,
  createCareerAttribute, updateCareerAttribute, deleteCareerAttribute
};
