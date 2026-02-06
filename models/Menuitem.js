import mongoose from "mongoose";

// Check if model already exists to prevent OverwriteModelError
let MenuItem;

if (mongoose.models && mongoose.models.MenuItem) {
  // Model already exists, use it
  MenuItem = mongoose.models.MenuItem;
} else {
  // Create new model
  const menuItemSchema = new mongoose.Schema({
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 1
    },
    category: {
      type: String,
      required: true
    },
    currentStock: {
      type: Number,
      required: true,
      default: 100,
      min: 0
    },
    minStock: {
      type: Number,
      required: true,
      default: 20,
      min: 1
    },
    maxStock: {
      type: Number,
      required: true,
      default: 200,
      min: 10
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }, {
    timestamps: true
  });

  // Pre-save validation
  menuItemSchema.pre('save', function() {
    // Ensure maxStock > minStock
    if (this.maxStock <= this.minStock) {
      throw new Error('Maximum stock must be greater than minimum stock');
    }
    
    // Cap current stock at max
    if (this.currentStock > this.maxStock) {
      this.currentStock = this.maxStock;
    }
    
    // Ensure current stock is not negative
    if (this.currentStock < 0) {
      this.currentStock = 0;
    }
    
    return;
  });

  MenuItem = mongoose.model('MenuItem', menuItemSchema);
}

export { MenuItem };