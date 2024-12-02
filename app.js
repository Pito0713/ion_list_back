var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

var indexRouter = require('./routes/index');

var app = express();

process.on('uncaughtException', (err) => {
  console.error(err.name);
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
});

require('./connections');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', indexRouter);

// 404
app.use(function (req, res, next) {
  res.status(404).json({
    status: 'false',
    message: '您的路由不存在',
  });
});

const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    console.error('出現重大錯誤', err);
    res.status(500).json({
      status: 'error',
      message: '系統錯誤，請恰系統管理員',
    });
  }
};

const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorStatusCode = err.errorStatusCode || null; // 獲取自定義錯誤碼

  // if (process.env.NODE_ENV === 'dev') {
  //   return resErrorDev(err, res);
  // }
  // resErrorProd(err, res);

  res.status(statusCode).json({
    message: err.message,
    statusCode,
    errorStatusCode, // 回傳自定義錯誤碼
    // isOperational: err.isOperational,
  });
});

process.on('unhandledRejection', (err, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', err);
});

module.exports = app;
