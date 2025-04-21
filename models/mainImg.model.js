const mongoose = require('mongoose');
const mainImgSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    img: {
      type: String,
    },
    isActive: {
      type: Boolean,
    },
    category: {
      type: String,
    }
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const MainImg = mongoose.model('mainImg', mainImgSchema);

module.exports = MainImg;
