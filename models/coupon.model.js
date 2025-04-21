const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema(
  {
    describe: {
      type: String,
    },
    discount: {
      type: String,
    },
    remark: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    searchText: {
      type: String,
    },
    page: {
      type: Number,
    },
    pagination: {
      type: Number,
    },
    user: {
      type: Array,
    },
    userEd: {
      type: Array,
    },
    count: {
      type: String,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
