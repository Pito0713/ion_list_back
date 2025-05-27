const User = require('../models/user.model');
const { successStatusHandler, successDataHandler } = require('../server/handle');
const appError = require('../server/appError');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 註冊
exports.register = async (req, res, next) => {
  try {
    const {
      account,
      password,
    } = req.body;

    if (!account && !password) {
      return next(appError(400, 'resource_not_found', next, 1004));
    }

    const userRepeat = await User.findOne({ account });
    if (userRepeat) {
      return next(appError(400, 'duplicate_account', next, 1005));
    }
    // 產生該帳號的 token 憑證, 用 env 中的金鑰
    const token = jwt.sign({ account: account }, process.env.JWT_SECRET);

    await User.create({
      account: account,
      password: bcryptjs.hashSync(password, 12), // 把密碼加密
      tags: ['verb', 'noun', 'adjective', 'particle'], // 預設 tags
      token: token,
    });

    successStatusHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next, 1003));
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
          successDataHandler(res, 'success', {
            id: user.id,
            account: user.account,
            tags: user.tags,
            token: user.token,
          });
        } else {
          return next(appError(404, 'password_error', next, 1006));
        }
      });
    } else {
      return next(appError(404, 'account_error', next, 1007));
    }
  } catch (err) {
    return next(appError(400, 'request_failed', next, 1003));
  }
};