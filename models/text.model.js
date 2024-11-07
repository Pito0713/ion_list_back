const text = require('body-parser/lib/types/text');
const mongoose = require('mongoose');
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
  },
  {
    versionKey: false,
  }
);

const Text = mongoose.model('text', textSchema);
module.exports = Text;
