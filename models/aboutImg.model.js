const mongoose = require('mongoose');
const aboutImgSchema = new mongoose.Schema(
  {
    img: {
      type: String,
    },
    isActive: {
      type: Boolean,
    },
    id: {
      type: String,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const AboutImg = mongoose.model('aboutImg', aboutImgSchema);

module.exports = AboutImg;
