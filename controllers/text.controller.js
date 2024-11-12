const { successHandler, successTotalHandler } = require('../server/handle');
const Text = require('../models/text.model');
const User = require('../models/user.model');
const appError = require('../server/appError');
const jwt = require('jsonwebtoken');

// 新增
exports.addText = async (req, res, next) => {
  try {
    const { file, inputs, translation } =
      req.body;
    const authHeader = req.headers['authorization'];

    // 確保 Authorization 標頭存在，且為 Bearer token 格式
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(appError(401, 'Unauthorized', next));
    }
    // 抓JWT
    const token = authHeader && authHeader.split(' ')[1];
    let userAccount = await jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      let userAccount = user?.account
      return await User.findOne({ userAccount })
    })

    if (!userAccount) {
      return next(appError(404, 'resource_not_found', next));
    }
    const newText = await Text.create({
      file,
      inputs,
      translation,
      token
    });
    successHandler(res, 'success', newText);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};

// 取得
exports.searchText = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // 確保 Authorization 標頭存在，且為 Bearer token 格式
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(appError(401, 'Unauthorized', next));
    }
    // 抓JWT
    const token = authHeader && authHeader.split(' ')[1];
    let userAccount = await jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      let userAccount = user?.account
      return await User.findOne({ userAccount })
    })

    if (!userAccount) {
      return next(appError(404, 'resource_not_found', next));
    }

    const { searchValue } = req.body;
    let target = {
      token: token,
    }
    if (searchValue) {
      target.file = { $regex: searchValue }

    }
    const searchTarget = await Text.find(target);
    successHandler(res, 'success', searchTarget);
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};
