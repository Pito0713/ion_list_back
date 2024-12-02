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

module.exports = { successHandler, successDataHandler };
