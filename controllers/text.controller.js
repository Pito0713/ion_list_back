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
    const { file, inputs, fileTranslate, translation } =
      req.body;
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)

    let tags = req.body?.['tags[]']
    await Text.create({
      file,
      fileTranslate,
      inputs,
      translation,
      token: userCheck?.token,
      tags,
      date: Date.now(),
      isShowTop: false, // 預設 false
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
    // 如果有 searchValue，將 file 和 translation 的條件合併
    if (searchValue) {
      target.$or = [
        { file: { $regex: searchValue } },
        { translation: { $regex: searchValue } }
      ];
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

    const noneToken = searchTarget.map(item => {
      let newItem = { ...item._doc };  // 淺拷貝資料
      delete newItem.token;      // 刪除 token 屬性
      return newItem;
    });

    successDataHandler(res, 'success', noneToken);
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
      fileTranslate,
      inputs,
      translation,
      _id
    } = req.body;
    let tags = req.body?.['tags[]']
    await Text.updateOne({ _id: _id }, {
      file: file,
      fileTranslate: fileTranslate,
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
    await authCheck(authHeader, next)

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

exports.textTest = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)
    const dailyText = await Text.aggregate([
      {
        $match: {
          token: userCheck?.token,
          translation: { $exists: true, $ne: "" } // translation 必須存在且不為空字串
        }
      },
      { $sample: { size: 1 } }
    ]);

    const targetTag = await Text.aggregate([
      {
        $match: {
          token: userCheck?.token,
          tags: { $all: dailyText[0].tags }
        }
      },
      { $sample: { size: 3 } }
    ]);
    let targetTagArray = targetTag.map((item) => {
      return item.file
    })

    targetTagArray.push(dailyText[0].file)

    let finallyText = {
      _id: dailyText[0]._id,
      translation: dailyText[0].translation.replace(`${dailyText[0].file}`, `()`),
      targetTagArray: targetTagArray,
    }

    successDataHandler(res, 'success', finallyText);
  } catch (err) {
    return next(appError(400, 'request_failed', next, 1003));
  }
}

exports.answerTest = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader, next)

    const {
      file,
      _id
    } = req.body;
    let answer = await Text.findOne({
      _id: _id,
    })

    successDataHandler(res, answer.file === file ? 'answer_success' : 'answer_failed', answer.file);
  } catch (err) {
    return next(appError(400, 'request_failed', next, 1003));
  }
}