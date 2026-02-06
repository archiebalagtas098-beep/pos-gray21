import mongoose from "mongoose";
import bcrypt from "bcrypt";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB Atlas connected successfully');
    await initializeDefaultData();
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    process.exit(1);
  }
};

async function initializeDefaultData() {
  try {
    // First, drop the problematic index if it exists
    try {
      await mongoose.connection.collection('menuitems').dropIndex('itemName_1');
      console.log('✅ Dropped problematic menu item index');
    } catch (err) {
      // Index might not exist, that's ok
    }

    // Initialize default categories
    const defaultCategories = [
      "Rice Bowl Meals",
      "Hot Sizzlers",
      "Party Tray",
      "Drinks",
      "Coffee",
      "Milk Tea",
      "Frappe",
      "Snacks & Appetizer",
      "Budget Meals Served with Rice",
      "Specialties"
    ];
    
    for (const catName of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: catName },
        { name: catName },
        { upsert: true }
      );
    }
    
    // Initialize inventory categories (raw ingredients)
    const inventoryCategories = [
      "meat",
      "seafood",
      "produce",
      "dairy",
      "dry",
      "beverage",
      "packaging"
    ];
    
    // Initialize default inventory items with proper categories
    const defaultInventoryItems = [
      // Meat & Poultry
      { itemName: "Chicken", category: "meat", unit: "kg", currentStock: 10, minStock: 5 },
      { itemName: "Pork slices", category: "meat", unit: "kg", currentStock: 8, minStock: 5 },
      { itemName: "Pork belly", category: "meat", unit: "kg", currentStock: 5, minStock: 3 },
      { itemName: "Ground pork", category: "meat", unit: "kg", currentStock: 3, minStock: 2 },
      { itemName: "Beef shanks and marrow", category: "meat", unit: "kg", currentStock: 6, minStock: 4 },
      
      // Seafood
      { itemName: "Shrimp", category: "seafood", unit: "kg", currentStock: 4, minStock: 2 },
      { itemName: "Cream dory fillet", category: "seafood", unit: "kg", currentStock: 5, minStock: 3 },
      { itemName: "Smoked fish (tinapa)", category: "seafood", unit: "kg", currentStock: 2, minStock: 1 },
      { itemName: "Dried fish (tuyo)", category: "seafood", unit: "kg", currentStock: 3, minStock: 2 },
      
      // Dairy & Eggs
      { itemName: "Eggs", category: "dairy", unit: "pieces", currentStock: 50, minStock: 20 },
      { itemName: "Milk", category: "dairy", unit: "liters", currentStock: 10, minStock: 5 },
      { itemName: "Cheese", category: "dairy", unit: "kg", currentStock: 3, minStock: 2 },
      { itemName: "Butter", category: "dairy", unit: "kg", currentStock: 2, minStock: 1 },
      
      // Vegetables & Fruits
      { itemName: "Garlic", category: "produce", unit: "kg", currentStock: 5, minStock: 2 },
      { itemName: "Onion", category: "produce", unit: "kg", currentStock: 8, minStock: 5 },
      { itemName: "Carrots", category: "produce", unit: "kg", currentStock: 8, minStock: 5 },
      { itemName: "Cabbage", category: "produce", unit: "kg", currentStock: 6, minStock: 3 },
      { itemName: "Tomato", category: "produce", unit: "kg", currentStock: 4, minStock: 2 },
      
      // Dry Goods
      { itemName: "Soy sauce", category: "dry", unit: "liters", currentStock: 7, minStock: 3 },
      { itemName: "Cooking oil", category: "dry", unit: "liters", currentStock: 12, minStock: 5 },
      { itemName: "Sugar", category: "dry", unit: "kg", currentStock: 10, minStock: 5 },
      { itemName: "Salt", category: "dry", unit: "kg", currentStock: 3, minStock: 1 },
      { itemName: "Flour", category: "dry", unit: "kg", currentStock: 8, minStock: 4 },
      { itemName: "Jasmine rice", category: "dry", unit: "kg", currentStock: 25, minStock: 10 },
      
      // Beverages
      { itemName: "Sprite/7-Up", category: "beverage", unit: "liters", currentStock: 6, minStock: 3 },
      { itemName: "Branded soda (Coke, Sprite, Royal)", category: "beverage", unit: "liters", currentStock: 8, minStock: 4 },
      
      // Packaging
      { itemName: "Paper cups", category: "packaging", unit: "packs", currentStock: 5, minStock: 2 },
      { itemName: "Straws", category: "packaging", unit: "packs", currentStock: 8, minStock: 4 },
      { itemName: "Food containers", category: "packaging", unit: "packs", currentStock: 6, minStock: 3 },
      { itemName: "Plastic utensils", category: "packaging", unit: "packs", currentStock: 4, minStock: 2 },
      { itemName: "Napkins", category: "packaging", unit: "packs", currentStock: 10, minStock: 5 },
    ];
    
    // Insert or update default inventory items
    for (const item of defaultInventoryItems) {
      await InventoryItem.findOneAndUpdate(
        { itemName: item.itemName },
        { 
          itemName: item.itemName,
          itemType: 'raw',
          category: item.category,
          unit: item.unit,
          currentStock: item.currentStock,
          minStock: item.minStock,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }
    
    // Clear any existing menu items with null names
    try {
      const nullCount = await MenuItem.deleteMany({ itemName: null });
      if (nullCount.deletedCount > 0) {
        console.log(`🗑️ Cleared ${nullCount.deletedCount} menu items with null names`);
      }
    } catch (err) {
      console.log('ℹ️ No null menu items found');
    }
    
    // Initialize admin and staff users
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      const adminUser = new User({
        username: "admin",
        password: bcrypt.hashSync("admin123", 10),
        role: "admin",
        status: "active"
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    }
    
    const staffCount = await User.countDocuments({ role: "staff" });
    if (staffCount === 0) {
      const staffUser = new User({
        username: "staff",
        password: bcrypt.hashSync("staff123", 10),
        role: "staff",
        status: "active"
      });
      await staffUser.save();
      console.log('✅ Staff user created');
    }

  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// InventoryItem Schema (Raw Ingredients) - UPDATED
const inventoryItemSchema = new mongoose.Schema({
  itemName: { 
    type: String, 
    required: true,
    trim: true
  },
  itemType: { 
    type: String, 
    default: 'raw',
    enum: ['raw', 'finished']
  },
  category: { 
    type: String, 
    required: true,
    trim: true
  },
  unit: { 
    type: String, 
    required: true,
    trim: true
  },
  currentStock: { 
    type: Number, 
    default: 0,
    min: 0
  },
  minStock: { 
    type: Number, 
    default: 10,
    min: 0
  },
  maxStock: { // ADDED: This field was missing but used in frontend
    type: Number,
    default: 50,
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better performance
inventoryItemSchema.index({ itemName: 1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ itemType: 1 });
inventoryItemSchema.index({ isActive: 1 });
inventoryItemSchema.index({ currentStock: 1 });

// Update the updatedAt field before saving
inventoryItemSchema.pre('save', function() {
  this.updatedAt = Date.now();

});

export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);

// Product Schema (Fixed - removed name requirement or made it match seed data)
const productSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 999 }, // Changed from 0 to 999 to match seed data
  image: { type: String, default: 'default_food.jpg' },
  status: { type: String, default: 'available' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// MenuItem Schema (FIXED - no unique constraint to avoid seeding issues)
const menuItemSchema = new mongoose.Schema({
  itemName: { 
    type: String, 
    required: [true, 'Item name is required'],
    trim: true
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    trim: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  // Additional fields to help with uniqueness
  uniqueIdentifier: {
    type: String,
    unique: true,
    sparse: true // Allow null values for uniqueness
  }
}, {
  timestamps: true
});

// Create a compound index for name + category instead of unique name
menuItemSchema.index({ itemName: 1, category: 1 }, { unique: false });

// Auto-generate unique identifier before saving
menuItemSchema.pre('save', function() {
  if (!this.uniqueIdentifier) {
    // Create a unique identifier using name + category + timestamp
    const timestamp = Date.now().toString(36);
    const nameSlug = this.itemName.replace(/\s+/g, '-').toLowerCase().substring(0, 20);
    const categorySlug = this.category.replace(/\s+/g, '-').toLowerCase().substring(0, 10);
    this.uniqueIdentifier = `${nameSlug}-${categorySlug}-${timestamp}`;
  }
});

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      vatable: { type: Boolean, default: true }
    }
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  customerId: { type: String, default: null },
  payment: {
    method: { type: String, enum: ["cash", "gcash"], default: "cash" },
    amountPaid: { type: Number, required: true },
    change: { type: Number, default: 0 }
  },
  type: { type: String, enum: ["Dine In", "Take Out"], default: "Dine In" },
  status: { type: String, default: "completed" },
  orderNumber: { type: String },
  notes: { type: String, default: '' },
  tableNumber: { type: String }
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Stats Schema
const statsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  totalOrders: { type: Number, default: 0 },
  ordersToday: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  revenueToday: { type: Number, default: 0 }
});

export const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);

// StockNotification Schema
const stockNotificationSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  notificationType: { type: String, required: true },
  currentStock: { type: Number, required: true },
  minStock: { type: Number, required: true },
  message: { type: String, default: '' },
  sentBy: { type: String, default: 'system' },
  priority: { type: String, default: 'medium' },
  actionTaken: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const StockNotification = mongoose.models.StockNotification || 
  mongoose.model('StockNotification', stockNotificationSchema);

// Customer Schema
const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true, index: true },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

// Stock Request Schema
const stockRequestSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: false
  },
  requestedQuantity: {
    type: Number,
    required: [true, 'Requested quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by user is required']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String,
    trim: true,
    default: ''
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: {
    type: Date
  },
  fulfilledDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
stockRequestSchema.index({ productName: 1, status: 1 });
stockRequestSchema.index({ requestedBy: 1, createdAt: -1 });
stockRequestSchema.index({ status: 1, priority: 1 });
stockRequestSchema.index({ createdAt: -1 });

export const StockRequest = mongoose.models.StockRequest || mongoose.model('StockRequest', stockRequestSchema);