const AboutImg = require('../models/aboutImg.model');
const { successHandler } = require('../server/handle');
const { appError } = require('../server/appError');

exports.createAboutImg = async (req, res, next) => {
  try {
    const { img, isActive } = req.body;
    const newAboutImg = await AboutImg.create({
      img,
      isActive,
    });
    successHandler(res, 'success', newAboutImg);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.uploadAboutImg = async (req, res, next) => {
  try {
    const { id, isActive } = req.body;
    await AboutImg.updateOne({ _id: id }, { isActive: isActive });
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.deleteOneAboutImg = async (req, res, next) => {
  try {
    const AboutImgId = req.params.id;
    const isAboutImg = await AboutImg.findById(AboutImgId).exec();
    if (!isAboutImg) {
      return next(appError(404, 'resource_not_found', next));
    }
    await AboutImg.findByIdAndDelete(AboutImgId);
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// 取的全部關於圖片
exports.findAllAboutImg = async (req, res, next) => {
  try {
    const allAboutImg = await AboutImg.find({});
    successHandler(res, 'success', allAboutImg);
  } catch (err) {
    return next(appError(404, 'resource_not_found', next));
  }
};

// 取得已啟動的關於圖片
exports.findActiveAboutImg = async (req, res, next) => {
  try {
    const searchCoupon = await AboutImg.find({
      isActive: true,
    });
    successHandler(res, 'success', searchCoupon);
  } catch (err) {
    return next(appError(404, 'resource_not_found', next));
  }
};
