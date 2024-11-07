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
      userName,
    } = req.body;

    if (!account && !password && !userName) {
      return next(appError(400, 'data_missing', next));
    }

    const userRepeat = await User.findOne({ account });
    if (userRepeat) {
      return next(appError(400, 'duplicate_user_account', next));
    }
    // 產生該帳號的token憑證, 用env中的金鑰
    const token = jwt.sign({ account: account }, process.env.JWT_SECRET);

    await User.create({
      account: account,
      password: bcryptjs.hashSync(password, 12), // 把密碼加密
      token: token,
      userName: userName,
    });

    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next));
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
          successHandler(res, 'success', { user });
        } else {
          return next(appError(400, 'password_error', next));
        }
      });
    } else {
      return next(appError(404, 'account_not_found', next));
    }
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};