const { successHandler, successTotalHandler } = require('../server/handle');
const Text = require('../models/text.model');
const appError = require('../server/appError');

// 新增
exports.addText = async (req, res, next) => {
  try {
    const { file, inputs, translation } =
      req.body;
    const newText = await Text.create({
      file,
      inputs,
      translation
    });
    successHandler(res, 'success', newText);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// 取得
exports.getText = async (req, res, next) => {
  try {
    const allText = await Text.find({});
    successHandler(res, 'success', allText);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};
