const { successHandler, successDataHandler } = require('../server/handle');
const Text = require('../models/text.model');
const User = require('../models/user.model');
const appError = require('../server/appError');
const jwt = require('jsonwebtoken');

/*
  確認 JWT token
*/
const authCheck = async (_tokenVale, _next) => {
  let userAccount = null
  // 確保 Authorization 標頭存在 Bearer token 格式

  if (!_tokenVale || !_tokenVale?.startsWith('Bearer ')) {
    return _next(appError(401, 'Unauthorized', _next, 1001));
  }
  // 抓JWT 並且解碼後去搜尋是否有符合的 account
  const token = _tokenVale && _tokenVale.split(' ')[1];
  userAccount = await jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    let account = user?.account
    return await User.findOne({ account })
  })

  if (!userAccount) {
    return _next(appError(401, 'Unauthorized', _next, 1002));
  }

  return userAccount ? userAccount : null
}

// 新增
exports.addText = async (req, res, next) => {
  try {
    const { file, inputs, translation } =
      req.body;
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)

    let tags = req.body?.['tags[]']
    await Text.create({
      file,
      inputs,
      translation,
      token: userCheck?.token,
      tags,
      date: Date.now(),
      isShowTop: true, // 預設 true
    });
    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next, 1003));
  }
};

// 取得
exports.searchText = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)

    const { searchValue } = req.body;
    let target = {
      token: userCheck?.token,
    }
    if (searchValue) {
      target.file = { $regex: searchValue }
    }
    if (req.body?.['tags[]']?.length > 0) {
      target.tags = req.body?.['tags[]']
    }
    /* sort 定義結果集排序順序, 1:正序  -1:倒序
      若不指定，則預設為 1，即正序排序
      若要反轉排序，可以設置為 -1，即倒序排序
      若要多重排序，可以多次設置 sort 屬性，例如：
      sort: { field1: 1, field2: -1 }
      這樣，field1 按正序排序，field2 按逆序排序
    */
    const searchTarget = await Text.find(target).sort({ isShowTop: -1, date: -1, });
    successDataHandler(res, 'success', searchTarget);
  } catch (err) {
    return next(appError(400, 'request_failed', next, 1003));
  }
};

// 修正
exports.editText = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader)

    const {
      file,
      inputs,
      translation,
      _id
    } = req.body;
    let tags = req.body?.['tags[]']
    await Text.updateOne({ _id: _id }, {
      file: file,
      inputs: inputs,
      translation: translation,
      tags: tags,
    })

    // if (targetUpdateOne.upsertedId) {
    //   successHandler(res, 'success');
    //   return
    // }

    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next, 1003));
  }
}

// 修正
exports.editTextShowTop = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader)

    const {
      isShowTop,
      _id
    } = req.body;
    await Text.updateOne({ _id: _id }, {
      isShowTop: isShowTop,
    })
    // if (targetUpdateOne.upsertedId) {
    //   successHandler(res, 'success');
    //   return
    // }

    successHandler(res, 'success');
  } catch (err) {
    return next(appError(400, 'request_failed', next, 1003));
  }
}