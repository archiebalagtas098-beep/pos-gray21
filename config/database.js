import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB Atlas Connected");
  } catch (error) {
    console.error("DB Connection Error:", error);
  }
};

// ==================== FIXED MODEL DEFINITIONS ====================

// 1. User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "staff" },
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now }
});
export const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. Category
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// 3. InventoryItem - FIXED
const inventoryItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  currentStock: { type: Number, default: 0, min: 0 },
  minStock: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  itemType: { type: String, default: 'raw' },
  unit: { type: String, default: 'pcs' },
  maxStock: { type: Number, default: 100 },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  usageHistory: [{
    quantity: Number,
    notes: String,
    usedBy: String,
    date: { type: Date, default: Date.now }
  }],
  restockHistory: [{
    quantity: Number,
    price: Number,
    notes: String,
    addedBy: String,
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);

// 4. Product
const productSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 50 },
  image: { type: String, default: 'default_food.jpg' },
  status: { type: String, default: 'available' },
  isActive: { type: Boolean, default: true },
  description: { type: String, default: '' },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// 5. Order - FIXED (This was the main issue!)
const orderItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, default: 'Regular' },
  image: { type: String, default: 'default_food.jpg' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  vatable: { type: Boolean, default: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  items: [orderItemSchema],
  subtotal: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  payment: {
    method: { type: String, default: 'cash' },
    amountPaid: { type: Number, required: true, min: 0 },
    change: { type: Number, default: 0, min: 0 },
    status: { type: String, default: 'completed' }
  },
  type: { type: String, default: 'Dine In' },
  status: { type: String, default: 'completed' },
  notes: { type: String, default: '' },
  customerId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add index for faster queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ orderNumber: 1 });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// 6. Customer - FIXED
const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  name: { type: String, default: 'Walk-in Customer' },
  totalOrders: { type: Number, default: 0, min: 0 },
  totalSpent: { type: Number, default: 0, min: 0 },
  lastOrderDate: { type: Date, default: Date.now },
  firstOrderDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add index for faster queries
customerSchema.index({ customerId: 1 });
customerSchema.index({ lastOrderDate: -1 });

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

// 7. StockRequest
const stockRequestSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  requestedQuantity: { type: Number, required: true, min: 1 },
  currentStock: { type: Number, default: 0, min: 0 },
  minStock: { type: Number, default: 10 },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'completed'] },
  requestedBy: { type: String, required: true },
  requestDate: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  fulfilledQuantity: { type: Number, default: 0 },
  fulfilledBy: { type: String },
  fulfilledAt: { type: Date },
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
export const StockRequest = mongoose.models.StockRequest || mongoose.model('StockRequest', stockRequestSchema);

// 8. StockNotification
const stockNotificationSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  currentStock: { type: Number, required: true, min: 0 },
  minStock: { type: Number, default: 10 },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
  createdAt: { type: Date, default: Date.now }
});
export const StockNotification = mongoose.models.StockNotification || mongoose.model('StockNotification', stockNotificationSchema);

// 9. Stats (Optional - remove if not needed)
const statsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalOrders: { type: Number, default: 0, min: 0 },
  totalRevenue: { type: Number, default: 0, min: 0 },
  todayOrders: { type: Number, default: 0, min: 0 },
  todayRevenue: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
export const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);

// 10. MenuItem - FIXED (This is critical for dashboard stats!)
const menuItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  stockType: { type: String, default: 'unlimited' },
  status: { type: String, default: 'available', enum: ['available', 'out_of_stock'] },
  isActive: { type: Boolean, default: true },
  requiredIngredients: [{ type: String }],
  image: { type: String, default: 'default_food.jpg' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add index for faster queries
menuItemSchema.index({ itemName: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ status: 1 });

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

// ==================== TEST DATA CREATION FUNCTION ====================
// Run this once if you have no data in your database

export const createTestData = async () => {
  try {
    console.log('🔄 Checking if test data needs to be created...');
    
    // Check if we have any orders
    const orderCount = await Order.countDocuments();
    const customerCount = await Customer.countDocuments();
    const menuItemCount = await MenuItem.countDocuments();
    
    console.log(`📊 Current data: Orders=${orderCount}, Customers=${customerCount}, MenuItems=${menuItemCount}`);
    
    if (orderCount === 0) {
      console.log('📝 Creating test data...');
      
      // Create test customer
      const testCustomer = await Customer.create({
        customerId: 'CUST-000001',
        name: 'Test Customer',
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: new Date()
      });
      
      // Create test menu items
      const testMenuItems = await MenuItem.insertMany([
        {
          itemName: 'Chicken Adobo',
          name: 'Chicken Adobo',
          category: 'Rice Bowl Meals',
          price: 150,
          status: 'available',
          isActive: true
        },
        {
          itemName: 'Pork Sisig',
          name: 'Pork Sisig',
          category: 'Hot Sizzlers',
          price: 180,
          status: 'available',
          isActive: true
        },
        {
          itemName: 'Milk Tea Regular',
          name: 'Milk Tea Regular',
          category: 'Milk Tea',
          price: 80,
          status: 'available',
          isActive: true
        }
      ]);
      
      // Create test orders
      const testOrders = await Order.insertMany([
        {
          orderNumber: 'ORD-20240101-001',
          items: [
            {
              itemName: 'Chicken Adobo',
              price: 150,
              quantity: 2
            }
          ],
          subtotal: 300,
          tax: 36,
          total: 336,
          payment: {
            method: 'cash',
            amountPaid: 400,
            change: 64,
            status: 'completed'
          },
          type: 'Dine In',
          status: 'completed',
          customerId: testCustomer.customerId,
          createdAt: new Date()
        },
        {
          orderNumber: 'ORD-20240101-002',
          items: [
            {
              itemName: 'Pork Sisig',
              price: 180,
              quantity: 1
            },
            {
              itemName: 'Milk Tea Regular',
              price: 80,
              quantity: 1
            }
          ],
          subtotal: 260,
          tax: 31.2,
          total: 291.2,
          payment: {
            method: 'card',
            amountPaid: 300,
            change: 8.8,
            status: 'completed'
          },
          type: 'Takeout',
          status: 'completed',
          customerId: testCustomer.customerId,
          createdAt: new Date()
        }
      ]);
      
      // Update customer stats
      testCustomer.totalOrders = testOrders.length;
      testCustomer.totalSpent = testOrders.reduce((sum, order) => sum + order.total, 0);
      await testCustomer.save();
      
      console.log(`✅ Test data created: ${testOrders.length} orders, ${testMenuItems.length} menu items`);
      console.log('💰 Total revenue from test data:', testOrders.reduce((sum, order) => sum + order.total, 0));
    } else {
      console.log('✅ Database already has data, skipping test data creation');
    }
    
    // Also check and create inventory items if needed
    const inventoryCount = await InventoryItem.countDocuments();
    if (inventoryCount === 0) {
      console.log('📦 Creating test inventory items...');
      await InventoryItem.insertMany([
        {
          itemName: 'Chicken',
          category: 'Meat & Poultry',
          currentStock: 50,
          minStock: 10,
          isActive: true,
          unit: 'kg'
        },
        {
          itemName: 'Pork',
          category: 'Meat & Poultry',
          currentStock: 30,
          minStock: 10,
          isActive: true,
          unit: 'kg'
        },
        {
          itemName: 'Rice',
          category: 'Dry Goods',
          currentStock: 100,
          minStock: 20,
          isActive: true,
          unit: 'kg'
        }
      ]);
      console.log('✅ Test inventory items created');
    }
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
};

// Call this function after connecting to database
export const initializeDatabase = async () => {
  try {
    // Make sure we're connected
    if (!isConnected) {
      await connectDB();
    }
    
    // Create test data if database is empty
    await createTestData();
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

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