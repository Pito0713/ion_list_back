const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
  {
    describe: {
      type: String,
    },
    searchText: {
      type: String,
    },
    category: {
      type: String,
    },
    page: {
      type: String,
    },
    pagination: {
      type: String,
    },
    price: {
      type: String,
    },
    remark: {
      type: String,
    },
    token: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    quantity: {
      type: String,
    },
    isSort: {
      type: Boolean,
    },
  },
  {
    versionKey: false,
  }
);

const Product = mongoose.model('product', productSchema);
module.exports = Product;
