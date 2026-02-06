import mongoose from "mongoose";

// Order Schema
const orderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      inventoryItemId: mongoose.Schema.Types.ObjectId,
      productId: mongoose.Schema.Types.ObjectId,
      vatable: {
        type: Boolean,
        default: true
      }
    }
  ],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    sparse: true
  },
  payment: {
    method: {
      type: String,
      enum: ["cash", "gcash"],
      default: "cash",
      required: true
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    change: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "completed"
    }
  },
  type: {
    type: String,
    enum: ["Dine In", "Take Out"],
    default: "Dine In"
  },
  status: {
    type: String,
    enum: ["pending", "preparing", "ready", "served", "completed", "cancelled"],
    default: "pending"
  },
  orderNumber: {
    type: String,
    unique: true,
    default: function() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `ORD-${year}${month}${day}-${random}`;
    }
  },
  notes: {
    type: String,
    default: ''
  },
  tableNumber: {
    type: String,
    sparse: true
  },
  customerName: {
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate subtotal, tax, and total
orderSchema.pre('save', function() {
  // Calculate subtotal from items
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    // Calculate tax: 12% of vatable items only
    const vatableSubtotal = this.items.reduce((sum, item) => {
      // Check if item is vatable (default to true if not specified)
      const isVatable = item.vatable !== undefined ? item.vatable : true;
      return isVatable ? sum + (item.price * item.quantity) : sum;
    }, 0);
    
    this.tax = parseFloat((vatableSubtotal * 0.12).toFixed(2));
    
    // Calculate total
    this.total = parseFloat((this.subtotal + this.tax).toFixed(2));
  } else {
    // If no items, set all to 0
    this.subtotal = 0;
    this.tax = 0;
    this.total = 0;
  }
  
  return;
});

// Update inventory when order is completed
orderSchema.pre('save', async function() {
  if (this.isModified('status') && this.status === 'completed') {
    try {
      for (const item of this.items) {
        if (item.inventoryItemId) {
          const InventoryItem = mongoose.model('InventoryItem');
          const inventoryItem = await InventoryItem.findById(item.inventoryItemId);
          if (inventoryItem) {
            inventoryItem.currentStock -= item.quantity;
            await inventoryItem.save();
          }
        }
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  }
});

// Indexes
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ type: 1 });

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;