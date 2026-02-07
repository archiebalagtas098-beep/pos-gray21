import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
  } catch (error) {
    console.error("DB Error:", error);
  }
};

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
  isActive: Boolean
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

// 6. Stats
const statsSchema = new mongoose.Schema({
  date: Date,
  totalOrders: Number,
  totalRevenue: Number,
  todayOrders: Number,
  todayRevenue: Number,
  totalCustomers: Number
}, { timestamps: true });

export const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);

// 7. MenuItem
const menuItemSchema = new mongoose.Schema({
  itemName: String,
  category: String,
  price: Number,
  image: String,
  isActive: Boolean
});

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

// 8. StockNotification
const stockNotificationSchema = new mongoose.Schema({
  productName: String,
  currentStock: Number,
  minStock: Number,
  message: String,
  isRead: Boolean
}, { timestamps: true });

export const StockNotification = mongoose.models.StockNotification || mongoose.model('StockNotification', stockNotificationSchema);

// 9. Customer
const customerSchema = new mongoose.Schema({
  customerId: String,
  name: String,
  totalOrders: Number,
  totalSpent: Number,
  lastOrderDate: Date
}, { timestamps: true });

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

// 10. StockRequest (the 10th model!)
const stockRequestSchema = new mongoose.Schema({
  productName: String,
  requestedQuantity: Number,
  currentStock: Number,
  minStock: Number,
  status: String,
  requestedBy: String,
  requestDate: Date
}, { timestamps: true });

export const StockRequest = mongoose.models.StockRequest || mongoose.model('StockRequest', stockRequestSchema);

// Dashboard Stats Function
export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Total Orders
  const totalOrders = await Order.countDocuments();
  
  // Today's Orders
  const todaysOrders = await Order.countDocuments({
    createdAt: { $gte: today }
  });
  
  // Total Customers
  const totalCustomers = await Customer.countDocuments();
  
  // Total Revenue
  const revenueData = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  const totalRevenue = revenueData[0]?.total || 0;
  
  // Today's Revenue
  const todayRevenueData = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $gte: today }
      } 
    },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  const todaysRevenue = todayRevenueData[0]?.total || 0;
  
  // Total Inventory
  const totalInventory = await InventoryItem.countDocuments({ isActive: true });
  
  // Total Products
  const totalProducts = await Product.countDocuments({ isActive: true });
  
  // Total Menu Items
  const totalMenu = await MenuItem.countDocuments({ isActive: true });
  
  // Inventory Status (Low Stock)
  const lowStockInventory = await InventoryItem.countDocuments({
    $expr: { $lt: ["$currentStock", "$minStock"] }
  });
  
  // Pending Stock Requests
  const pendingStockRequests = await StockRequest.countDocuments({ status: 'pending' });
  
  // Top Selling Products
  const topSelling = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        totalQuantity: { $sum: '$items.quantity' }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 }
  ]);
  
  // Recent Orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Recent Stock Requests
  const recentStockRequests = await StockRequest.find()
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Save to Stats
  await Stats.create({
    date: today,
    totalOrders,
    totalRevenue,
    todayOrders: todaysOrders,
    todayRevenue: todaysRevenue,
    totalCustomers
  });
  
  return {
    // Summary Numbers
    totalOrders,
    todaysOrders,
    totalCustomers,
    totalRevenue,
    todaysRevenue,
    totalInventory,
    totalProducts,
    totalMenu,
    lowStockInventory,
    pendingStockRequests,
    
    // Lists
    topSelling,
    recentOrders,
    recentStockRequests
  };
};

// Get counts for each model
export const getCounts = async () => {
  return {
    users: await User.countDocuments(),
    categories: await Category.countDocuments(),
    inventory: await InventoryItem.countDocuments({ isActive: true }),
    products: await Product.countDocuments({ isActive: true }),
    menuItems: await MenuItem.countDocuments({ isActive: true }),
    orders: await Order.countDocuments(),
    customers: await Customer.countDocuments(),
    notifications: await StockNotification.countDocuments({ isRead: false }),
    stockRequests: await StockRequest.countDocuments({ status: 'pending' })
  };
};

// Get all data functions
export const getAllUsers = async () => await User.find();
export const getAllCategories = async () => await Category.find();
export const getAllInventory = async () => await InventoryItem.find({ isActive: true });
export const getAllProducts = async () => await Product.find({ isActive: true });
export const getAllMenuItems = async () => await MenuItem.find({ isActive: true });
export const getAllOrders = async () => await Order.find().sort({ createdAt: -1 });
export const getAllCustomers = async () => await Customer.find().sort({ createdAt: -1 });
export const getAllNotifications = async () => await StockNotification.find({ isRead: false });
export const getAllStockRequests = async () => await StockRequest.find().sort({ createdAt: -1 });

// Add functions
export const addUser = async (data) => {
  const user = new User(data);
  return await user.save();
};

export const addCategory = async (data) => {
  const category = new Category(data);
  return await category.save();
};

export const addInventoryItem = async (data) => {
  const item = new InventoryItem(data);
  return await item.save();
};

export const addProduct = async (data) => {
  const product = new Product(data);
  return await product.save();
};

export const addMenuItem = async (data) => {
  const menuItem = new MenuItem(data);
  return await menuItem.save();
};

export const addOrder = async (data) => {
  // Simple order number
  const count = await Order.countDocuments({
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
  });
  data.orderNumber = `ORD${Date.now().toString().slice(-6)}${count + 1}`;
  
  const order = new Order(data);
  return await order.save();
};

export const addCustomer = async (data) => {
  const customer = new Customer(data);
  return await customer.save();
};

export const addNotification = async (data) => {
  const notification = new StockNotification(data);
  return await notification.save();
};

export const addStockRequest = async (data) => {
  const stockRequest = new StockRequest({
    ...data,
    requestDate: new Date(),
    status: 'pending'
  });
  return await stockRequest.save();
};

// Check low stock and create notifications/requests
export const checkLowStock = async () => {
  const lowStockItems = await InventoryItem.find({
    $expr: { $lt: ["$currentStock", "$minStock"] },
    isActive: true
  });
  
  for (const item of lowStockItems) {
    // Create notification
    await StockNotification.create({
      productName: item.itemName,
      currentStock: item.currentStock,
      minStock: item.minStock,
      message: `${item.itemName} is low on stock (${item.currentStock} left)`,
      isRead: false
    });
    
    // Check if stock request already exists
    const existingRequest = await StockRequest.findOne({
      productName: item.itemName,
      status: 'pending'
    });
    
    if (!existingRequest) {
      // Create stock request
      await StockRequest.create({
        productName: item.itemName,
        requestedQuantity: item.minStock * 2, // Request double the min stock
        currentStock: item.currentStock,
        minStock: item.minStock,
        status: 'pending',
        requestedBy: 'system'
      });
    }
  }
  
  return lowStockItems;
};

// Update stock request status
export const updateStockRequest = async (id, status) => {
  return await StockRequest.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
};

// Fulfill stock request (add stock to inventory)
export const fulfillStockRequest = async (id) => {
  const request = await StockRequest.findById(id);
  
  if (request && request.status === 'approved') {
    // Find and update inventory item
    await InventoryItem.findOneAndUpdate(
      { itemName: request.productName },
      { $inc: { currentStock: request.requestedQuantity } }
    );
    
    // Update request status
    request.status = 'fulfilled';
    await request.save();
    
    return request;
  }
  
  return null;
};