import mongoose from "mongoose";

// Simple Customer Schema
const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true
  },
  totalOrders: { 
    type: Number, 
    default: 0 
  },
  totalSpent: { 
    type: Number, 
    default: 0 
  },
  lastOrderDate: { 
    type: Date, 
    default: null 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

customerSchema.pre('save', function() {
  if (!this.customerId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.customerId = id;
  }
  return;
});

// Check if model already exists before creating it
export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);