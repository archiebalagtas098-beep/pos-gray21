import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB Connection Error:", error);
  }
};

// Simple model definitions only

// 1. User
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  status: String
});
export const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. Category
const categorySchema = new mongoose.Schema({
  name: String,
  isActive: Boolean
});
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// 3. InventoryItem
const inventoryItemSchema = new mongoose.Schema({
  itemName: String,
  category: String,
  currentStock: Number,
  minStock: Number,
  isActive: Boolean,
  itemType: { type: String, default: 'raw' },
  unit: { type: String, default: 'pcs' },
  maxStock: Number,
  createdAt: { type: Date, default: Date.now }
});
export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);

// 4. Product
const productSchema = new mongoose.Schema({
  itemName: String,
  category: String,
  price: Number,
  stock: Number,
  image: String,
  status: String,
  isActive: Boolean
});
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// 5. Order
const orderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  total: Number,
  paymentMethod: String,
  status: String,
  orderNumber: String,
  customerId: String,
  tableNumber: String
}, { timestamps: true });
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// 6. Customer
const customerSchema = new mongoose.Schema({
  customerId: String,
  name: String,
  totalOrders: Number,
  totalSpent: Number,
  lastOrderDate: Date
}, { timestamps: true });
export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

// 7. StockRequest
const stockRequestSchema = new mongoose.Schema({
  productName: String,
  requestedQuantity: Number,
  currentStock: Number,
  minStock: Number,
  status: { type: String, default: 'pending' },
  requestedBy: String,
  requestDate: { type: Date, default: Date.now }
}, { timestamps: true });
export const StockRequest = mongoose.models.StockRequest || mongoose.model('StockRequest', stockRequestSchema);

// 8. StockNotification
const stockNotificationSchema = new mongoose.Schema({
  productName: String,
  currentStock: Number,
  minStock: Number,
  message: String,
  isRead: Boolean
}, { timestamps: true });
export const StockNotification = mongoose.models.StockNotification || mongoose.model('StockNotification', stockNotificationSchema);

// 9. Stats (Optional - remove if not needed)
const statsSchema = new mongoose.Schema({
  date: Date,
  totalOrders: Number,
  totalRevenue: Number,
  todayOrders: Number,
  todayRevenue: Number
}, { timestamps: true });
export const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);

// 10. MenuItem (Optional - remove if not needed)
const menuItemSchema = new mongoose.Schema({
  itemName: String,
  category: String,
  price: Number,
  image: String,
  isActive: Boolean
});
export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

// Only export the models you actually use
export default {
  User,
  Category,
  InventoryItem,
  Product,
  Order,
  Customer,
  StockRequest,
  StockNotification,
  Stats,
  MenuItem
};