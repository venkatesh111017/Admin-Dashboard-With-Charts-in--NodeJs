const express = require('express');
const router = express.Router();
const User = require('../../user');
const Sale = require('../Sale');
const View = require('../View');

router.get('/', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSales = await Sale.aggregate([{ $group: { _id: null, revenue: { $sum: "$amount" }, count: { $sum: 1 } } }]);
    const totalViews = await View.countDocuments();

    res.json({
      ok: true,
      totals: {
        users: totalUsers,
        revenue: totalSales[0]?.revenue || 0,
        orders: totalSales[0]?.count || 0,
        views: totalViews
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
