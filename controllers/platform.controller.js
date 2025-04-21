const Platform = require('../models/platform.model');
const { successHandler } = require('../server/handle');
const { appError } = require('../server/appError');

exports.platformRate = async (req, res, next) => {
  try {
    const platformItem = await Platform.find({});
    successHandler(res, 'success', platformItem);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.createModifyRate = async (req, res, next) => {
  try {
    const { label, rate, token } = req.body;
    const newPlatform = await Platform.create({
      label,
      rate,
      token,
    });
    successHandler(res, 'success', newPlatform);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.updateModifyRate = async (req, res, next) => {
  try {
    const { id } = req.body;
    // 找出所有啟動的, 把它關掉
    await Platform.updateMany({ isActive: true }, { isActive: false });
    // 然後啟動該筆
    await Platform.findByIdAndUpdate(id, { isActive: true });

    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.deleteModifyRate = async (req, res, next) => {
  try {
    const { id } = req.body;
    const isCargo = await Platform.findById(id).exec();
    if (!isCargo) {
      return next(appError(404, 'resource_not_found', next));
    }
    await Platform.findByIdAndDelete(id);
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};
