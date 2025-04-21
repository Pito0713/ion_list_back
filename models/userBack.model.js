const mongoose = require('mongoose');
const userBackSchema = new mongoose.Schema(
  {
    account: {
      type: String,
    },
    password: {
      type: String,
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    id: {
      type: String,
    },
    token: {
      type: String,
    },
    permission: {
      type: String,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const UserBack = mongoose.model('UserBack', userBackSchema);

module.exports = UserBack;
