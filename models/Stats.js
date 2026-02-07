import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true,
    unique: true, // Prevents duplicate entries for same date
  },
  totalOrders: { 
    type: Number, 
    default: 0 
  },
  totalOrdersValue: { 
    type: Number, 
    default: 0 
  },
  completedOrders: { 
    type: Number, 
    default: 0 
  },
  pendingOrders: { 
    type: Number, 
    default: 0 
  },
  cancelledOrders: { 
    type: Number, 
    default: 0 
  },
  averageOrderValue: { 
    type: Number, 
    default: 0 
  },
  productsSold: { 
    type: Number, 
    default: 0 
  },
  topSellingProducts: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
      },
      productName: String,
      quantitySold: Number,
      revenue: Number
    }
  ],
  lowStockProducts: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
      },
      productName: String,
      currentStock: Number,
      minStock: Number
    }
  ],
  customerMetrics: {
    newCustomers: { type: Number, default: 0 },
    returningCustomers: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 }
  },
  // Daily metrics (for today's specific data)
  dailyMetrics: {
    ordersToday: { type: Number, default: 0 },
    revenueToday: { type: Number, default: 0 },
    productsSoldToday: { type: Number, default: 0 }
  },
  // For monthly/yearly aggregation
  month: { type: Number }, // 1-12
  year: { type: Number },
  periodType: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'yearly'], 
    default: 'daily' 
  }
}, {
  timestamps: true
});

// Index for date range queries
statsSchema.index({ date: 1 });
statsSchema.index({ month: 1, year: 1 });

export const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);