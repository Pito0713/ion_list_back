const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    account: {
      type: String,
    },
    password: {
      type: String,
    },
    token: {
      type: String,
    },
    userName: {
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
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
