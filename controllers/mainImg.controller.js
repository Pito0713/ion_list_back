const MainImg = require('../models/mainImg.model');
const { successHandler } = require('../server/handle');
const { appError } = require('../server/appError');

exports.createMainImg = async (req, res, next) => {
  try {
    const { img, isActive, category } = req.body;
    const newMainImg = await MainImg.create({
      img,
      isActive,
      category
    });
    successHandler(res, 'success', newMainImg);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};


exports.uploadMainImg = async (req, res, next) => {
  try {
    const { id, isActive } = req.body;
    await MainImg.updateOne({ _id: id }, { isActive: isActive });
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// delete a Coupon by id
exports.deleteOneMainImg = async (req, res, next) => {
  try {
    const MainImgId = req.params.id;
    const isMainImg = await MainImg.findById(MainImgId).exec();
    if (!isMainImg) {
      return next(appError(404, 'resource_not_found', next));
    }
    await MainImg.findByIdAndDelete(MainImgId);
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.findAllMainImg = async (req, res, next) => {
  try {
    const allMainImg = await MainImg.find({});
    successHandler(res, 'success', allMainImg);
  } catch (err) {
    return next(appError(404, 'resource_not_found', next));
  }
};


exports.findActiveMainImg = async (req, res, next) => {
  try {
    const searchCoupon = await MainImg.find({
      isActive: true,
    });
    successHandler(res, 'success', searchCoupon);
  } catch (err) {
    return next(appError(404, 'resource_not_found', next));
  }
};
