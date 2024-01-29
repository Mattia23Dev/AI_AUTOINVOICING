const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  stripe_id: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  tokenExpiration: {
    type: Date,
  },
  companies: {
    type: Array,
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
