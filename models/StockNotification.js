import mongoose from 'mongoose';

const stockNotificationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  notificationType: {
    type: String,
    enum: ['out_of_stock', 'low_stock', 'restock', 'transfer'],
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  minStock: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'ignored'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const StockNotification = mongoose.models.StockNotification || 
  mongoose.model('StockNotification', stockNotificationSchema);