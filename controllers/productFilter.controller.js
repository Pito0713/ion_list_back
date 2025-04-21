const ProductFilter = require('../models/productFilter.model');
const { successHandler } = require('../server/handle');
const { appError } = require('../server/appError');

// 搜尋分類
exports.productFilter = async (req, res, next) => {
  try {
    const filterItem = await ProductFilter.find({});
    successHandler(res, 'success', filterItem);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.createProductFilter = async (req, res, next) => {
  try {
    const { category, token } = req.body;
    const newFilter = await ProductFilter.create({
      category,
      token,
    });
    successHandler(res, 'success', newFilter);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.deleteProductFilter = async (req, res, next) => {
  try {
    const { id } = req.body;
    const filterItem = await ProductFilter.findById(id).exec();
    if (!filterItem) {
      return next(appError(404, 'resource_not_found', next));
    }
    await ProductFilter.findByIdAndDelete(id);
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};
