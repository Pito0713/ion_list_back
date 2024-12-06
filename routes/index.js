var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');
const text = require('../controllers/text.controller');
const multer = require('multer');


const handleErrorAsync = require('../server/handleErrorAsync');
// user
// 註冊
router.post('/register', handleErrorAsync(userController.register));
// 登入
router.post('/login', handleErrorAsync(userController.login));

// text
// 新增
router.post('/addText', handleErrorAsync(text.addText));
// 搜尋
router.post('/searchText', handleErrorAsync(text.searchText));
// upload editText
router.post('/editText', handleErrorAsync(text.editText));
//


// text
router.post('/textTest', handleErrorAsync(text.textTest));
router.post('/answerTest', handleErrorAsync(text.answerTest));


module.exports = router;
