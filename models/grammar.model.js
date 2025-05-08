const mongoose = require('mongoose');
const { token } = require('morgan');
const grammarSchema = new mongoose.Schema(
  {
    grammarInput: {
      type: String,
    },
    grammarTransInput: {
      type: String,
    },
    sentenceInput: {
      type: String,
    },
    extraTextInputs: {
      type: String,
    },
    pageNumber: {
      type: Number,
    },
    pageSize: {
      type: Number,
    },
    searchValue: {
      type: String,
    },
    token: {
      type: String,
    },
    date: {
      type: Date,
    },
    isShowTop: {
      type: Boolean,
    },
    updateDate: {
      type: Date,
    },
  },
  {
    versionKey: false,
    _id: true // 確保 _id 是啟用的 *默認設置
  }
);

const Grammar = mongoose.model('grammar', grammarSchema);
module.exports = Grammar;
