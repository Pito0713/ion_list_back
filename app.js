var createError = require('http-errors'); // 用於創建 HTTP 錯誤
var express = require('express'); // 引入 Express 框架
var path = require('path'); // 處理路徑相關的操作
var cookieParser = require('cookie-parser'); // 解析 Cookie
var logger = require('morgan'); // HTTP 請求日誌工具
const bodyParser = require('body-parser'); // 解析請求體（body）
const cors = require('cors'); // 解決跨域請求問題

var indexRouter = require('./routes/index'); // 引入路由

var app = express(); // 創建 Express 應用

// 捕捉未處理的例外，防止應用崩潰
process.on('uncaughtException', (err) => {
  console.error(err.name);
  console.error(err.message);
  console.error(err.stack);
  process.exit(1); // 強制終止應用，避免服務不穩定
});

require('./connections'); // 連接資料庫

// 設定模板引擎（這裡使用 EJS）
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 使用中介軟體（Middleware）
app.use(logger('dev')); // 使用 Morgan 記錄請求日誌
app.use(cors()); // 啟用 CORS，允許跨域請求
app.use(express.json()); // 解析 JSON 格式的請求體
app.use(express.urlencoded({ extended: false })); // 解析 URL 編碼格式的請求體
app.use(cookieParser()); // 解析請求中的 Cookie
app.use(express.static(path.join(__dirname, 'public'))); // 設定靜態文件目錄
app.use(bodyParser.json()); // 解析 JSON 請求體（與 express.json 功能類似，可合併）
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL 編碼格式的請求體

// 設定路由
app.use('/', indexRouter);

// 404 錯誤處理：找不到路由時回應 JSON 錯誤信息
app.use(function (req, res, next) {
  res.status(404).json({
    status: 'false',
    message: '您的路由不存在',
  });
});


// 通用錯誤處理中介軟體
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500; // 若無指定錯誤狀態碼，預設為 500（內部伺服器錯誤）
  const errorStatusCode = err.errorStatusCode || null; // 取得自定義錯誤碼

  res.status(statusCode).json({
    message: err.message,
    statusCode,
    errorStatusCode, // 回傳自定義錯誤碼
  });
});

// 捕捉未處理的 Promise 錯誤，防止應用崩潰
process.on('unhandledRejection', (err, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', err);
});

module.exports = app; // 匯出 Express 應用，供其他檔案（如 server.js）使用
