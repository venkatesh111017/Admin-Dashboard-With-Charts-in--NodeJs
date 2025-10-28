const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  amount: Number,
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Sale', saleSchema);
