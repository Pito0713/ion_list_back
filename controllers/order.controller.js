const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const Coupon = require('../models/coupon.model');
const { successHandler, successTotalHandler } = require('../server/handle');
const { appError } = require('../server/appError');

exports.searchOrder = async (req, res, next) => {
  try {
    const { searchText, page, pagination } = req.body;
    const searchCoupon = await Order.find({
      'infoData.userName': { $regex: searchText },
    });
    let target = [];
    for (let i = (page - 1) * pagination; i < page * pagination; i++) {
      !searchCoupon[i] ? '' : target.push(searchCoupon[i]);
    }
    successTotalHandler(res, 'success', target, searchCoupon?.length ? searchCoupon?.length : 0);

  } catch (err) {
    return next(appError(404, 'resource_not_found', next));
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    let submitData = {
      id: '',
      token: {},
      CheckOutList: {},
      ProductList: [],
      selectedOption: {},
      infoData: {},
    };
    Object.entries(req.body).forEach(([key, value]) => {
      if (key.startsWith('CheckOutList')) {
        // 將 CheckOutList 項目轉換成物件
        const index = key.match(/\d+/)[0];
        const field = key.match(/\[([a-zA-Z]+)\]/)[1];
        submitData.CheckOutList[index] = submitData.CheckOutList[index] || {};
        submitData.CheckOutList[index][field] = value;
      } else if (key.startsWith('infoData')) {
        // 將 infoData 項目轉換成物件
        const field = key.match(/\[([a-zA-Z]+)\]/)[1];
        submitData.infoData[field] = value;
      } else {
        submitData[key] = value;
      }
    });

    // 撈出訂單中所有商品資料
    for (let i = 0; i < Object.keys(submitData.CheckOutList).length; i++) {
      const document = await Product.findOne({
        _id: submitData.CheckOutList[i].id,
      });
      submitData.ProductList.push(document);
    }

    // 檢查訂單數量與庫存數量是否可下單
    const checkQuantity = (submitData) => {
      const CheckOutList = submitData.CheckOutList;
      const ProductList = submitData.ProductList;

      for (const key in CheckOutList) {
        const checkoutItem = CheckOutList[key];
        const productId = checkoutItem.id;
        const count = parseInt(checkoutItem.count, 10);

        const productItem = ProductList.find(
          (item) => item._id.toString() === productId
        );
        if (productItem) {
          const quantity = parseInt(productItem.quantity, 10);
          if (quantity - count >= 0) {
            return true;
          } else return false;
        }
      }
    };
    const result = checkQuantity(submitData);

    if (result) {
      for (let i = 0; i < submitData.ProductList.length; i++) {
        // 扣除下單後數量
        const newCount =
          Number(submitData.ProductList[i].quantity) -
            Number(submitData.CheckOutList[i].count) <
            0
            ? 0
            : Number(submitData.ProductList[i].quantity) -
            Number(submitData.CheckOutList[i].count);

        await Product.updateOne(
          { _id: submitData.ProductList[i]._id },
          { $set: { quantity: newCount } }
        );
      }
    }

    let targetCoupon = {};

    if (submitData?.selectedOption) {
      // 找出對應的優惠卷
      targetCoupon = await Coupon.findById(submitData?.selectedOption);
      if (targetCoupon) {
        const userId = req.body.id;
        const index = targetCoupon.user.indexOf(userId);
        if (index !== -1) {
          // 加入已使用的名單裡
          targetCoupon.userEd.push(userId);
          // 扣除數量
          targetCoupon.count = Number(targetCoupon.count) - 1;
          // 儲存
          await targetCoupon.save();
        }
      }
    }

    let token = submitData.token;
    let ProductList = submitData.ProductList;
    ProductList.map((item, index) => {
      // 轉換數量至訂單data中
      if (item._id == submitData.CheckOutList[index].id) {
        return (item.quantity = submitData.CheckOutList[index].count);
      }
    });
    let selectedOption = submitData.selectedOption;
    let infoData = submitData.infoData;
    // 加總金額
    let totalPrice = ProductList.reduce((total, item) => {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      return total + quantity * price;
    }, 0);
    // 扣除優惠卷折扣
    if (totalPrice && targetCoupon) {
      totalPrice =
        totalPrice - Number(targetCoupon.discount) >= 0
          ? totalPrice - Number(targetCoupon.discount)
          : 0;
    }
    let totalQuantity = ProductList.length;

    const orderItem = await Order.create({
      token,
      ProductList,
      selectedOption,
      infoData,
      totalPrice,
      totalQuantity,
    });

    successHandler(res, 'success', orderItem);
    // 清除使用者購物車
    await Cart.deleteMany({ token });
  } catch (err) {
    return next(appError(400, 'request failed', next));
  }
};

exports.deleteOneOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const isOrder = await Order.findById(orderId).exec();
    if (!isOrder) {
      return next(appError(404, 'resource_not_found', next));
    }

    await Order.findByIdAndDelete(isOrder._id);
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};
