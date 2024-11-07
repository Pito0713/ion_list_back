const mongoose = require("mongoose");

const checkMongoObjectId = mongoose.isObjectIdOrHexString;

module.exports = checkMongoObjectId;
