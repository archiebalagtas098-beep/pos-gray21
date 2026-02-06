import mongoose from "mongoose";

// Stats Schema
const StatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  
  totalOrders: {
    type: Number,
    default: 0
  },
  
  totalRevenue: {
    type: Number,
    default: 0
  },
  
  totalCustomers: {
    type: Number,
    default: 0
  },
  
  itemsSold: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update stats
StatsSchema.statics.updateStats = async function(orderData) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let stats = await this.findOne({ date: today });
  
  if (!stats) {
    stats = new this({ date: today });
  }
  
  stats.totalOrders += 1;
  stats.totalRevenue += orderData.total || 0;
  stats.totalCustomers += orderData.isNewCustomer ? 1 : 0;
  
  const itemsSold = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
  stats.itemsSold += itemsSold;
  
  await stats.save();
  return stats;
};

// Get today's stats
StatsSchema.statics.getTodayStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = await this.findOne({ date: today });
  
  if (!stats) {
    return new this({ date: today });
  }
  
  return stats;
};

export const Stats = mongoose.model("Stats", StatsSchema);