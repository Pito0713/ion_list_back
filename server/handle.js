const successHandler = (res, message) => {
  res.status(200).json({
    status: 1,
    message: message,
  });
};

const successDataHandler = (res, message, data = null) => {
  res.status(200).json({
    status: 1,
    message: message,
    data: data,
  });
};

// include total count
const successDataHandlerTotal = (res, message, data = null, total) => {
  res.status(200).json({
    status: 1,
    message: message,
    data: data,
    total: total,
  });
};

module.exports = { successHandler, successDataHandler, successDataHandlerTotal };
