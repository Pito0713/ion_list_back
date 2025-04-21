const Coupon = require('../models/coupon.model');
const { successHandler, successTotalHandler } = require('../server/handle');
const { appError } = require('../server/appError');

// 新增優惠卷
exports.createCoupon = async (req, res, next) => {
  try {
    const { describe, discount, remark, startDate, endDate, count } = req.body;
    let unUser = []; // 未使用者
    let userEd = []; // 已使用者
    const newCoupon = await Coupon.create({
      describe,
      discount,
      remark,
      startDate,
      endDate,
      user: unUser,
      userEd: userEd,
      count,
    });
    successHandler(res, 'success', newCoupon);
  } catch (error) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.findAllCoupon = async (req, res, next) => {
  try {
    const { id } = req.body;
    const allCoupon = await Coupon.find({});
    var targetCoupon = allCoupon.map((item) => {
      let isHasUser = item.user.find(user => { return user == id })
      let isHasUserEd = item.userEd.find(user => { return user == id })
      return {
        createdAt: item.createdAt,
        describe: item.describe,
        discount: item.discount,
        remark: item.remark,
        startDate: item.startDate,
        endDate: item.endDate,
        id: item.id,
        isUser: isHasUser ? true : false,
        isUserEd: isHasUserEd ? true : false,
      }
    })
    successHandler(res, 'success', targetCoupon);
  } catch (err) {
    return next(appError(404, 'resource_not_found', next));
  }
};

exports.findPersonalCoupon = async (req, res, next) => {
  try {
    const { id } = req.body;
    // 取得已領取的使用者
    const coupons = await Coupon.find({
      user: { $in: [id] },
    });
    // 取的已領取並且已使用
    const couponsEd = await Coupon.find({
      userEd: { $in: [id] },
    });

    // 已使用的使用者id
    let targetED = []
    targetED = couponsEd.map((item) => { return item.id });

    // 排除使用的優惠卷
    let couponsFilter = []
    couponsFilter = coupons.filter((item) => !targetED.includes(item.id));

    let targetCoupons = []
    if (couponsFilter.length > 0) {
      const currentDate = new Date();
      // 若小於日期也不顯示
      targetCoupons = couponsFilter.filter((item) => {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        return (
          currentDate >= startDate && currentDate <= endDate && item.count > 0
        );
      });
    }
    successHandler(res, 'success', targetCoupons);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const CouponId = req.params.id;
    const { describe, discount, count, remark, startDate, endDate } = req.body;
    const data = { describe, discount, remark, startDate, endDate, count };
    if (!data.describe) {
      return next(appError(400, 'data_missing', next));
    }
    if (!data.count) {
      return next(appError(400, 'data_missing', next));
    }
    if (!data.discount) {
      return next(appError(400, 'data_missing', next));
    }
    if (!data.startDate) {
      return next(appError(400, 'valid_start_and_end_times_required', next));
    }
    if (!data.endDate) {
      return next(appError(400, 'valid_start_and_end_times_required', next));
    }
    // 更新優惠卷資料
    const editCoupon = await Coupon.findByIdAndUpdate(CouponId, data);
    if (!editCoupon) {
      return next(appError(404, 'resource_not_found', next));
    }
    // 回傳
    const resultCoupon = await Coupon.findById(editCoupon).exec();
    successHandler(res, 'success', resultCoupon);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.deleteOneCoupon = async (req, res, next) => {
  try {
    const CouponId = req.params.id;
    const couponItem = await Coupon.findById(CouponId).exec();
    if (!couponItem) {
      return next(appError(404, 'resource_not_found', next));
    }
    await Coupon.findByIdAndDelete(CouponId);
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.deleteAllCoupon = async (req, res, next) => {
  try {
    await Coupon.deleteMany({});
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.searchCoupon = async (req, res, next) => {
  try {
    const { searchText, page, pagination } = req.body;
    const searchCoupon = await Coupon.find({
      describe: { $regex: searchText },
    });
    let target = [];
    for (let i = (page - 1) * pagination; i < page * pagination; i++) {
      !searchCoupon[i] ? '' : target.push(searchCoupon[i]);
    }
    successTotalHandler(res, 'success', target, searchCoupon?.length ? searchCoupon?.length : 0);

  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

exports.updateCouponUser = async (req, res, next) => {
  try {
    const CouponId = req.params.id;
    const { user } = req.body;

    // 找出對應的優惠卷
    const targetCoupon = await Coupon.findById(CouponId);
    if (targetCoupon) {
      let targetCouponUser = []
      // 找出對應的優惠卷的使用者
      targetCouponUser = targetCoupon?.user.filter((item) => {
        return item === user;
      });

      // 若沒有在資料中回傳領取成功
      if (targetCouponUser?.length == 0) {
        const editCouponCoupon = await Coupon.findByIdAndUpdate(
          CouponId,
          { $push: { user: user } },
          { new: true }
        );
        successHandler(res, 'success');
      } else {
        return next(appError(400, 'duplicate_received', next));
      }
    } else {
      return next(appError(404, 'resource_not_found', next));
    }
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};
