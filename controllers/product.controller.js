const { successHandler, successTotalHandler } = require('../server/handle');
const Product = require('../models/product.model');
const { appError } = require('../server/appError');

// 搜尋全部商品
exports.allProduct = async (req, res, next) => {
  try {
    const { searchText, category, page, pagination } = req.body;
    // 是否分類判斷
    if (!['', null, undefined].includes(req.body?.['category[]'])) {
      submit = {
        describe: { $regex: searchText },
        category: req.body?.['category[]'],
      }
    } else {
      submit = {
        describe: { $regex: searchText },
      }
    }
    const allProduct = await Product.find(submit)
    allProduct.reverse()
    let target = [];
    if (allProduct.length > 0) {
      for (let i = (page - 1) * pagination; i < page * pagination; i++) {
        !allProduct[i] ? '' : target.push(allProduct[i]);
      }
    }
    successTotalHandler(res, 'success', target, allProduct?.length ? allProduct?.length : 0);

  } catch (error) {
    return next(appError(400, 'request_failed', next));
  }
};

// 新增商品
exports.addProduct = async (req, res, next) => {
  try {
    const { describe, quantity, price, remark, token, imageUrl, category } =
      req.body;
    const newProduct = await Product.create({
      describe,
      price,
      quantity,
      remark,
      token,
      imageUrl,
      category,
    });
    successHandler(res, 'success', newProduct);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// 更新商品
exports.uploadProduct = async (req, res, next) => {
  try {
    const productId = req.body.id;
    const { describe, price, quantity, remark, token, imageUrl, category } =
      req.body;
    const data = {
      describe,
      price,
      remark,
      token,
      imageUrl,
      category,
      quantity,
    };
    if (!data.describe) {
      return next(appError(400, 'data_missing', next));
    }
    if (!data.price) {
      return next(appError(400, 'data_missing', next));
    }
    if (!data.category) {
      return next(appError(400, 'data_missing', next));
    }
    if (!data.quantity) {
      return next(appError(400, 'data_missing', next));
    }

    const editProduct = await Product.findByIdAndUpdate(productId, data);
    if (!editProduct) {
      return next(appError(404, 'resource_not_found', next));
    }
    const resultCargo = await Product.findById(editProduct).exec();
    successHandler(res, 'success', resultCargo);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.deleteProductOne = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const productItem = await Product.findById(productId).exec();
    if (!productItem) {
      return next(appError(404, 'resource_not_found', next));
    }
    await Product.findByIdAndDelete(productId);
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.deleteProductCategory = async (req, res, next) => {
  try {
    let target = []
    target = req.body?.['category[]'];

    if (target?.length > 0 && Array.isArray(target)) {
      // 多筆資料
      for (let i = 0; target?.length > i; i++) {
        const productItem = await Product.findById(target[i]).exec();
        await Product.findByIdAndDelete(productItem);
      }
    } else {
      const productItem = await Product.findById(target).exec();
      await Product.findByIdAndDelete(productItem);
    }
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.productDatabase = async (req, res) => {
  try {
    const { searchText, category, page, pagination, isSort } = req.body;

    // 有無用分類搜尋資料
    if (
      ['', null, undefined].includes(req.body?.['category[]']) ||
      req.body?.['category[]'] === '全部'
    ) {
      let target = [];
      const allProduct = await Product.find({
        describe: { $regex: searchText },
      });
      if (allProduct?.length > 0 && Array.isArray(allProduct)) {
        for (let i = (page - 1) * pagination; i < page * pagination; i++) {
          !allProduct[i] ? '' : target.push(allProduct[i]);
        }

        const compareFn = (a, b) => {
          const priceA = parseInt(a.price);
          const priceB = parseInt(b.price);

          if (isSort === 'asc') {
            return priceA - priceB; // 升序排序
          } else {
            return priceB - priceA; // 降序排序
          }
        };

        target.sort(compareFn);

      }
      successTotalHandler(res, 'success', target, allProduct?.length ? allProduct.length : 0);
    } else {
      let target = [];
      const allProduct = await Product.find({
        describe: { $regex: searchText },
        category: req.body?.['category[]'],
      });
      if (allProduct?.length > 0 && Array.isArray(allProduct)) {
        for (let i = (page - 1) * pagination; i < page * pagination; i++) {
          !allProduct[i] ? '' : target.push(allProduct[i]);
        }
        const compareFn = (a, b) => {
          const priceA = parseInt(a.price);
          const priceB = parseInt(b.price);

          if (isSort === 'asc') {
            return priceA - priceB; // 升序排序
          } else {
            return priceB - priceA; // 降序排序
          }
        };
        target.sort(compareFn);
      }
      successTotalHandler(res, 'success', target, allProduct?.length ? allProduct.length : 0);
    }
  } catch (error) {
    return next(appError(400, 'request_failed', next));
  }
};
