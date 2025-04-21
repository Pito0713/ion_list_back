const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const { successHandler } = require('../server/handle');
const { appError } = require('../server/appError');

exports.cartData = async (req, res, next) => {
  try {
    const { token, page, pagination } = req.body;
    if (!token) {
      return next(appError(401, 'user_certificate_error', next));
    }
    const allCart = await Cart.find({ token });
    const allCargo = await Product.find({});
    const cartDataValue = [];

    let targetAllCart = [];
    for (let i = (page - 1) * pagination; i < page * pagination; i++) {
      allCart[i] ? targetAllCart.push(allCart[i]) : '';
    }


    targetAllCart.forEach((e) => {
      let cargo = allCargo.filter((item) => item._id == e.id);

      if (cargo) {
        let target = {
          category: cargo[0]?.category,
          describe: cargo[0]?.describe,
          imageUrl: cargo[0]?.imageUrl,
          price: cargo[0]?.price,
          remark: cargo[0]?.remark,
          token: cargo[0]?.token,
          _id: cargo[0]?._id,
          count: e.count,
        };
        cartDataValue.push(target);
      }


    });

    successHandler(res, 'success', cartDataValue);
  } catch (err) {
    return next(appError(404, 'resource_not_found', next));
  }
};

exports.uploadCart = async (req, res, next) => {
  try {
    const { id, token, count } = req.body;
    if (!token) {
      return next(appError(401, 'user_certificate_error', next));
    }
    const CartList = await Cart.find({});

    let CartItem = []
    // 先找商品id 然後再找出token使用者的資料
    CartItem = CartList.filter((item) => item.id == id).filter(
      (item) => item.token == token
    );

    // 找出商品
    const productItem = await Product.findById(id).exec();
    const newCount = Number(productItem.quantity) - Number(count);
    if (newCount >= 0) {
      if (CartItem.length > 0) {
        // await Product.updateOne(
        //   { _id: id },
        //   { $set: { quantity: newCount } }
        // );
        let data = { id, token, count };
        data.count = Number(CartItem[0].count) + Number(count);
        const editCargo = await Cart.findByIdAndUpdate(CartItem[0], data);
        successHandler(res, 'success', editCargo);
      } else {
        const newCart = await Cart.create({
          id,
          token,
          count,
        });
        // await Product.updateOne(
        //   { _id: id },
        //   { $set: { quantity: newCount } }
        // );
        successHandler(res, 'success', newCart);
      }
    } else {
      return next(appError(404, 'stock_not_enough', next));
    }

  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};


exports.deleteCart = async (req, res, next) => {
  try {
    const { id } = req.body;
    const allCart = await Cart.find({});
    if (allCart?.length > 0) {
      let cartTarget = []
      // 先找加入購物車商品id
      cartTarget = allCart.filter((item) => item.id == id);

      if (cartTarget?.length === 0) {
        return next(appError(400, 'request_failed', next));
      }
      const CartItem = await Cart.findById(cartTarget[0]?._id).exec();
      if (!CartItem) {
        return next(appError(404, 'resource_not_found', next));
      }
      const productItem = await Product.findById(id).exec();
      const newCount =
        Number(productItem.quantity) + Number(cartTarget[0].count);
      // 更新原本商品的庫存
      await Product.updateOne({ _id: id }, { $set: { quantity: newCount } });
      await Cart.findByIdAndDelete(CartItem._id);
      successHandler(res, 'success');
    } else {
      return next(appError(404, 'resource_not_found', next));
    }
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};
