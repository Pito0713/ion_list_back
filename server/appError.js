/* -- ****************************************
  ┌───────────────────────────────────────────┐  
  │             EXTRA SEVER -- Aoi            │
  └───────────────────────────────────────────┘ 
-- **************************************** */

const appError = (httpStatus, errMessage, next) => {
  const error = new Error(errMessage);
  error.statusCode = httpStatus;
  error.isOperational = true;
  next(error);
};

// ============================================

const appErrorStatusCode = (httpStatus, errMessage, next, errorStatusCode) => {
  const error = new Error(errMessage); // 創建 Error
  error.statusCode = httpStatus; // HTTP 狀態碼
  error.errorStatusCode = errorStatusCode; // 自定義 error Code
  error.isOperational = true;
  next(error);
};

module.exports = { appError, appErrorStatusCode };
