const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    account: {
      type: String,
    },
    password: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    token: {
      type: String,
    },
    userName: {
      type: String,
    },
    birth: {
      type: String || Date,
    },
    phone: {
      type: Number,
    },
    address: {
      type: String,
    },
    mail: {
      type: String,
    },
    photo: {
      type: String,
    },
    city: {
      type: String,
    },
    town: {
      type: String,
    },
    coupon: {
      type: Array,
    },
    oldPassWord: {
      type: String,
    },
    newPassWord: {
      type: String,
    },
    newPassWordAgain: {
      type: String,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const userFront = mongoose.model('userFront', userSchema);

module.exports = userFront;
