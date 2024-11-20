const text = require('body-parser/lib/types/text');
const mongoose = require('mongoose');
const { token } = require('morgan');
const textSchema = new mongoose.Schema(
  {
    file: {
      type: String,
    },
    inputs: {
      type: String,
    },
    translation: {
      type: String,
    },
    searchValue: {
      type: String,
    },
    token: {
      type: String,
    },
    tags: {
      type: Array,
    }
  },
  {
    versionKey: false,
  }
);

const Text = mongoose.model('text', textSchema);
module.exports = Text;
