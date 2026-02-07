// ==================== GLOBAL VARIABLES ====================
let dashboardStats = {
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    inventoryLowStock: 0,
    inventoryOutOfStock: 0,
    totalMenuItems: 0,
    uniqueCustomers: 0,
    todaysOrders: 0,
    todaysRevenue: 0
};

// Customer tracking
let allCustomers = [];
let customerOrdersMap = new Map();

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

// Sales data for chart
let salesData = {
    today: 0,
    weekly: []
};

// DOM Elements
let todaysOrdersBody = null;
let ordersTableBody = null;
let topItemsTableBody = null;
let inventoryTableBody = null;
let paginationContainer = null;

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

// ==================== API UTILITY FUNCTIONS ====================
async function fetchApi(endpoint, options = {}) {
    try {
        console.log(`📡 Fetching: ${endpoint}`);
        
        const response = await fetch(endpoint, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            console.error(`❌ API ${endpoint} returned ${response.status}: ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();
        console.log(`✅ API ${endpoint} response received`);
        return data;
    } catch (error) {
        console.error(`❌ Error fetching ${endpoint}:`, error.message);
        return null;
    }
}

// ==================== CUSTOMER MANAGEMENT ====================
async function fetchAndCountCustomers() {
    try {
        console.log('👥 Fetching customer data...');
        
        // Reset to 0 first
        dashboardStats.totalCustomers = 0;
        dashboardStats.uniqueCustomers = 0;
        allCustomers = [];
        customerOrdersMap.clear();
        
        // Try direct customers API endpoint
        const data = await fetchApi('/api/customers?limit=1000');
        if (data && data.success && data.data) {
            allCustomers = data.data || [];
            dashboardStats.totalCustomers = allCustomers.length;
            dashboardStats.uniqueCustomers = allCustomers.length;
            console.log(`✅ Customers loaded from API: ${allCustomers.length}`);
            return true;
        }
        
        // Try to get customers from orders
        if (allOrders.length > 0) {
            console.log('🔄 Extracting customers from orders...');
            extractCustomersFromOrders();
            return true;
        }
        
        // Fallback: Use stats API
        const statsData = await fetchApi('/api/dashboard/stats');
        if (statsData && statsData.success && statsData.data) {
            dashboardStats.totalCustomers = statsData.data.totalCustomers || 0;
            dashboardStats.uniqueCustomers = statsData.data.totalCustomers || 0;
            console.log(`✅ Customer count from stats: ${dashboardStats.totalCustomers}`);
            return true;
        }
        
        // Always return 0 if no data
        dashboardStats.totalCustomers = 0;
        dashboardStats.uniqueCustomers = 0;
        console.log('✅ Customer stats set to 0');
        return true;
        
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
        
        // Try different possible customer ID fields
        let customerId = order.customerId || 
                        order.customer || 
                        order.customerName || 
                        `walkin-${index}`;
        
        // Create customer display name
        let customerName = order.customerName || 
                          order.customer || 
                          (customerId.startsWith('walkin-') ? 'Walk-in Customer' : `Customer ${customerId.substring(0, 8)}`);
        
        let totalSpent = parseFloat(order.totalAmount || order.total || order.totalPrice || 0);
        
        // Check if customer already exists
        let existingCustomer = allCustomers.find(c => c.id === customerId);
        
        if (!existingCustomer) {
            // New customer
            const newCustomer = {
                id: customerId,
                name: customerName,
                firstOrderDate: order.createdAt || new Date().toISOString(),
                lastOrderDate: order.createdAt || new Date().toISOString(),
                totalOrders: 1,
                totalSpent: totalSpent
            };
            
            allCustomers.push(newCustomer);
            customerOrdersMap.set(customerId, [order._id || order.orderNumber || index]);
        } else {
            // Update existing customer
            existingCustomer.lastOrderDate = order.createdAt || new Date().toISOString();
            existingCustomer.totalOrders += 1;
            existingCustomer.totalSpent += totalSpent;
            
            const orders = customerOrdersMap.get(customerId) || [];
            orders.push(order._id || order.orderNumber || index);
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
        totalCustomersEl.classList.add('highlight');
        setTimeout(() => totalCustomersEl.classList.remove('highlight'), 1000);
    }
}

// ==================== DASHBOARD STATS ====================
async function fetchDashboardStats() {
    try {
        console.log('📊 Fetching dashboard stats...');
        
        // Reset all stats to 0 first
        resetAllStatsToZero();
        
        const data = await fetchApi('/api/dashboard/stats');
        
        if (data && data.success && data.data) {
            // Only update stats if we have valid data
            dashboardStats = {
                totalOrders: data.data.totalOrders || 0,
                totalProducts: data.data.totalProducts || 0,
                totalCustomers: data.data.totalCustomers || 0,
                totalRevenue: data.data.totalRevenue || 0,
                inventoryLowStock: data.data.inventoryLowStock || 0,
                inventoryOutOfStock: data.data.inventoryOutOfStock || 0,
                totalMenuItems: data.data.totalMenuItems || 0,
                uniqueCustomers: data.data.uniqueCustomers || 0,
                todaysOrders: data.data.todaysOrders || 0,
                todaysRevenue: data.data.todaysRevenue || 0
            };
            
            console.log('✅ Dashboard stats loaded:', {
                totalOrders: dashboardStats.totalOrders,
                totalRevenue: dashboardStats.totalRevenue,
                totalCustomers: dashboardStats.totalCustomers,
                totalProducts: dashboardStats.totalProducts,
                todaysOrders: dashboardStats.todaysOrders,
                todaysRevenue: dashboardStats.todaysRevenue
            });
            
            // Update UI immediately
            updateDashboardUI();
            
        } else {
            console.warn('⚠️ Dashboard stats API failed, staying at 0');
            updateDashboardUI();
        }
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        updateDashboardUI();
    }
}

function resetAllStatsToZero() {
    console.log('🔄 Resetting all stats to 0...');
    
    dashboardStats = {
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        inventoryLowStock: 0,
        inventoryOutOfStock: 0,
        totalMenuItems: 0,
        uniqueCustomers: 0,
        todaysOrders: 0,
        todaysRevenue: 0
    };
    
    // Reset sales data
    salesData = {
        today: 0,
        weekly: []
    };
    
    console.log('✅ All stats reset to 0');
}

async function fetchSalesData() {
    try {
        console.log('📈 Fetching sales data...');
        
        // Reset sales data to 0
        salesData = {
            today: 0,
            weekly: []
        };
        
        // Try to get sales data from API
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const data = await fetchApi(`/api/orders?startDate=${weekAgo.toISOString()}&endDate=${today.toISOString()}`);
        
        if (data && data.success) {
            // Calculate weekly sales
            calculateWeeklySales(data.data || []);
            console.log('✅ Sales data loaded from orders');
            return;
        }
        
        // Fallback: Calculate from all orders
        calculateWeeklySales(allOrders);
        
    } catch (error) {
        console.error('❌ Error fetching sales data:', error);
        calculateWeeklySales([]);
    }
}

function calculateWeeklySales(orders) {
    console.log('🔄 Calculating weekly sales...');
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Reset sales data
    salesData.today = 0;
    salesData.weekly = [];
    
    // Calculate today's sales
    salesData.today = orders.reduce((total, order) => {
        if (!order || !order.createdAt) return total;
        
        try {
            const orderDate = new Date(order.createdAt);
            const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            
            if (orderDay.getTime() === today.getTime()) {
                return total + parseFloat(order.total || order.totalAmount || 0);
            }
        } catch (error) {
            // Skip invalid dates
        }
        return total;
    }, 0);
    
    // Calculate weekly sales (last 7 days)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const daySales = orders.reduce((total, order) => {
            if (!order || !order.createdAt) return total;
            
            try {
                const orderDate = new Date(order.createdAt);
                const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
                
                if (orderDay.getTime() === date.getTime()) {
                    return total + parseFloat(order.total || order.totalAmount || 0);
                }
            } catch (error) {
                // Skip invalid dates
            }
            return total;
        }, 0);
        
        salesData.weekly.push({
            day: daysOfWeek[date.getDay()],
            sales: daySales,
            date: date.toISOString()
        });
    }
    
    console.log('✅ Weekly sales calculated');
    updateSalesChart();
}

function updateSalesChart() {
    // Update today's sales
    const todaySalesEl = document.getElementById('todaySales');
    if (todaySalesEl) {
        todaySalesEl.textContent = formatCurrency(salesData.today);
    }
    
    // Update weekly sales if there's a weekly sales chart
    if (salesData.weekly && salesData.weekly.length > 0) {
        // Update any weekly sales display elements
        salesData.weekly.forEach(dayData => {
            const dayEl = document.querySelector(`[data-day="${dayData.day}"]`);
            if (dayEl) {
                dayEl.textContent = formatCurrency(dayData.sales);
            }
        });
    }
}

function updateDashboardUI() {
    console.log('🔄 Updating dashboard UI...');
    
    // Update all dashboard elements
    const elements = {
        'totalOrders': dashboardStats.totalOrders,
        'totalProducts': dashboardStats.totalProducts || dashboardStats.totalMenuItems,
        'totalCustomers': dashboardStats.totalCustomers,
        'totalRevenue': dashboardStats.totalRevenue,
        'totalMenuItems': dashboardStats.totalMenuItems,
        'todaysOrders': dashboardStats.todaysOrders,
        'todaysRevenue': dashboardStats.todaysRevenue
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            const oldValue = element.textContent;
            const formattedValue = id.includes('Revenue') ? formatCurrency(value) : formatNumber(value);
            
            if (formattedValue !== oldValue && oldValue !== '') {
                element.textContent = formattedValue;
                element.classList.add('value-updated');
                setTimeout(() => {
                    element.classList.remove('value-updated');
                }, 1000);
            } else if (oldValue === '' || oldValue !== formattedValue) {
                element.textContent = formattedValue;
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
        
        // Reset orders array
        allOrders = [];
        filteredOrders = [];
        
        // Reset order-related stats
        dashboardStats.totalOrders = 0;
        dashboardStats.todaysOrders = 0;
        dashboardStats.todaysRevenue = 0;
        dashboardStats.totalRevenue = 0;
        
        // Try multiple API endpoints in sequence
        const endpointsToTry = [
            '/api/orders/today',
            '/api/orders?limit=50',
            '/api/orders/recent',
            '/api/transactions',
            '/api/sales'
        ];
        
        let ordersLoaded = false;
        
        for (const endpoint of endpointsToTry) {
            if (ordersLoaded) break;
            
            try {
                console.log(`🔄 Trying endpoint: ${endpoint}`);
                const data = await fetchApi(endpoint);
                
                if (data) {
                    // Extract orders from different response formats
                    let orders = [];
                    
                    if (Array.isArray(data)) {
                        orders = data;
                    } else if (data.data && Array.isArray(data.data)) {
                        orders = data.data;
                    } else if (data.orders && Array.isArray(data.orders)) {
                        orders = data.orders;
                    } else if (data.success && data.data) {
                        orders = Array.isArray(data.data) ? data.data : [data.data];
                    } else if (data.transactions && Array.isArray(data.transactions)) {
                        orders = data.transactions;
                    } else if (data.sales && Array.isArray(data.sales)) {
                        orders = data.sales;
                    }
                    
                    if (orders && orders.length > 0) {
                        // Process and normalize orders
                        allOrders = orders.map(order => {
                            // Normalize order structure
                            return {
                                _id: order._id || order.id || `order-${Math.random().toString(36).substr(2, 9)}`,
                                orderNumber: order.orderNumber || order.transactionId || 
                                          `ORD-${Date.now().toString().substr(-6)}`,
                                customerName: order.customerName || order.customer || 
                                           order.customer_id || 'Walk-in Customer',
                                total: parseFloat(order.total || order.totalAmount || 
                                               order.amount || order.totalPrice || 0),
                                totalAmount: parseFloat(order.totalAmount || order.total || 
                                                    order.amount || order.totalPrice || 0),
                                items: order.items || order.products || order.menuItems || [],
                                createdAt: order.createdAt || order.date || 
                                         order.transactionDate || new Date().toISOString(),
                                status: order.status || 'completed',
                                payment: order.payment || { method: 'cash' }
                            };
                        });
                        
                        console.log(`✅ Loaded ${allOrders.length} orders from ${endpoint}`);
                        ordersLoaded = true;
                        break;
                    }
                }
            } catch (endpointError) {
                console.log(`⚠️ Endpoint ${endpoint} failed:`, endpointError.message);
                // Continue to next endpoint
            }
        }
        
        // If no orders loaded, keep arrays empty
        if (!ordersLoaded) {
            console.log('✅ No orders found, keeping at 0');
            allOrders = [];
        }
        
        filteredOrders = [...allOrders];
        
        // Update order-related stats
        if (allOrders.length > 0) {
            dashboardStats.totalOrders = allOrders.length;
            
            // Calculate total revenue
            dashboardStats.totalRevenue = allOrders.reduce((sum, order) => {
                return sum + parseFloat(order.total || order.totalAmount || 0);
            }, 0);
            
            // Calculate today's stats
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            const todaysOrders = allOrders.filter(order => {
                if (!order || !order.createdAt) return false;
                try {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= todayStart;
                } catch (error) {
                    return false;
                }
            });
            
            dashboardStats.todaysOrders = todaysOrders.length;
            dashboardStats.todaysRevenue = todaysOrders.reduce((sum, order) => {
                return sum + parseFloat(order.total || order.totalAmount || 0);
            }, 0);
        }
        
        // Render tables
        renderOrdersTable();
        renderPagination();
        updateTodaysOrdersTable();
        
        console.log('✅ Orders loaded successfully:', allOrders.length);
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        allOrders = [];
        filteredOrders = [];
        
        renderOrdersTable();
        renderPagination();
        updateTodaysOrdersTable();
    }
}

function updateTodaysOrdersTable() {
    if (!todaysOrdersBody) {
        console.error('❌ todaysOrdersBody element not found!');
        return;
    }
    
    console.log('🕒 Updating Today\'s Orders table...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysOrders = allOrders.filter(order => {
        if (!order || !order.createdAt) return false;
        
        try {
            const orderDate = new Date(order.createdAt);
            return orderDate >= today;
        } catch (error) {
            return false;
        }
    });
    
    console.log(`✅ Today's orders: ${todaysOrders.length}`);
    
    if (todaysOrders.length === 0) {
        todaysOrdersBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #000000;">
                    <i class="fas fa-clipboard-check"></i> No orders for today yet
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by time (newest first) and limit to 6
    todaysOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const displayOrders = todaysOrders.slice(0, 6);
    
    const tableHTML = displayOrders.map((order, index) => {
        let orderTime = new Date(order.createdAt || Date.now());
        const timeString = orderTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
        
        const totalAmount = parseFloat(order.total || order.totalAmount || 0);
        const customerName = order.customerName || order.customer || 'Walk-in Customer';
        
        const displayCustomer = customerName.length > 15 
            ? customerName.substring(0, 15) + '...' 
            : customerName;
        
        const orderNumber = order.orderNumber || 
                           `ORD-${(order._id || 'N/A').toString().substring(0, 8)}`;
        
        return `
        <tr>
            <td style="font-weight: 500; color: #000000;">${orderNumber}</td>
            <td style="text-align: center; color: #000000;">${timeString}</td>
            <td title="${customerName.replace(/"/g, '&quot;')}" style="color: #000000;">${displayCustomer}</td>
            <td style="text-align: center; font-weight: 600; color: #000000;">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    todaysOrdersBody.innerHTML = tableHTML;
}

// ==================== TOP SELLING PRODUCTS ====================
async function loadTopSellingProducts() {
    try {
        console.log('📈 Loading top selling products...');
        
        // Reset sales data
        topSellingProducts = [];
        allSalesData = [];
        
        // Try API endpoint
        const data = await fetchApi('/api/orders/top-selling?period=month&limit=10');
        if (data && data.success && data.data) {
            allSalesData = data.data || [];
            console.log('✅ Sales data loaded from API:', allSalesData.length);
        } else {
            console.log('ℹ️ Top selling API not available');
            allSalesData = [];
        }
        
        // Generate top selling products
        generateTopSellingProducts();
        
    } catch (error) {
        console.error('❌ Error loading top selling products:', error);
        topSellingProducts = [];
        updateTopSellingTable();
    }
}

function generateTopSellingProducts() {
    console.log('🔄 Generating top selling products...');
    
    // Reset top selling products
    topSellingProducts = [];
    
    // If we have sales data, use it
    if (allSalesData.length > 0) {
        topSellingProducts = allSalesData.map(sale => {
            // Find corresponding menu item for stock info
            const menuItem = allMenuItems.find(item => 
                (item.itemName || item.name) === sale.name ||
                (item.itemName && sale.name && item.itemName.includes(sale.name)) ||
                (sale.name && item.itemName && sale.name.includes(item.itemName))
            );
            
            const currentStock = menuItem ? parseFloat(menuItem.currentStock || item.stock || 0) : 0;
            const minStock = menuItem ? parseFloat(menuItem.minStock || 5) : 5;
            
            // Determine status
            let status = 'Normal';
            let statusClass = 'normal';
            
            if (currentStock <= 0) {
                status = 'Out of Stock';
                statusClass = 'out-of-stock';
            } else if (currentStock <= minStock) {
                status = 'Low Stock';
                statusClass = 'low-stock';
            } else if (sale.totalSold >= 100) {
                status = 'Bestseller';
                statusClass = 'bestseller';
            } else if (sale.totalSold >= 50) {
                status = 'Popular';
                statusClass = 'popular';
            } else if (sale.totalSold === 0) {
                status = 'No Sales';
                statusClass = 'no-sales';
            }
            
            return {
                name: sale.name,
                totalRevenue: sale.totalRevenue || 0,
                totalSold: sale.totalSold || 0,
                status: status,
                statusClass: statusClass,
                currentStock: currentStock
            };
        });
        
        // Sort by total revenue (highest first)
        topSellingProducts.sort((a, b) => b.totalRevenue - a.totalRevenue);
        
    } 
    // If no sales data but we have menu items
    else if (allMenuItems.length > 0) {
        console.log('ℹ️ No sales data, showing menu items as "No Sales"');
        topSellingProducts = allMenuItems.map(item => {
            const name = item.itemName || item.name || 'Unknown';
            const currentStock = parseFloat(item.currentStock || item.stock || 0);
            const minStock = parseFloat(item.minStock || 5);
            
            let status = 'No Sales';
            let statusClass = 'no-sales';
            
            if (currentStock <= 0) {
                status = 'Out of Stock';
                statusClass = 'out-of-stock';
            } else if (currentStock <= minStock) {
                status = 'Low Stock';
                statusClass = 'low-stock';
            }
            
            return {
                name: name,
                totalRevenue: 0,
                totalSold: 0,
                status: status,
                statusClass: statusClass,
                currentStock: currentStock
            };
        });
        
        // Sort alphabetically
        topSellingProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        // Keep empty
        console.log('✅ No top selling products to display');
    }
    
    console.log(`✅ Generated ${topSellingProducts.length} top selling products`);
    updateTopSellingTable();
}

function updateTopSellingTable() {
    if (!topItemsTableBody) {
        console.warn('⚠️ topItemsTableBody not found');
        return;
    }
    
    if (topSellingProducts.length === 0) {
        topItemsTableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #000000;">
                    <i class="fas fa-chart-bar"></i> No sales data available
                </td>
            </tr>
        `;
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
            : '<span style="color: #000000; font-style: italic;">No sales</span>';
        
        return `
        <tr>
            <td title="${product.name}" style="color: #000000;">${displayName}</td>
            <td style="text-align: center; font-weight: 500; color: #000000;">${revenueDisplay}</td>
            <td style="text-align: center;">
                <span class="status-badge status-${product.statusClass}">
                    ${product.status}
                </span>
            </td>
        </tr>
        `;
    }).join('');
    
    topItemsTableBody.innerHTML = tableHTML;
}

// ==================== INVENTORY STATUS ====================
async function loadInventoryStatus() {
    try {
        console.log('📦 Loading inventory status...');
        
        // Reset inventory data
        inventoryStatusData = [];
        
        // Try inventory API
        const data = await fetchApi('/api/inventory');
        if (data && data.success && data.data) {
            inventoryStatusData = data.data || [];
            console.log('✅ Inventory loaded from API:', inventoryStatusData.length);
        } else {
            console.log('ℹ️ Inventory API not available');
            
            // Use menu items as fallback
            if (allMenuItems.length > 0) {
                inventoryStatusData = allMenuItems.map(item => {
                    const name = item.itemName || item.name || 'Unknown Item';
                    const stock = parseFloat(item.currentStock || item.stock || 0);
                    const maxStock = parseFloat(item.maxStock || 100);
                    const minStock = parseFloat(item.minStock || 5);
                    const unit = item.unit || 'unit';
                    
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
                        statusClass: statusClass
                    };
                });
            }
        }
        
        updateInventoryStatusTable();
        
    } catch (error) {
        console.error('❌ Error loading inventory status:', error);
        inventoryStatusData = [];
        updateInventoryStatusTable();
    }
}

function updateInventoryStatusTable() {
    if (!inventoryTableBody) {
        console.warn('⚠️ inventoryTableBody not found');
        return;
    }
    
    if (inventoryStatusData.length === 0) {
        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #000000;">
                    <i class="fas fa-boxes"></i> No inventory items available
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by status priority
    const sortedItems = [...inventoryStatusData].sort((a, b) => {
        const statusOrder = { 'Out of Stock': 0, 'Low Stock': 1, 'In Stock': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });
    
    // Show only top 10 items
    const displayItems = sortedItems.slice(0, 10);
    
    const tableHTML = displayItems.map(item => {
        const displayName = item.name.length > 20 
            ? item.name.substring(0, 20) + '...' 
            : item.name;
        
        const stockDisplay = item.displayStock || `${formatNumber(item.stock)} ${item.unit || 'unit'}`;
        
        return `
        <tr>
            <td title="${item.name}" style="color: #000000;">${displayName}</td>
            <td style="text-align: center; font-family: monospace; color: #000000;">${stockDisplay}</td>
            <td style="text-align: center;">
                <span class="status-badge status-${item.statusClass}">
                    ${item.status}
                </span>
            </td>
        </tr>
        `;
    }).join('');
    
    inventoryTableBody.innerHTML = tableHTML;
}

// ==================== MENU MANAGEMENT ====================
async function fetchMenuItems() {
    try {
        console.log('🍽️ Fetching menu items...');
        
        // Reset menu items
        allMenuItems = [];
        dashboardStats.totalMenuItems = 0;
        dashboardStats.totalProducts = 0;
        
        const data = await fetchApi('/api/menu');
        
        if (data && data.success && data.data) {
            allMenuItems = data.data || [];
            console.log('✅ Menu items loaded:', allMenuItems.length);
            
            // Update dashboard with menu item count
            dashboardStats.totalMenuItems = allMenuItems.length;
            dashboardStats.totalProducts = allMenuItems.length;
            
            // Update dependent displays
            updateDashboardUI();
            
        } else {
            console.log('✅ No menu items available');
            // Keep at 0
        }
    } catch (error) {
        console.error('❌ Error fetching menu items:', error);
        allMenuItems = [];
        dashboardStats.totalMenuItems = 0;
        dashboardStats.totalProducts = 0;
        updateDashboardUI();
    }
}

// ==================== CACHE DOM ELEMENTS ====================
function cacheDOMElements() {
    console.log('🔍 Caching DOM elements...');
    
    todaysOrdersBody = document.getElementById('todaysOrdersBody');
    ordersTableBody = document.getElementById('ordersTableBody');
    topItemsTableBody = document.getElementById('topItemsTableBody');
    inventoryTableBody = document.getElementById('inventoryTableBody');
    paginationContainer = document.getElementById('paginationContainer');
    
    console.log('✅ DOM elements cached:', {
        todaysOrdersBody: !!todaysOrdersBody,
        ordersTableBody: !!ordersTableBody,
        topItemsTableBody: !!topItemsTableBody,
        inventoryTableBody: !!inventoryTableBody,
        paginationContainer: !!paginationContainer
    });
}

// ==================== RENDER FUNCTIONS ====================
function renderOrdersTable() {
    if (!ordersTableBody) {
        console.warn('⚠️ ordersTableBody not found');
        return;
    }
    
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    if (totalPages > 0 && currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredOrders.length);
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    if (pageOrders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #000000;">
                    <i class="fas fa-search"></i> No orders found
                </td>
            </tr>
        `;
        return;
    }
    
    const tableHTML = pageOrders.map(order => {
        const orderTime = new Date(order.createdAt || Date.now());
        const timeString = orderTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        }).toLowerCase();
        
        const totalAmount = parseFloat(order.total || order.totalAmount || 0);
        
        const orderNumber = order.orderNumber || 
                           `ORD-${(order._id || '000000').toString().substring(0, 8)}`;
        
        const customerName = order.customerName || order.customer || 'Walk-in Customer';
        
        const displayCustomer = customerName.length > 20 
            ? customerName.substring(0, 20) + '...' 
            : customerName;
        
        return `
        <tr>
            <td style="font-weight: 500; color: #000000;">${orderNumber}</td>
            <td style="text-align: center; color: #000000;">${timeString}</td>
            <td title="${customerName.replace(/"/g, '&quot;')}" style="color: #000000;">${displayCustomer}</td>
            <td style="text-align: center; font-weight: 600; color: #000000;">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    ordersTableBody.innerHTML = tableHTML;
}

// ==================== PAGINATION ====================
function renderPagination() {
    if (!paginationContainer) {
        console.warn('⚠️ paginationContainer not found');
        return;
    }
    
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="pagination-btn">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button ${currentPage === i ? 'class="active"' : ''} onclick="changePage(${i})" class="pagination-btn">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="pagination-btn">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderOrdersTable();
    renderPagination();
    
    // Scroll to top of table
    const table = document.querySelector('#ordersTableBody');
    if (table) {
        table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ==================== FILTER ORDERS ====================
function filterOrders(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(order => {
            const orderNumber = order.orderNumber || 
                              `ORD-${(order._id || '').toString().substring(0, 8)}`;
            const customerName = (order.customerName || order.customer || '').toLowerCase();
            
            return orderNumber.toLowerCase().includes(term) ||
                   customerName.includes(term);
        });
    }
    
    currentPage = 1;
    renderOrdersTable();
    renderPagination();
}

// ==================== INITIALIZATION ====================
async function initializeDashboard() {
    console.log('🚀 Dashboard initializing...');
    
    try {
        // Add CSS styles first
        addDashboardStyles();
        
        // Cache DOM elements
        cacheDOMElements();
        
        // Setup event listeners
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                filterOrders(e.target.value);
            });
        }
        
        // Show loading state
        showLoadingState();
        
        // Reset all stats to 0 initially
        resetAllStatsToZero();
        updateDashboardUI();
        
        console.log('📦 Loading dashboard data...');
        
        // Load data sequentially to avoid race conditions
        await fetchMenuItems();
        await loadOrders();
        await fetchDashboardStats();
        
        // Load inventory and top selling after we have menu items and orders
        await loadInventoryStatus();
        await loadTopSellingProducts();
        await fetchAndCountCustomers();
        
        console.log('✅ Dashboard initialization complete');
        console.log('📊 Final Stats:', dashboardStats);
        
        // Hide loading state
        hideLoadingState();
        
        // Setup auto-refresh
        setupAutoRefresh();
        
    } catch (error) {
        console.error('❌ Error during dashboard initialization:', error);
        hideLoadingState();
    }
}

function showLoadingState() {
    // Add loading indicators to tables
    const loadingHTML = `
        <tr>
            <td colspan="4" style="text-align: center; padding: 20px; color: #000000;">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i> Loading...
                </div>
            </td>
        </tr>
    `;
    
    if (todaysOrdersBody) todaysOrdersBody.innerHTML = loadingHTML;
    if (ordersTableBody) ordersTableBody.innerHTML = loadingHTML;
    if (topItemsTableBody) topItemsTableBody.innerHTML = loadingHTML;
    if (inventoryTableBody) inventoryTableBody.innerHTML = loadingHTML;
}

function hideLoadingState() {
    console.log('👋 Hiding loading state...');
    // Tables will be updated with actual data
}

function setupAutoRefresh() {
    // Auto-refresh every 60 seconds
    setInterval(() => {
        console.log('🔄 Auto-refresh triggered');
        refreshDashboardData();
    }, 60000);
}

async function refreshDashboardData() {
    try {
        console.log('🔄 Refreshing dashboard data...');
        await fetchDashboardStats();
        await loadOrders();
        updateTodaysOrdersTable();
        renderOrdersTable();
        console.log('✅ Dashboard data refreshed');
    } catch (error) {
        console.error('❌ Error refreshing dashboard:', error);
    }
}

// ==================== UTILITY FUNCTIONS ====================
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (order) {
        const items = order.items || [];
        const itemsList = items.map(item => 
            `${item.itemName || item.name || 'Unknown'} x${item.quantity || 1} = ${formatCurrency((item.price || 0) * (item.quantity || 1))}`
        ).join('\n');
        
        alert(
            `ORDER DETAILS\n\n` +
            `Order #: ${order.orderNumber || 'N/A'}\n` +
            `Customer: ${order.customerName || 'Walk-in'}\n` +
            `Date: ${formatDate(order.createdAt)}\n` +
            `Status: ${order.status || 'Completed'}\n` +
            `Payment: ${order.payment?.method || 'Cash'}\n` +
            `Total: ${formatCurrency(order.total || order.totalAmount || 0)}\n\n` +
            `ITEMS:\n${itemsList}`
        );
    } else {
        alert('Order not found');
    }
}

// ==================== CSS STYLES ====================
function addDashboardStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Base styles for black text and small fonts */
        body, html {
            color: #000000 !important;
            font-size: 13px !important;
        }
        
        /* Value update animation */
        @keyframes valueUpdate {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .value-updated {
            animation: valueUpdate 0.5s ease;
            color: #000000 !important;
        }
        
        /* Highlight animation */
        @keyframes highlight {
            0% { background-color: transparent; }
            50% { background-color: #f5f5f5; }
            100% { background-color: transparent; }
        }
        
        .highlight {
            animation: highlight 1s ease;
        }
        
        /* Loading spinner */
        .loading-spinner {
            color: #000000;
            font-size: 12px;
        }
        
        .loading-spinner .fa-spinner {
            margin-right: 6px;
            color: #000000;
        }
        
        /* Status badges */
        .status-badge {
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: 600;
            display: inline-block;
            min-width: 70px;
            text-align: center;
            color: #000000;
        }
        
        .status-in-stock { background-color: #f0f0f0; color: #000000; border: 1px solid #d0d0d0; }
        .status-out-of-stock { background-color: #f0f0f0; color: #000000; border: 1px solid #d0d0d0; }
        .status-low-stock { background-color: #f0f0f0; color: #000000; border: 1px solid #d0d0d0; }
        .status-bestseller { background-color: #f0f0f0; color: #000000; border: 1px solid #d0d0d0; }
        .status-popular { background-color: #f0f0f0; color: #000000; border: 1px solid #d0d0d0; }
        .status-normal { background-color: #f0f0f0; color: #000000; border: 1px solid #d0d0d0; }
        .status-no-sales { background-color: #f0f0f0; color: #000000; border: 1px solid #d0d0d0; }
        
        /* Table styling */
        table {
            border-collapse: collapse;
            width: 100%;
            font-size: 12px;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0,0,0,0.05);
            color: #000000;
        }
        
        th {
            font-weight: 600;
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            background-color: #f8f8f8;
            color: #000000;
            font-size: 12px;
        }
        
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #f0f0f0;
            vertical-align: middle;
            color: #000000;
            font-size: 12px;
        }
        
        tr:last-child td {
            border-bottom: none;
        }
        
        /* Pagination */
        .pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 15px;
            flex-wrap: wrap;
            gap: 4px;
        }
        
        .pagination-btn {
            background: white;
            border: 1px solid #e0e0e0;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 11px;
            border-radius: 4px;
            transition: all 0.2s;
            color: #000000;
            min-width: 32px;
            text-align: center;
        }
        
        .pagination-btn:hover:not(:disabled) {
            background-color: #f8f8f8;
            border-color: #d0d0d0;
        }
        
        .pagination-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            color: #888888;
        }
        
        .pagination-btn.active {
            background-color: #f0f0f0;
            color: #000000;
            border-color: #d0d0d0;
            font-weight: 600;
        }
        
        .pagination-ellipsis {
            padding: 6px 6px;
            color: #000000;
            font-size: 11px;
        }
        
        /* Search input */
        #orderSearch {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            font-size: 12px;
            transition: all 0.2s;
            background: white;
            color: #000000;
        }
        
        #orderSearch:focus {
            outline: none;
            border-color: #c0c0c0;
            box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
        }
        
        #orderSearch::placeholder {
            color: #888888;
        }
        
        /* Stat cards */
        .stat-card {
            background: white;
            border-radius: 8px;
            padding: 18px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            text-align: center;
            margin-bottom: 15px;
            transition: transform 0.3s, box-shadow 0.3s;
            border: 1px solid #f0f0f0;
            color: #000000;
        }
        
        .stat-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }
        
        .stat-card h3 {
            font-size: 22px;
            font-weight: 700;
            margin: 8px 0;
            color: #000000;
        }
        
        .stat-card p {
            color: #000000;
            font-size: 11px;
            margin: 0;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        /* Dashboard grid */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 18px;
            margin-bottom: 30px;
        }
        
        /* Section headers */
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #f0f0f0;
            color: #000000;
        }
        
        .section-header h2 {
            font-size: 16px;
            font-weight: 600;
            color: #000000;
            margin: 0;
        }
        
        /* Card headers */
        .card-header {
            color: #000000;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        /* Icons */
        i, .fas, .far, .fab {
            color: #000000;
        }
        
        /* Currency formatting */
        .currency {
            color: #000000 !important;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            table {
                font-size: 11px;
            }
            
            th, td {
                padding: 8px 10px;
            }
            
            .stat-card {
                padding: 15px;
            }
            
            .stat-card h3 {
                font-size: 20px;
            }
            
            .section-header h2 {
                font-size: 14px;
            }
        }
        
        @media (max-width: 480px) {
            .section-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .pagination-btn {
                padding: 4px 8px;
                margin: 0 1px;
                font-size: 10px;
                min-width: 28px;
            }
            
            body, html {
                font-size: 12px !important;
            }
        }
        
        /* Ensure all text is black */
        * {
            color: #000000 !important;
        }
        
        /* Override any color styles */
        .text-muted, .text-secondary, .text-gray, .text-light {
            color: #000000 !important;
        }
        
        /* Links */
        a {
            color: #000000 !important;
        }
        
        a:hover {
            color: #333333 !important;
        }
        
        /* Button text */
        button, .btn {
            color: #000000 !important;
        }
        
        /* Headings */
        h1, h2, h3, h4, h5, h6 {
            color: #000000 !important;
        }
        
        /* Labels */
        label {
            color: #000000 !important;
        }
        
        /* Form controls */
        input, select, textarea {
            color: #000000 !important;
        }
        
        /* Placeholder text */
        ::placeholder {
            color: #888888 !important;
        }
        
        /* Disabled elements */
        :disabled {
            color: #888888 !important;
        }
    `;
    document.head.appendChild(style);
}

// ==================== EXPORT FUNCTIONS ====================
// Make functions available globally
window.filterOrders = filterOrders;
window.changePage = changePage;
window.viewOrderDetails = viewOrderDetails;
window.fetchAndCountCustomers = fetchAndCountCustomers;
window.displayCustomerStats = displayCustomerStats;
window.refreshDashboardData = refreshDashboardData;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all elements are properly loaded
    setTimeout(initializeDashboard, 100);
});

console.log('✅ Dashboard script loaded successfully');