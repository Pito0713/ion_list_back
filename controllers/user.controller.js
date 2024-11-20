const User = require('../models/user.model');
const { successHandler } = require('../server/handle');
const appError = require('../server/appError');
const bcryptjs = require('bcryptjs');
const request = require('request-promise');
const jwt = require('jsonwebtoken');

// 註冊
exports.register = async (req, res, next) => {
  try {
    const {
      account,
      password,
    } = req.body;

    if (!account && !password) {
      return next(appError(400, '缺少資料', next));
    }

    const userRepeat = await User.findOne({ account });
    if (userRepeat) {
      return next(appError(400, '重複帳號', next));
    }
    // 產生該帳號的token憑證, 用env中的金鑰
    const token = jwt.sign({ account: account }, process.env.JWT_SECRET);

    await User.create({
      account: account,
      password: bcryptjs.hashSync(password, 12), // 把密碼加密
      tags: ['verb', 'noun', 'adjective', 'particle'],
      token: token,
    });

    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, '請求失敗', next));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { account, password } = req.body;
    // 找到帳號 並且順便撈他的password
    const user = await User.findOne({ account }).select('+password');

    if (!['', null, undefined].includes(user)) {
      // 兩者解密是否對應
      bcryptjs.compare(password, user.password).then((result) => {
        if (result) {
          successHandler(res, 'success', {
            id: user.id,
            account: user.account,
            tags: user.tags,
            token: user.token,
          });
        } else {
          return next(appError(400, '密碼錯誤', next));
        }
      });
    } else {
      return next(appError(404, '找不到帳號', next));
    }
  } catch (err) {
    return next(appError(400, '請求失敗', next));
  }
};