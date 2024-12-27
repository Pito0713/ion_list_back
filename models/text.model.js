const text = require('body-parser/lib/types/text');
const mongoose = require('mongoose');
const { token } = require('morgan');
const textSchema = new mongoose.Schema(
  {
    file: {
      type: String,
    },
    fileTranslate: {
      type: String,
    },
    fileHiragana: {
      type: String,
    },
    inputs: {
      type: String,
    },
    translation: {
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
    tags: {
      type: Array,
    },
    date: {
      type: Date,
    },
    isShowTop: {
      type: Boolean,
    },
  },
  {
    versionKey: false,
    _id: true // 確保 _id 是啟用的 *默認設置
  }
);

const Text = mongoose.model('text', textSchema);
module.exports = Text;
