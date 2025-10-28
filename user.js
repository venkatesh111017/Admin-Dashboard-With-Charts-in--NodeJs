// user.js
const mongoose = require('./db');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user','manager','admin'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
