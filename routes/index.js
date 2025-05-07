var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');
const text = require('../controllers/text.controller');
const grammar = require('../controllers/grammar.controller');
const handleErrorAsync = require('../server/handleErrorAsync');

// user
// 註冊
router.post('/register', handleErrorAsync(userController.register));
// 登入
router.post('/login', handleErrorAsync(userController.login));

// text
// 單字搜尋
router.get('/searchText', handleErrorAsync(text.searchText));
// 新增文字
router.post('/addText', handleErrorAsync(text.addText));
// 修改單字
router.post('/editText', handleErrorAsync(text.editText));
// 單字是否置頂
router.post('/editTextShowTop', handleErrorAsync(text.editTextShowTop));
// 刪除單個單字文本
router.delete('/deleteOneText', handleErrorAsync(text.deleteOneText));
// 測驗題目
router.get('/textQuiz', handleErrorAsync(text.textQuiz));
// 測驗題目答案驗證
router.get('/answerQuiz', handleErrorAsync(text.answerQuiz));
// 每日測驗題目
router.get('/answerDaily', handleErrorAsync(text.answerDaily));

// grammar
// 文法搜尋
router.get('/searchGrammar', handleErrorAsync(grammar.searchGrammar));
// 新增文法
router.post('/addGrammar', handleErrorAsync(grammar.addGrammar));
// 修改文法
router.post('/editGrammar', handleErrorAsync(grammar.editGrammar));
// 刪除單個文法
router.delete('/deleteOneGrammar', handleErrorAsync(grammar.deleteOneGrammar));
// 文法是否置頂
router.post('/editGrammarShowTop', handleErrorAsync(grammar.editGrammarShowTop));

module.exports = router;
