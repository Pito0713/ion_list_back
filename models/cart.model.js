const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    token: {
      type: String,
    },
    count: {
      type: Number,
    },
    page: {
      type: Number,
    },
    pagination: {
      type: Number,
    },
  },
  {
    versionKey: false,
  }
);

const cart = mongoose.model('cart', cartSchema);

module.exports = cart;
