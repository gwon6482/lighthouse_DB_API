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

module.exports = { getSurveyElements, getSurveyElementByCode, getCareerAttributes, getCareerAttributeByCode };
