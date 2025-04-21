const mongoose = require('mongoose');
const countrySchema = new mongoose.Schema(
  {},
  {
    versionKey: false,
  }
);
const Country = mongoose.model('countries', countrySchema);

module.exports = Country;
