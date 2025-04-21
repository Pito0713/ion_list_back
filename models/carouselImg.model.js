const mongoose = require('mongoose');
const carouselImgSchema = new mongoose.Schema(
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

const CarouselImg = mongoose.model('carouselImg', carouselImgSchema);

module.exports = CarouselImg;
