const { successStatusHandler, successDataHandler, successDataHandlerTotal } = require('../server/handle');
const Text = require('../models/text.model');
const User = require('../models/user.model');
const Grammar = require('../models/grammar.model');
const appError = require('../server/appError');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
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

/* ---- 新增單字
  新增 Text 文本資料
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.addText = async (req, res, next) => {
  try {
    const { file, inputs, fileTranslate, translation, fileHiragana } =
      req.body;

    // 抓 client 表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token, return token
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)
    let tags = req.body?.['tags[]']

    await Text.create({
      file: file, // input file <String>
      fileTranslate: fileTranslate,  // input file translation <String>
      fileHiragana: fileHiragana, // input file Hiragana <String>
      inputs: inputs, // extra inputs <String>
      translation: translation, // sentence or translation <String>
      token: userCheck?.token, // auth token <String> *required
      tags: tags, // tags <Array>
      date: Date.now(),
      isShowTop: false, // default data: false
      updateDate: '', // for updating date
    });
    successStatusHandler(res, 'success');
  } catch (err) {
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
};

/* ----  單字搜尋
  搜尋 Text 文本資料, 並可模糊搜尋 searchValue 對應字
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.searchText = async (req, res, next) => {
  try {
    // 抓表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token, return token
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)

    /*@param { String } searchValue
      @param { Number } pageNumber
      @param { Number } pageSize
      @param { String } sortValue*/
    const { searchValue, pageNumber, pageSize, sortValue } = req.query;

    let target = {
      token: userCheck?.token,
    }

    let orFilter = [];

    // 如果有 searchValue，將 file 和 translation 合併條件篩選
    if (searchValue) {
      orFilter.push(// or 跟其中相關值都撈出來
        { file: { $regex: searchValue } },
        { translation: { $regex: searchValue } }
      );
    }
    if (orFilter.length > 0) {
      target = { ...target, $or: orFilter };
    }
    if (req.query?.tags?.length > 0) {
      target.tags = { $in: req.query.tags } // tags 陣列中包含任一個匹配值
    }

    /* sort 定義結果集排序順序, 1:正序  -1:倒序
      若不指定，則預設為 1，即正序排序
      若要反轉排序，可以設置為 -1，即倒序排序
      若要多重排序，可以多次設置 sort 屬性，例如：
      sort: { field1: 1, field2: -1 }
      這樣，field1 按正序排序，field2 按逆序排序
    */
    let currentPage = pageNumber - 1

    /* updateDate 更新日期 / isShowTop: 重點置頂*/
    let sortValueTarget = {}
    switch (sortValue) {
      case 'last_updated_reverse':
        sortValueTarget = { updateDate: 1, date: 1, }
        break;
      case 'last_updated_forward':
        sortValueTarget = { updateDate: -1, date: -1, }
        break;
      default:
        sortValueTarget = { isShowTop: -1, date: -1, }
        break;
    }

    // find 條件篩選
    const searchTarget = await Text.find(target) // 導入 條件篩選
      .sort(sortValueTarget)
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

/* ----  修改單字
  修改指定 _id Text 文本資料
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.editText = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader)

    const {
      file,
      fileTranslate,
      fileHiragana,
      inputs,
      translation,
      _id
    } = req.body;
    let tags = req.body?.['tags[]']
    await Text.updateOne({ _id: _id }, {
      file: file,
      fileTranslate: fileTranslate,
      fileHiragana: fileHiragana,
      inputs: inputs,
      translation: translation,
      tags: tags,
      updateDate: Date.now(),
    })

    // if (targetUpdateOne.upsertedId) {
    //   successStatusHandler(res, 'success');
    //   return
    // }

    successStatusHandler(res, 'success');
  } catch (err) {
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
}

/* ---- 單字是否置頂
  指定 _id 單筆 Text 文本資料庫修改 isShowTop param 
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
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
    //   successStatusHandler(res, 'success');
    //   return
    // }

    successStatusHandler(res, 'success');
  } catch (err) {
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
}


/* ---- 刪除單個單字文本
  Text 文本資料庫刪除指定 _id 資料
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.deleteOneText = async (req, res, next) => {
  try {
    // 抓表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader, next)

    // @param {String} _id
    const { _id } = req.query;

    let targetDelete = await Text.deleteOne({ _id: _id })
    /*@acknowledged: <Boolean> // 資料庫接收到並處理了刪除請求,  
      @deletedCount: <Number> //  符合刪除條件的筆數*/
    if (targetDelete?.deletedCount > 0) successStatusHandler(res, 'success');
    else return next(appError(404, 'resource_not_found', next, 1008));

  } catch (err) {
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
}

/* ---- 測驗題目
  從DB資料庫中 隨機取得一個的 Text 文本, 並從 Text 中隨機挑選 3 筆資料
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.textQuiz = async (req, res, next) => {
  try {
    // 抓表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token , return token
    const authHeader = req.headers['authorization'];
    let userCheck = await authCheck(authHeader, next)

    const callRandomTest = (() => {
      /* ---- 閉包
        使用閉包私有化 time 計算次數
        aggregate 超過 3 次回傳請求錯誤
      */
      let time = 0
      return async () => {
        if (time >= 3) { // check 3 time
          console.error("失敗次數超過限制");
          return next(appError(400, 'no_more_data', next, 1003));
        }

        // 單字題目篩選
        const textGroup = async () => {
          const originalRandomTest = await Text.aggregate([
            {
              $match: { // 找出符合的 {token, translation}
                token: userCheck?.token, // match：user token
                translation: { $exists: true, $ne: "" } // match：user: 必須存在(exists)且不為(ne)空值
              }
            },
            { $sample: { size: 1 } } // 隨機選取符合條件的 1 筆
          ])
          // 檢查替換前後文是否有被調整
          if (originalRandomTest.length > 0) {
            const replacedString = originalRandomTest[0]?.translation.replace(`${originalRandomTest[0].file}`, `()`)
            if (originalRandomTest[0].translation === replacedString) {
              console.log("替換未發生，originalRandomTest 沒有匹配的內容。");
              time++; // 失敗增加計數
              return callRandomTest() // 遞迴重新call
            } else {
              return {
                type: 'text',
                quiz: originalRandomTest
              }
            }
          }
        }

        // 文法題目篩選
        const grammarGroup = async () => {
          const originalRandomTest = await Grammar.aggregate([
            {
              $match: { // 找出符合的 {token, translation}
                token: userCheck?.token, // match：user token
                sentenceInput: { $exists: true, $ne: "" } // match：user: 必須存在(exists)且不為(ne)空值
              }
            },
            { $sample: { size: 1 } } // 隨機選取符合條件的 1 筆
          ])
          // 檢查替換前後文是否有被調整
          if (originalRandomTest.length > 0) {
            const replacedString = originalRandomTest[0]?.sentenceInput.replace(`${originalRandomTest[0].grammarInput}`, `()`)
            if (originalRandomTest[0].sentenceInput === replacedString) {
              console.log("替換未發生，originalRandomTest 沒有匹配的內容。");
              time++; // 失敗增加計數
              return callRandomTest() // 遞迴重新call
            } else {
              return {
                type: 'grammar',
                quiz: originalRandomTest
              }
            }
          }
        }

        let randomNum = Math.floor(Math.random() * 100) % 2  // 隨機分配文本跟文法題型分配
        return randomNum === 0 ? grammarGroup() : textGroup()
      };
    })()

    // 隨機題目
    const randomQuiz = await callRandomTest()

    if (!randomQuiz) {
      return successDataHandler(res, 'no_more_data', null);
    }

    // 與題目 tag 相關隨機取 3 個不重複的
    const randomQuizGroup = randomQuiz.type === 'grammar' ?
      await Grammar.aggregate([
        {
          $match: { // 找出符合的 {token, tags, file}
            token: userCheck?.token, // match：user token
            grammarInput: { $ne: randomQuiz.quiz[0].grammarInput } //  排除 file: { randomQuiz[0].file } 的值
          }
        },
        { $sample: { size: 3 } } // 隨機選取符合條件的 3 筆
      ]) :
      await Text.aggregate([
        {
          $match: { // 找出符合的 {token, tags, file}
            token: userCheck?.token, // match：user token
            tags: { $all: randomQuiz.quiz[0].tags }, // match： all date's tag include { randomQuiz[0].tags }
            file: { $ne: randomQuiz.quiz[0].file } //  排除 file: { randomQuiz[0].file } 的值
          }
        },
        { $sample: { size: 3 } } // 隨機選取符合條件的 3 筆
      ])

    // 如果 tag 隨機撈出資料少於3筆, 回傳空物件
    if (3 > randomQuizGroup.length) {
      return successDataHandler(res, 'success', null);
    }

    randomQuizGroup.push(randomQuiz.quiz[0]) // 合併題目

    // 隨機打亂順序
    function randomArray(array) {
      const copyArray = [...array]; // 淺拷貝資料
      for (let i = copyArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1)); // random number
        [copyArray[i], copyArray[randomIndex]] = [copyArray[randomIndex], copyArray[i]]; // JS解構賦值 前後 data 交換
      }
      return copyArray;
    }

    // map 提取所需需要的資料
    const randomTagTestArray =
      randomQuiz?.type === 'grammar' ?
        randomQuizGroup.map((item) => {
          return { file: item.grammarInput, _id: item._id }
        }) :
        randomQuizGroup.map((item) => {
          return { file: item.file, _id: item._id }
        })

    // 最終題目文本 (含題目跟問題選項)
    const finallyText = {
      _id: randomQuiz.quiz[0]._id, // 題目 object id
      question: randomQuiz?.type === 'grammar' ?
        randomQuiz.quiz[0].sentenceInput.replace(`${randomQuiz.quiz[0].grammarInput}`, `()`) :
        randomQuiz.quiz[0].translation.replace(`${randomQuiz.quiz[0].file}`, `()`), // 移除題目所對應單詞的位置
      randomTagTestArray: randomArray(randomTagTestArray), // 亂數隨機打亂資料
      type: randomQuiz?.type
    }

    successDataHandler(res, 'success', finallyText);
  } catch (err) {
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
}

/* ---- 測驗題目答案驗證
  從DB資料庫中找出正確答案資料進行對比, 
  並且也提取出各個題目選項的翻譯資料進行資料回傳
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.answerQuiz = async (req, res, next) => {
  try {
    // 抓表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader, next)

    /*@param { String } file
    @param { String } _id
    @param { JSONString } extraId*/
    const { file, _id, extraId, type } = req.query;

    // findOne 找出該 req.body._id 題目的值
    // 該回傳 file 為 **正確答案**
    let correctAnswer = type === 'text' ?
      await Text.findOne(
        { _id: _id },
        { file: 1 }
      ) :
      await Grammar.findOne(
        { _id: _id },
        { grammarInput: 1 }
      );


    // find 找出題目中所有選項的對應 _id 回傳值
    let answerFile = type === 'grammar' ?
      await Grammar.find(
        { _id: { $in: JSON.parse(extraId).map(item => new ObjectId(item._id)) } }, // 尋找 in 內部 ObjectId 的值
        { // 需要顯示的的 1 , 不需要的 0
          grammarInput: 1,
          grammarTransInput: 1,
        }
      ) :
      await Text.find(
        { _id: { $in: JSON.parse(extraId).map(item => new ObjectId(item._id)) } }, // 尋找 in 內部 ObjectId 的值
        { // 需要顯示的的 1 , 不需要的 0
          file: 1,
          fileTranslate: 1,
          fileHiragana: 1
        }
      )
    let targetFile = type === 'grammar' ? correctAnswer.grammarInput : correctAnswer.file

    successDataHandler(res,
      targetFile === file ? 'answer_success' : 'answer_failed', // correctAnswer 正確答案是不是與 使用者提交的 file 是否相同
      {
        correctAnswer: correctAnswer, // 回傳正確答案
        answerFile: answerFile, // 回傳 題目選項的 file 值
        type: type,
      });
  } catch (err) {
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
}

/* ---- 每日測驗題目
  紀錄每日測驗的題目, 並且按param 提供順序
  進來排列
  @param req {Object} client Request
  @param res {Object} sever Response
  @param next {Function} Express Middleware callback function */
exports.answerDaily = async (req, res, next) => {
  try {
    // 抓表頭 authorization, 
    // 自定義 authCheck 判斷是否有 token
    const authHeader = req.headers['authorization'];
    await authCheck(authHeader, next)

    // @param {String} _id
    const { selectId } = req.query;

    const selectIdGroup = JSON.parse(selectId)
    let dailyTarget = await Promise.all(selectIdGroup.map(async (item) => {
      let answerFile = item.type === 'grammar' ?
        await Grammar.find(
          { _id: item._id }, // 尋找 in 內部 ObjectId 的值
        ) :
        await Text.find(
          { _id: item._id }, // 尋找 in 內部 ObjectId 的值
        )
      // 給結果加上 type 屬性
      return { ...answerFile[0]._doc, type: item.type }
    }))

    if (selectIdGroup?.length > 0) successDataHandler(res, 'success', dailyTarget);
    else return next(appError(404, 'daily_resource_not_found', next, 1008));

  } catch (err) {
    console.error(err);
    return next(appError(400, 'request_failed', next, 1003));
  }
}