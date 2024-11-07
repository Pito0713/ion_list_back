const successHandler = (res, message, data = []) => {
  res.status(200).json({
    status: "success",
    message: message,
    data: data,
  });
};

// 有total參數
const successTotalHandler = (res, message, data = [], total) => {
  res.status(200).json({
    status: "success",
    message: message,
    data: data,
    total: total,
  });
};

const errorHandler = (res, message, code = 400) => {
  res.status(code).json({
    status: "false",
    message: message,
  });
};

module.exports = { successHandler, errorHandler, successTotalHandler };
