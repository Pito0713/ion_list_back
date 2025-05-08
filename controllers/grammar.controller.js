const { successHandler, successDataHandlerTotal } = require('../server/handle');
const Grammar = require('../models/grammar.model');
const User = require('../models/user.model');
const appError = require('../server/appError');
const jwt = require('jsonwebtoken');

/* ----- 自定義function 
  確認 client cookies JWT token
  @tokenVale : <String>  // JWT token
  @next : <Function>  // Express send next middleware callback function*/
const authCheck = async (_tokenVale, _next) => {
  let userAccount = null

  // 確保 Authorization 標頭存在 Bearer token 格式
  if (!_tokenVale || !_tokenVale?.startsWith('Bearer ')) {
    return _next(appError(401, 'Unauthorized', _next, 1001));
  }

  // 抓 JWT 並且解碼後去搜尋是否有符合的 account
  const token = _tokenVale && _tokenVale.split(' ')[1];
  userAccount = jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    let account = user?.account
    return await User.findOne({ account })
  })

  if (!userAccount) {
    return _next(appError(401, 'Unauthorized', _next, 1002));
  }

  return userAccount ? userAccount : null
}

/* ---- 新增文法
  新增 Grammar 文法資料
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.addGrammar = async (req, res, next) => {
  try {
    const { grammarInput, grammarTransInput, sentenceInput, extraTextInputs } = req.body;

    // 抓 client 表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token, return token
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)

    await Grammar.create({
      grammarInput: grammarInput, // input file <String>
      grammarTransInput: grammarTransInput,  // input file translation <String>
      extraTextInputs: extraTextInputs, // extra inputs <String>
      sentenceInput: sentenceInput, // sentence or translation <String>
      token: userCheck?.token, // auth token <String> *required
      date: Date.now(),
      isShowTop: false, // default data: false
      updateDate: '', // for updating date
    });
    successHandler(res, 'success');
  } catch (err) {
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
};

/* ----  文法搜尋
  搜尋 Grammar 文本資料, 並可模糊搜尋 searchValue 對應字
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.searchGrammar = async (req, res, next) => {
  try {
    // 抓表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token, return token
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)

    /*@param { String } searchValue
      @param { Number } pageNumber
      @param { Number } pageSize*/
    const { searchValue, pageNumber, pageSize } = req.query;

    let target = {
      token: userCheck?.token,
    }

    let orFilter = [];

    // 如果有 searchValue，將 grammarInput 和 sentenceInput 合併條件篩選
    if (searchValue) {
      orFilter.push(// or 跟其中相關值都撈出來
        { grammarInput: { $regex: searchValue } },
        { sentenceInput: { $regex: searchValue } }
      );
    }
    if (orFilter.length > 0) {
      target = { ...target, $or: orFilter };
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
    const searchTarget = await Grammar.find(target) // 導入 條件篩選
      .sort({ isShowTop: -1, date: -1, })
      .skip(currentPage * pageSize) // skip：跳過的筆數，計算公式為 pageNumber * pageSize。 ex: 取第11筆 跳過前面10筆
      .limit(pageSize) // 限制 幾筆

    // aggregate 用於條件篩選，返回比數結果。
    const searchTargetTotalCount = await Grammar.aggregate([
      { $match: target },    // 篩選條件
      { $count: "totalCount" } // 計算符合條件的總數，字段名稱為 totalCount
    ]);

    // reset searchTarget data remove item token
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

/* ----  修改文法
  修改指定 _id Grammar 文法資料
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.editGrammar = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader)

    const {
      grammarInput,
      grammarTransInput,
      sentenceInput,
      extraTextInputs,
      _id
    } = req.body;
    await Grammar.updateOne({ _id: _id }, {
      grammarInput: grammarInput,
      grammarTransInput: grammarTransInput,
      sentenceInput: sentenceInput,
      extraTextInputs: extraTextInputs,
      updateDate: Date.now(),
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

/* ---- 文法是否置頂
  指定 _id 單筆 Grammar 文法資料庫修改 isShowTop param 
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.editGrammarShowTop = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader, next)

    const {
      isShowTop,
      _id
    } = req.body;
    await Grammar.updateOne({ _id: _id }, {
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


/* ---- 刪除單個文法
  Grammar 文法資料庫刪除指定 _id 資料
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.deleteOneGrammar = async (req, res, next) => {
  try {
    // 抓表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader, next)

    // @param {String} _id
    const { _id } = req.query;

    let targetDelete = await Grammar.deleteOne({ _id: _id })
    /*@acknowledged: <Boolean> // 資料庫接收到並處理了刪除請求,  
      @deletedCount: <Number> //  符合刪除條件的筆數*/
    if (targetDelete?.deletedCount > 0) successHandler(res, 'success');
    else return next(appError(404, 'resource_not_found', next, 1008));

  } catch (err) {
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
}