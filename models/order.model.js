const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    token: {
      type: String,
    },
    CheckOutList: {
      type: Object,
    },
    ProductList: {
      type: Array,
    },
    selectedOption: {
      type: String,
    },
    infoData: {
      type: Object,
    },
    totalPrice: {
      type: String,
    },
    totalQuantity: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const order = mongoose.model('order', orderSchema);

module.exports = order;
