import mongoose from "mongoose";

// Product Schema (for POS/menu items)
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      unique: true,
      index: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      index: true
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
      default: 0
    },
    stock: {
      type: Number,
      default: 50,
      min: 0
    },
    totalSoldCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0
    },
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      sparse: true
    },
    recipeIngredients: [{
      inventoryItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryItem"
      },
      quantity: {
        type: Number,
        default: 1,
        min: 0
      },
      unit: {
        type: String,
        enum: ["g", "kg", "ml", "L", "pcs", "cups", "tbsp", "tsp"],
        default: "pcs"
      }
    }],
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available"
    },
    image: {
      type: String,
      default: "default_food.jpg"
    },
    description: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastSoldDate: {
      type: Date,
      sparse: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for average selling price
productSchema.virtual('averagePrice').get(function() {
  return this.totalSoldCount > 0 ? this.totalRevenue / this.totalSoldCount : this.price;
});

// Index for common queries
productSchema.index({ category: 1, status: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model("Product", productSchema);
export default Product;