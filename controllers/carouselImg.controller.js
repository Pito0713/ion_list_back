const CarouselImg = require('../models/carouselImg.model');
const { successHandler } = require('../server/handle');
const { appError } = require('../server/appError');

exports.createCarouselImg = async (req, res, next) => {
  try {
    const { img, isActive } = req.body;
    const newCarouselImg = await CarouselImg.create({
      img,
      isActive,
    });
    successHandler(res, 'success', newCarouselImg);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.uploadCarouselImg = async (req, res, next) => {
  try {
    const { id, isActive } = req.body;
    await CarouselImg.updateOne({ _id: id }, { isActive: isActive });
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.deleteOneCarouselImg = async (req, res, next) => {
  try {
    const CarouselImgId = req.params.id;
    const isCarouselImg = await CarouselImg.findById(CarouselImgId).exec();
    if (!isCarouselImg) {
      return next(appError(404, 'resource_not_found', next));
    }
    await CarouselImg.findByIdAndDelete(CarouselImgId);
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// 取的全部輪播圖
exports.findAllCarouselImg = async (req, res, next) => {
  try {
    const allCarouselImg = await CarouselImg.find();
    successHandler(res, 'success', allCarouselImg);
  } catch (err) {
    return next(appError(404, 'resource_not_found', next));
  }
};
// 取得啟動輪播圖
exports.findActiveCarouselImg = async (req, res, next) => {
  try {
    const searchCarousel = await CarouselImg.find({
      isActive: true,
    });
    successHandler(res, 'success', searchCarousel);
  } catch (err) {
    return next(appError(404, 'Resource not found', next));
  }
};
