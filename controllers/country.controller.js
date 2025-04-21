const Country = require('../models/country.model');
const { successHandler } = require('../server/handle');
const { appError } = require('../server/appError');


// 取得鄉鎮
exports.allCountry = async (req, res, next) => {
  try {
    const allCountry = await Country.find({});
    if (!['', null, undefined].includes(allCountry)) {
      successHandler(res, 'success', allCountry[0]);
    }
  } catch (err) {
    return next(appError(400, 'request_failed', next));
  }
};
