// ==================== GLOBAL VARIABLES ====================
let dashboardStats = {
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    inventoryLowStock: 0,
    inventoryOutOfStock: 0,
    totalMenuItems: 0,
    uniqueCustomers: 0 // Add this to track unique customers
};

// Customer tracking
let allCustomers = []; // Store unique customer information
let customerOrdersMap = new Map(); // Map customer ID/name to order count

// Top Selling Products variables
let topSellingProducts = [];
let allSalesData = [];

// Order History variables
let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

// Menu Management variables
let allMenuItems = [];

// Inventory Status variables
let inventoryStatusData = [];

// ==================== DOM ELEMENTS ====================
let todaysOrdersBody, ordersTableBody, topItemsTableBody, inventoryTableBody;

// ==================== FORMATTING FUNCTIONS ====================
function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}

function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₱0.00';
    }
    
    const numAmount = parseFloat(amount);
    return '₱' + numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'N/A';
    }
}

// ==================== CUSTOMER MANAGEMENT ====================
async function fetchAndCountCustomers() {
    try {
        console.log('👥 Fetching customer data...');
        
        // Method 1: Try dedicated customers API endpoint
        try {
            const response = await fetch('/api/customers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    allCustomers = data.data || [];
                    dashboardStats.totalCustomers = allCustomers.length;
                    dashboardStats.uniqueCustomers = allCustomers.length;
                    console.log(`✅ Customers loaded from API: ${allCustomers.length}`);
                    return true;
                }
            }
        } catch (apiError) {
            console.log('ℹ️ No customers API available, using order data');
        }
        
        // Method 2: Extract unique customers from orders
        if (allOrders.length > 0) {
            console.log('🔄 Extracting customers from orders...');
            extractCustomersFromOrders();
            return true;
        }
        
        // Method 3: Try to get customer count from dashboard stats
        if (dashboardStats.totalCustomers > 0) {
            console.log(`✅ Using customer count from dashboard stats: ${dashboardStats.totalCustomers}`);
            dashboardStats.uniqueCustomers = dashboardStats.totalCustomers;
            return true;
        }
        
        // Fallback: Set to 0
        dashboardStats.totalCustomers = 0;
        dashboardStats.uniqueCustomers = 0;
        console.log('⚠️ No customer data available');
        return false;
        
    } catch (error) {
        console.error('❌ Error fetching customers:', error);
        dashboardStats.totalCustomers = 0;
        dashboardStats.uniqueCustomers = 0;
        return false;
    }
}

function extractCustomersFromOrders() {
    
    // Reset customer tracking
    allCustomers = [];
    customerOrdersMap.clear();
    
    // Process all orders to extract customer information
    allOrders.forEach((order, index) => {
        if (!order) return;
        
        // Extract customer information from order
        let customerName = order.customerName || 
                          order.customer || 
                          order.customerInfo?.name || 
                          'Walk-in Customer';
        
        let customerPhone = order.customerPhone || 
                           order.phone || 
                           order.customerInfo?.phone || 
                           null;
        
        let customerEmail = order.customerEmail || 
                           order.email || 
                           order.customerInfo?.email || 
                           null;
        
        // Create customer identifier
        let customerId;
        if (customerPhone) {
            customerId = `PHONE:${customerPhone}`;
        } else if (customerEmail) {
            customerId = `EMAIL:${customerEmail}`;
        } else {
            customerId = `NAME:${customerName}`;
        }
        
        // Check if customer already exists
        let existingCustomer = allCustomers.find(c => c.id === customerId);
        
        if (!existingCustomer) {
            // New customer
            const newCustomer = {
                id: customerId,
                name: customerName,
                phone: customerPhone,
                email: customerEmail,
                firstOrderDate: order.createdAt || new Date().toISOString(),
                lastOrderDate: order.createdAt || new Date().toISOString(),
                totalOrders: 1,
                totalSpent: parseFloat(order.totalAmount || order.total || 0)
            };
            
            allCustomers.push(newCustomer);
            customerOrdersMap.set(customerId, [order._id || order.orderNumber]);
            
        } else {
            // Update existing customer
            existingCustomer.lastOrderDate = order.createdAt || new Date().toISOString();
            existingCustomer.totalOrders += 1;
            existingCustomer.totalSpent += parseFloat(order.totalAmount || order.total || 0);
            
            const orders = customerOrdersMap.get(customerId) || [];
            orders.push(order._id || order.orderNumber);
            customerOrdersMap.set(customerId, orders);
        }
    });
    
    // Update dashboard stats
    dashboardStats.totalCustomers = allCustomers.length;
    dashboardStats.uniqueCustomers = allCustomers.length;
    
    console.log(`✅ Extracted ${allCustomers.length} unique customers from orders`);
    
    // Display customer statistics
    displayCustomerStats();
    
    return allCustomers.length > 0;
}

function displayCustomerStats() {
    // Update the dashboard display
    const totalCustomersEl = document.getElementById('totalCustomers');
    if (totalCustomersEl) {
        totalCustomersEl.textContent = formatNumber(dashboardStats.totalCustomers);
    }
    
    // Optional: Update other customer-related displays
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayCustomers = allCustomers.filter(customer => {
        if (!customer.lastOrderDate) return false;
        try {
            const lastOrderDate = new Date(customer.lastOrderDate);
            const lastOrderStart = new Date(
                lastOrderDate.getFullYear(),
                lastOrderDate.getMonth(),
                lastOrderDate.getDate()
            );
            return lastOrderStart.getTime() === todayStart.getTime();
        } catch (error) {
            return false;
        }
    });
    
    console.log(`📊 Today's customers: ${todayCustomers.length}`);
    
    // You can add more detailed customer statistics here
    if (allCustomers.length > 0) {
        // Calculate average order value per customer
        const avgSpent = allCustomers.reduce((sum, customer) => 
            sum + (customer.totalSpent || 0), 0) / allCustomers.length;
        
        // Find top customers by spending
        const topCustomers = [...allCustomers]
            .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
            .slice(0, 5);
        
        console.log('💰 Customer Statistics:');
        console.log(`- Total unique customers: ${allCustomers.length}`);
        console.log(`- Customers today: ${todayCustomers.length}`);
        console.log(`- Average spent per customer: ₱${avgSpent.toFixed(2)}`);
        console.log('- Top 5 customers by spending:');
        topCustomers.forEach((cust, index) => {
            console.log(`  ${index + 1}. ${cust.name} - ₱${formatCurrency(cust.totalSpent)} (${cust.totalOrders} orders)`);
        });
    }
}

// ==================== DASHBOARD STATS ====================
async function fetchDashboardStats() {
    try {
        console.log('📊 Fetching dashboard stats...');
        
        const response = await fetch('/api/dashboard/stats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            console.warn('⚠️ Dashboard stats API error:', response.status);
            // Try fallback API
            await fetchDashboardStatsFallback();
            return;
        }

        const data = await response.json();
        
        if (data.success) {
            // Merge the fetched data
            dashboardStats = {
                ...dashboardStats,
                ...data.data
            };
            
            console.log('✅ Dashboard stats loaded:', {
                totalOrders: dashboardStats.totalOrders,
                totalRevenue: dashboardStats.totalRevenue,
                totalCustomers: dashboardStats.totalCustomers
            });
            
            // If customer count is 0 or not provided, calculate it
            if (!dashboardStats.totalCustomers || dashboardStats.totalCustomers === 0) {
                console.log('🔄 Customer count missing, calculating from orders...');
                await fetchAndCountCustomers();
            }
            
            updateDashboardUI();
        } else {
            console.warn('⚠️ Dashboard stats API failed:', data.message);
            await fetchDashboardStatsFallback();
        }
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        await fetchDashboardStatsFallback();
    }
}

async function fetchDashboardStatsFallback() {
    try {
        console.log('🔄 Using fallback method for dashboard stats...');
        
        // If we have orders, calculate stats from them
        if (allOrders.length > 0) {
            dashboardStats.totalOrders = allOrders.length;
            
            // Calculate total revenue
            dashboardStats.totalRevenue = allOrders.reduce((sum, order) => {
                return sum + parseFloat(order.totalAmount || order.total || order.totalPrice || 0);
            }, 0);
            
            // Get customer count
            await fetchAndCountCustomers();
            
            // Get total products (menu items)
            dashboardStats.totalProducts = allMenuItems.length;
            dashboardStats.totalMenuItems = allMenuItems.length;
            
            console.log('✅ Fallback stats calculated:', {
                totalOrders: dashboardStats.totalOrders,
                totalRevenue: dashboardStats.totalRevenue,
                totalCustomers: dashboardStats.totalCustomers
            });
            
            updateDashboardUI();
        } else {
            console.log('ℹ️ No data available for fallback calculation');
        }
    } catch (error) {
        console.error('❌ Error in fallback stats:', error);
    }
}

function updateDashboardUI() {
    console.log('🔄 Updating dashboard UI...');
    
    // Update all dashboard elements
    const elements = {
        'totalOrders': dashboardStats.totalOrders || 0,
        'totalProducts': allInventoryItems.length || 0,
        'totalCustomers': dashboardStats.totalCustomers || 0,
        'totalRevenue': dashboardStats.totalRevenue || 0,
        'totalMenuItems': allMenuItems.length || 0
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'totalRevenue') {
                element.textContent = formatCurrency(value);
            } else {
                element.textContent = formatNumber(value);
            }
            
            // Add animation for updates
            if (value > 0) {
                element.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 300);
            }
        } else {
            console.warn(`⚠️ Element not found: #${id}`);
        }
    });
    
    console.log('✅ Dashboard UI updated');
}

// ==================== ORDER MANAGEMENT ====================
async function loadOrders() {
    try {
        console.log('📋 Loading orders...');
        
        const response = await fetch('/api/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Orders API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            allOrders = data.data || [];
            filteredOrders = [...allOrders];
            console.log('✅ Orders loaded:', allOrders.length);
            
            // Cache DOM elements before rendering
            cacheDOMElements();
            
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                // Render tables
                renderOrdersTable();
                renderPagination();
                updateTodaysOrdersTable();
                
                // After loading orders, count customers
                fetchAndCountCustomers();
                
                // Then load top selling products
                loadTopSellingProducts();
                
                console.log('✅ All order-related functions executed');
            }, 100);
            
        } else {
            throw new Error(data.message || 'Failed to fetch orders');
        }
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        allOrders = [];
        filteredOrders = [];
    }
}

function updateTodaysOrdersTable() {
    // Refresh cache if needed
    if (!todaysOrdersBody) {
        console.log('🔄 Refreshing DOM cache for today\'s orders...');
        todaysOrdersBody = document.getElementById('todaysOrdersBody');
    }
    
    if (!todaysOrdersBody) {
        console.error('❌ todaysOrdersBody element not found! Check your HTML structure');
        
        // Try alternative selectors
        const alternatives = [
            '#todaysOrdersBody',
            '#todays-orders-body',
            '.todays-orders-body',
            'tbody#todaysOrdersBody'
        ];
        
        for (const selector of alternatives) {
            todaysOrdersBody = document.querySelector(selector);
            if (todaysOrdersBody) {
                console.log(`✅ Found element using selector: ${selector}`);
                break;
            }
        }
        
        if (!todaysOrdersBody) {
            console.error('❌ Still cannot find today\'s orders table body');
            return;
        }
    }
    
    console.log('🕒 Updating Today\'s Orders table...');
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    console.log(`📊 Today's date: ${today.toLocaleDateString()}`);
    console.log(`📊 Total orders: ${allOrders.length}`);
    
    const todaysOrders = allOrders.filter(order => {
        if (!order || !order.createdAt) {
            console.warn('⚠️ Order missing or missing createdAt:', order);
            return false;
        }
        
        try {
            const orderDate = new Date(order.createdAt);
            const orderDateStart = new Date(
                orderDate.getFullYear(),
                orderDate.getMonth(),
                orderDate.getDate()
            );
            
            const isToday = orderDateStart.getTime() === todayStart.getTime();
            
            if (isToday) {
                console.log(`✅ Today's order found:`, {
                    orderNumber: order.orderNumber,
                    customer: order.customerName,
                    date: order.createdAt,
                    orderDate: orderDate.toLocaleDateString()
                });
            }
            
            return isToday;
        } catch (error) {
            console.warn('⚠️ Error parsing order date:', order.createdAt, error);
            return false;
        }
    });
    
    console.log('✅ Today\'s orders found:', todaysOrders.length);
    
    if (todaysOrders.length === 0) {
        todaysOrdersBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px;">
                    No orders today
                </td>
            </tr>
        `;
        console.log('📭 No orders today, table cleared');
        return;
    }
    
    // Sort by time (newest first) and limit to 6
    todaysOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const displayOrders = todaysOrders.slice(0, 6);
    
    console.log(`📋 Displaying ${displayOrders.length} orders in table`);
    
    const tableHTML = displayOrders.map((order, index) => {
        let orderTime = new Date();
        try {
            orderTime = new Date(order.createdAt);
        } catch (error) {
            console.warn('⚠️ Invalid order time:', order.createdAt);
        }
        
        const timeString = orderTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
        
        const totalAmount = parseFloat(order.totalAmount || order.total || 0);
        const customerName = order.customerName || order.customer || 'Walk-in Customer';
        
        const displayCustomer = customerName.length > 15 
            ? customerName.substring(0, 15) + '...' 
            : customerName;
        
        const orderNumber = order.orderNumber || 
                           `ORD-${order._id ? order._id.substring(0, 6) : 'N/A'}`;
        
        console.log(`📝 Row ${index + 1}:`, {
            orderNumber,
            time: timeString,
            customer: customerName,
            amount: totalAmount
        });
        
        return `
        <tr>
            <td>${orderNumber}</td>
            <td style="text-align: center;">${timeString}</td>
            <td title="${customerName.replace(/"/g, '&quot;')}">${displayCustomer}</td>
            <td style="text-align: center;">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    todaysOrdersBody.innerHTML = tableHTML;
    console.log('✅ Today\'s Orders table updated with HTML:', tableHTML.length, 'characters');
}

// ==================== TOP SELLING PRODUCTS ====================
async function loadTopSellingProducts() {
    try {
        console.log('📈 Loading top selling products...');
        
        // Try to get actual sales data from API
        try {
            const response = await fetch('/api/orders/top-selling', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                timeout: 5000
            });
            
            if (response && response.ok) {
                const data = await response.json();
                if (data.success) {
                    allSalesData = data.data || [];
                    console.log('✅ Sales data loaded from API:', allSalesData.length);
                }
            }
        } catch (apiError) {
            console.log('ℹ️ No sales API available, using order data');
            allSalesData = [];
        }
        
        // If no API data, calculate from orders
        if (allSalesData.length === 0 && allOrders.length > 0) {
            console.log('🔄 Calculating sales from order history...');
            allSalesData = calculateSalesFromOrders();
        }
        
        // Generate top selling products
        generateTopSellingProducts();
        
    } catch (error) {
        console.error('❌ Error loading top selling products:', error);
        generateTopSellingProducts(); // Still try to generate with available data
    }
}

function calculateSalesFromOrders() {
    const salesMap = new Map();
    
    allOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                if (item && item.name) {
                    const itemName = item.name.trim();
                    const quantity = parseInt(item.quantity) || 1;
                    const price = parseFloat(item.price || item.unitPrice || 0);
                    
                    if (!salesMap.has(itemName)) {
                        salesMap.set(itemName, {
                            name: itemName,
                            totalSold: 0,
                            totalRevenue: 0
                        });
                    }
                    
                    const salesData = salesMap.get(itemName);
                    salesData.totalSold += quantity;
                    salesData.totalRevenue += quantity * price;
                }
            });
        }
    });
    
    return Array.from(salesMap.values());
}

function generateTopSellingProducts() {
    console.log('🔄 Generating top selling products...');
    
    // If we have sales data, use it
    if (allSalesData.length > 0) {
        topSellingProducts = allSalesData.map(sale => {
            // Find corresponding menu item
            const menuItem = allMenuItems.find(item => 
                (item.name || item.itemName) === sale.name ||
                (item.name && sale.name && item.name.includes(sale.name)) ||
                (sale.name && item.name && sale.name.includes(item.name))
            );
            
            const currentStock = menuItem ? parseFloat(menuItem.currentStock || item.stock || 0) : 0;
            const minStock = menuItem ? parseFloat(menuItem.minStock || 5) : 5;
            
            // Determine status based on sales and stock
            let status = 'Normal';
            
            if (currentStock <= 0) {
                status = 'Out of Stock';
            } else if (currentStock <= minStock) {
                status = 'Low Stock';
            } else if (sale.totalSold >= 100) {
                status = 'Bestseller';
            } else if (sale.totalSold >= 50) {
                status = 'Popular';
            } else if (sale.totalSold === 0) {
                status = 'No Sales';
            }
            
            return {
                name: sale.name,
                totalRevenue: sale.totalRevenue || 0,
                totalSold: sale.totalSold || 0,
                status: status,
                currentStock: currentStock
            };
        });
        
        // Sort by total revenue (highest first)
        topSellingProducts.sort((a, b) => b.totalRevenue - a.totalRevenue);
        
        console.log('✅ Generated top selling from sales data:', topSellingProducts.length);
    } 
    // If no sales data but we have menu items
    else if (allMenuItems.length > 0) {
        console.log('⚠️ No sales data, using menu items as placeholder');
        topSellingProducts = allMenuItems.map(item => {
            const name = item.name || item.itemName;
            const currentStock = parseFloat(item.currentStock || item.stock || 0);
            const minStock = parseFloat(item.minStock || 5);
            
            let status = 'No Sales';
            if (currentStock <= 0) {
                status = 'Out of Stock';
            } else if (currentStock <= minStock) {
                status = 'Low Stock';
            }
            
            return {
                name: name,
                totalRevenue: 0,
                totalSold: 0,
                status: status,
                currentStock: currentStock
            };
        });
        
        // Sort alphabetically
        topSellingProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Update the table display
    updateTopSellingTable();
}

function updateTopSellingTable() {
    if (!topItemsTableBody) return;
    
    if (topSellingProducts.length === 0) {
        topItemsTableBody.innerHTML = ``;
        return;
    }
    
    // Show top 10 products
    const displayProducts = topSellingProducts.slice(0, 10);
    
    const tableHTML = displayProducts.map(product => {
        const displayName = product.name.length > 25 
            ? product.name.substring(0, 25) + '...' 
            : product.name;
        
        const revenueDisplay = product.totalRevenue > 0 
            ? formatCurrency(product.totalRevenue)
            : '<span style="color: #999;">No sales</span>';
        
        return `
        <tr>
            <td>${displayName}</td>
            <td style="text-align: center;">${revenueDisplay}</td>
            <td style="text-align: center;"><span class="status-${product.status.toLowerCase().replace(' ', '-')}">${product.status}</span></td>
        </tr>
        `;
    }).join('');
    
    topItemsTableBody.innerHTML = tableHTML;
    
    console.log('✅ Top selling table updated');
}

// ==================== INVENTORY STATUS ====================
async function loadInventoryStatus() {
    try {
        console.log('📦 Loading inventory status...');
        
        // If we have menu items, use them for inventory
        if (allMenuItems.length > 0) {
            inventoryStatusData = allMenuItems.map(item => {
                const name = item.name || item.itemName || 'Unknown Item';
                const stock = parseFloat(item.currentStock || item.stock || 0);
                const maxStock = parseFloat(item.maxStock || 100);
                const minStock = parseFloat(item.minStock || 5);
                const unit = item.unit || 'unit';
                const pricePerUnit = parseFloat(item.price || item.pricePerUnit || 0);
                
                // Calculate value
                const value = stock * pricePerUnit;
                
                // Determine status
                let status = 'In Stock';
                let statusClass = 'in-stock';
                
                if (stock <= 0) {
                    status = 'Out of Stock';
                    statusClass = 'out-of-stock';
                } else if (stock <= minStock) {
                    status = 'Low Stock';
                    statusClass = 'low-stock';
                }
                
                return {
                    name: name,
                    stock: stock,
                    maxStock: maxStock,
                    unit: unit,
                    displayStock: `${formatNumber(stock)}/${formatNumber(maxStock)} ${unit}`,
                    status: status,
                    statusClass: statusClass,
                    value: value,
                    pricePerUnit: pricePerUnit
                };
            });
            
            // Sort by status priority
            inventoryStatusData.sort((a, b) => {
                const statusOrder = { 'Out of Stock': 0, 'Low Stock': 1, 'In Stock': 2 };
                return statusOrder[a.status] - statusOrder[b.status];
            });
            
            updateInventoryStatusTable();
        }
        
    } catch (error) {
        console.error('❌ Error loading inventory status:', error);
    }
}

function updateInventoryStatusTable() {
    if (!inventoryTableBody) return;
    
    if (inventoryStatusData.length === 0) {
        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px;">
                    No inventory items available
                </td>
            </tr>
        `;
        return;
    }
    
    // Show only top 10 items
    const displayItems = inventoryStatusData.slice(0, 10);
    
    const tableHTML = displayItems.map(item => {
        return `
        <tr>
            <td>${item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}</td>
            <td style="text-align: center;">${item.displayStock}</td>
            <td style="text-align: center;">${formatCurrency(item.value)}</td>
            <td style="text-align: center;"><span class="${item.statusClass}">${item.status}</span></td>
        </tr>
        `;
    }).join('');
    
    inventoryTableBody.innerHTML = tableHTML;
}

// ==================== MENU MANAGEMENT ====================
async function fetchMenuItems() {
    try {
        console.log('🍽️ Fetching menu items...');
        
        const response = await fetch('/api/menu', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Menu API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            allMenuItems = data.data || [];
            console.log('✅ Menu items loaded:', allMenuItems.length);
            
            // Update all dependent displays
            updateDashboardUI();
            loadInventoryStatus();
            loadTopSellingProducts();
            
        } else {
            throw new Error(data.message || 'Failed to fetch menu items');
        }
    } catch (error) {
        console.error('❌ Error fetching menu items:', error);
        allMenuItems = [];
    }
}

// ==================== CACHE DOM ELEMENTS ====================
function cacheDOMElements() {
    console.log('🔍 Caching DOM elements...');
    
    // Cache main elements
    todaysOrdersBody = document.getElementById('todaysOrdersBody');
    ordersTableBody = document.getElementById('ordersTableBody');
    topItemsTableBody = document.getElementById('topItemsTableBody');
    inventoryTableBody = document.getElementById('inventoryTableBody');
    
    console.log('✅ DOM elements cached:', {
        todaysOrdersBody: !!todaysOrdersBody,
        ordersTableBody: !!ordersTableBody,
        topItemsTableBody: !!topItemsTableBody,
        inventoryTableBody: !!inventoryTableBody
    });
}


// ==================== RENDER FUNCTIONS ====================
function renderOrdersTable() {
    if (!ordersTableBody) return;
    
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    if (totalPages > 0 && currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    if (pageOrders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px;">
                    No orders found
                </td>
            </tr>
        `;
        return;
    }
    
    const tableHTML = pageOrders.map(order => {
        const orderTime = new Date(order.createdAt || order.orderDate || Date.now());
        const timeString = orderTime.toLocaleTimeString('en-PH', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        const totalAmount = parseFloat(order.totalAmount || order.total || order.totalPrice || 0);
        
        const orderNumber = order.orderNumber || 
                           order.orderId || 
                           order.orderNo || 
                           `ORD-${(order._id || '000000').substring(0, 8)}`;
        
        const customerName = order.customerName || order.customer || 'Walk-in Customer';
        
        return `
        <tr>
            <td>${orderNumber}</td>
            <td style="text-align: center;">${timeString}</td>
            <td>${customerName.length > 20 ? customerName.substring(0, 20) + '...' : customerName}</td>
            <td style="text-align: center;">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    ordersTableBody.innerHTML = tableHTML;
}

// ==================== PAGINATION ====================
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            ←
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button ${currentPage === i ? 'style="font-weight: bold;"' : ''} onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span>...</span>`;
        }
    }
    
   
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            →
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredOrders.length / itemsPerPage)) return;
    currentPage = page;
    renderOrdersTable();
    renderPagination();
}

// ==================== FILTER ORDERS ====================
function filterOrders(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(order => {
            const orderNumber = order.orderNumber || `ORD-${(order._id || '').substring(0, 8)}`;
            const customerName = order.customerName || order.customer || 'Walk-in Customer';
            
            return orderNumber.toLowerCase().includes(term) ||
                   customerName.toLowerCase().includes(term);
        });
    }
    
    currentPage = 1;
    renderOrdersTable();
    renderPagination();
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard initializing...');
    
    // Cache DOM elements first with a small delay
    setTimeout(() => {
        cacheDOMElements();
        
        // Setup event listeners
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                filterOrders(e.target.value);
            });
        }
        
        // Load data in proper sequence
        async function initializeData() {
            console.log('📦 Initializing dashboard data...');
            
            try {
                // Step 1: Load menu items (base data)
                await fetchMenuItems();
                
                // Step 2: Load orders (need this for customer calculation)
                await loadOrders();
                
                // Step 3: Fetch dashboard stats (will use customers from orders)
                await fetchDashboardStats();
                
                // Step 4: Force customer count if still zero
                if (dashboardStats.totalCustomers === 0 && allOrders.length > 0) {
                    console.log('🔢 Forcing customer count calculation...');
                    await fetchAndCountCustomers();
                    updateDashboardUI();
                }
                
                console.log('✅ Dashboard initialization complete');
                console.log('📊 Final Stats:', {
                    orders: dashboardStats.totalOrders,
                    customers: dashboardStats.totalCustomers,
                    revenue: dashboardStats.totalRevenue,
                    menuItems: allMenuItems.length
                });
                
            } catch (error) {
                console.error('❌ Error during initialization:', error);
            }
        }
        
        // Start initialization
        initializeData();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            console.log('🔄 Auto-refresh triggered');
            fetchDashboardStats();
            fetchMenuItems();
            loadOrders();
        }, 30000);
        
        console.log('✅ Dashboard initialized');
    }, 100); // Small delay to ensure DOM is fully loaded
});

// ==================== UTILITY FUNCTIONS ====================
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (order) {
        const items = order.items || [];
        const itemsList = items.map(item => 
            `${item.name || 'Unknown'} x${item.quantity || 1} = ${formatCurrency((item.price || 0) * (item.quantity || 1))}`
        ).join('\n');
        
        alert(
            `ORDER DETAILS\n\n` +
            `Order #: ${order.orderNumber || 'N/A'}\n` +
            `Customer: ${order.customerName || 'Walk-in'}\n` +
            `Date: ${formatDate(order.createdAt)}\n` +
            `Status: ${order.status || 'Pending'}\n` +
            `Payment: ${order.paymentMethod || 'Cash'}\n` +
            `Total: ${formatCurrency(order.totalAmount || order.total || 0)}\n\n` +
            `ITEMS:\n${itemsList}`
        );
    }
}

function updateMenuItemValue(itemName, pricePerUnit) {
    const itemIndex = allMenuItems.findIndex(item => 
        (item.name || item.itemName) === itemName
    );
    
    if (itemIndex !== -1) {
        const item = allMenuItems[itemIndex];
        const currentStock = parseFloat(item.currentStock || item.stock || 0);
        
        // Update price
        item.price = pricePerUnit;
        item.pricePerUnit = pricePerUnit;
        
        // Calculate new value
        const newValue = currentStock * pricePerUnit;
        item.value = newValue;
        
        console.log(`✅ Updated ${itemName}: Price=${formatCurrency(pricePerUnit)}, Value=${formatCurrency(newValue)}`);
        
        // Refresh displays
        loadInventoryStatus();
        loadTopSellingProducts();
        
        return true;
    }
    
    console.log(`❌ Item not found: ${itemName}`);
    return false;
}

// ==================== STYLES ====================
const dashboardCSS = document.createElement('style');
dashboardCSS.textContent = `
/* Black text only */
* {
    color: #000000 !important;
}

/* Minimal table styling */
table {
    border-collapse: collapse;
    width: 100%;
    font-size: 14px;
}

th {
    font-weight: 600;
    padding: 8px 12px;
    border-bottom: 2px solid #000000;
}

td {
    padding: 6px 12px;
    border-bottom: 1px solid #dddddd;
}

/* Status indicators */
.in-stock { color: #28a745; }
.low-stock { color: #ffc107; }
.out-of-stock { color: #dc3545; }

.status-bestseller { color: #28a745; font-weight: bold; }
.status-popular { color: #17a2b8; }
.status-normal { color: #6c757d; }
.status-no-sales { color: #999999; }

/* Plain buttons */
button {
    background: none;
    border: 1px solid #000000;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 12px;
    margin: 0 2px;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background-color: #f0f0f0;
}

/* Pagination */
#paginationContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    margin-top: 20px;
    padding: 10px;
}

/* Search input */
#orderSearch {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #000000;
    margin-bottom: 20px;
}

/* No data styling */
.empty-state {
    text-align: center;
    padding: 20px;
    color: #666666;
}

/* Animation for value updates */
@keyframes valueUpdate {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.value-updated {
    animation: valueUpdate 0.5s ease;
}

/* Customer count highlight */
#totalCustomers.highlight {
    background-color: #e8f5e9;
    padding: 5px;
    border-radius: 4px;
    font-weight: bold;
}
`;
document.head.appendChild(dashboardCSS);

// ==================== EXPORT FUNCTIONS ====================
window.filterOrders = filterOrders;
window.changePage = changePage;
window.viewOrderDetails = viewOrderDetails;
window.updateMenuItemValue = updateMenuItemValue;
window.fetchAndCountCustomers = fetchAndCountCustomers;
window.displayCustomerStats = displayCustomerStats;

console.log('✅ Dashboard script loaded successfully');