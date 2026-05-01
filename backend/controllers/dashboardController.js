import Subscription from '../models/Subscription.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id });

    let totalMonthlySpend = 0;
    let potentialWaste = 0;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    subscriptions.forEach(sub => {
      // Calculate monthly spend
      if (sub.billingCycle === 'monthly') {
        totalMonthlySpend += sub.cost;
      } else if (sub.billingCycle === 'yearly') {
        totalMonthlySpend += sub.cost / 12;
      }

      // Calculate potential waste
      // If last used more than 14 days ago, consider it waste
      if (sub.lastUsedDate < fourteenDaysAgo) {
        if (sub.billingCycle === 'monthly') {
          potentialWaste += sub.cost;
        } else if (sub.billingCycle === 'yearly') {
          potentialWaste += sub.cost / 12;
        }
      }
    });

    const optimizationScore = totalMonthlySpend > 0 
      ? Math.round(((totalMonthlySpend - potentialWaste) / totalMonthlySpend) * 100) 
      : 100;

    // Calculate last 6 months spending trend
    const months = [];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        name: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        spend: 0
      });
    }

    subscriptions.forEach(sub => {
      const subCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
      const createdAt = new Date(sub.createdAt);
      
      months.forEach(m => {
        if (createdAt <= new Date(m.year, m.monthIndex + 1, 0)) {
           m.spend += subCost;
        }
      });
    });

    const spendingTrend = months.map(m => ({
      month: m.name,
      spend: Math.round(m.spend)
    }));

    res.status(200).json({
      success: true,
      data: {
        totalSubscriptions: subscriptions.length,
        totalMonthlySpend: Number(totalMonthlySpend.toFixed(2)),
        potentialWaste: Number(potentialWaste.toFixed(2)),
        optimizationScore,
        spendingTrend
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
