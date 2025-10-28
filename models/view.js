const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
  path: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('View', viewSchema);
