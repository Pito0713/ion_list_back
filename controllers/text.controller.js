const { successHandler, successDataHandler, successDataHandlerTotal } = require('../server/handle');
const Text = require('../models/text.model');
const User = require('../models/user.model');
const appError = require('../server/appError');
const jwt = require('jsonwebtoken');
/* 自定義function 確認 JWT token
  props : {
    _tokenVale : <String>  // JWT token
    _next : <Function>  // Express send next middleware callback function
  }
*/
const authCheck = async (_tokenVale, _next) => {
  let userAccount = null

  // 確保 Authorization 標頭存在 Bearer token 格式
  if (!_tokenVale || !_tokenVale?.startsWith('Bearer ')) {
    return _next(appError(401, 'Unauthorized', _next, 1001));
  }

  // 抓 JWT 並且解碼後去搜尋是否有符合的 account
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

// 新增文字
// @param req {Object} client Request
// @param res {Object} sever Response
// @param next {Function} Express Middleware callback function
exports.addText = async (req, res, next) => {
  try {
    const { file, inputs, fileTranslate, translation } =
      req.body;

    // 抓 client 表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token, return token
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)
    let tags = req.body?.['tags[]']

    await Text.create({
      file: file, // input file <String>
      fileTranslate: fileTranslate,  // input file translation <String>
      inputs: inputs, // extra inputs <String>
      translation: translation, // sentence or translation <String>
      token: userCheck?.token, // auth token <String> *required
      tags: tags, // tags <Array>
      date: Date.now(),
      isShowTop: false, // default data: false
    });
    successHandler(res, 'success');
  } catch (err) {
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
};

// 取得
exports.searchText = async (req, res, next) => {
  try {
    // 抓表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token, return token
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)

    const { searchValue, pageNumber, pageSize } = req.body;
    // @param { String } searchValue
    // @param { Number } pageNumber
    // @param { Number } pageSize
    let target = {
      token: userCheck?.token,
    }

    // 如果有 searchValue，將 file 和 translation 合併條件篩選
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
    let currentPage = pageNumber - 1
    // find 條件篩選
    const searchTarget = await Text.find(target) // 導入 條件篩選
      .sort({ isShowTop: -1, date: -1, })
      .skip(currentPage * pageSize) // skip：跳過的筆數，計算公式為 pageNumber * pageSize。 ex: 取第11筆 跳過前面10筆
      .limit(pageSize) // 限制 幾筆

    // aggregate 用於條件篩選，返回比數結果。
    const searchTargetTotalCount = await Text.aggregate([
      { $match: target },    // 篩選條件
      { $count: "totalCount" } // 計算符合條件的總數，字段名稱為 totalCount
    ]);

    // reset searchTarget data romover item token
    const noneToken = searchTarget.map(item => {
      let newItem = { ...item._doc };  // 淺拷貝資料
      delete newItem.token;      // 刪除 token 屬性
      return newItem;
    });

    successDataHandlerTotal(res, 'success', noneToken,
      searchTargetTotalCount.length > 0 ? searchTargetTotalCount[0].totalCount : 0
    );
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
}

// 修正
exports.deleteOneText = async (req, res, next) => {
  try {
    // 抓表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader, next)

    // @param {String} _id
    const {
      _id
    } = req.body;

    let targetDelete = await Text.deleteOne({ _id: _id })
    /* 
      targetDelete :{ 
        acknowledged: <Boolean> // 資料庫接收到並處理了刪除請求,  
        deletedCount: <Number> //  符合刪除條件的筆數
    }*/
    if (targetDelete?.deletedCount > 0) successHandler(res, 'success');
    else return next(appError(404, 'resource_not_found', next, 1008));

  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
}