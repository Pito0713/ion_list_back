const mongoose = require('mongoose');
const platformSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    label: {
      type: String,
    },
    rate: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    token: {
      type: String,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const platform = mongoose.model('platform', platformSchema);

module.exports = platform;
