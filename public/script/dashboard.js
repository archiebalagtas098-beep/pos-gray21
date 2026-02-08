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

// Data stores
let allOrders = [];
let allMenuItems = [];
let allInventory = [];
let allCustomers = [];
let topSellingProducts = [];

// DOM Elements
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
    return '₱' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
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
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(endpoint, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: controller.signal,
            ...options
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            console.error(`❌ API ${endpoint} returned ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`Error response: ${errorText}`);
            return null;
        }
        
        const data = await response.json();
        console.log(`✅ API ${endpoint} response received:`, data);
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn(`⏰ Timeout fetching ${endpoint}`);
        } else {
            console.error(`❌ Error fetching ${endpoint}:`, error.message, error);
        }
        return null;
    }
}

// ==================== DATA FETCHING FUNCTIONS ====================
async function fetchAllData() {
    console.log('📊 Fetching all dashboard data...');
    
    try {
        // 1. First fetch the pre-calculated stats from the backend
        console.log('🔹 Step 1: Fetching stats from /api/stats');
        const statsData = await fetchApi('/api/stats');
        
        if (statsData && statsData.success && statsData.data) {
            console.log('✅ Stats fetched successfully from backend:', {
                totalOrders: statsData.data.totalOrders,
                totalRevenue: statsData.data.totalRevenue,
                todaysOrders: statsData.data.todaysOrders,
                todaysRevenue: statsData.data.todaysRevenue
            });
            dashboardStats = statsData.data;
        } else {
            console.warn('⚠️ Failed to fetch stats from backend:', statsData);
        }
        
        // 2. Fetch detailed data for tables (in parallel) - always do this for table display
        console.log('🔹 Step 2: Fetching detailed data for tables');
        const [ordersData, menuData, inventoryData, customersData] = await Promise.allSettled([
            fetchOrdersData(),
            fetchMenuData(),
            fetchInventoryData(),
            fetchCustomersData()
        ]);
        
        // Process results
        allOrders = ordersData.status === 'fulfilled' ? ordersData.value : [];
        allMenuItems = menuData.status === 'fulfilled' ? menuData.value : [];
        allInventory = inventoryData.status === 'fulfilled' ? inventoryData.value : [];
        allCustomers = customersData.status === 'fulfilled' ? customersData.value : [];
        
        console.log('📦 Data loaded:', {
            orders: allOrders.length,
            menuItems: allMenuItems.length,
            inventory: allInventory.length,
            customers: allCustomers.length,
            statsExists: Object.keys(dashboardStats).length > 0
        });
        
        // Only calculate stats locally if backend stats failed
        if (!statsData || !statsData.success) {
            console.log('🔹 Step 3: Calculating stats locally (backend failed)');
            calculateAllStatistics();
        }
        
        // Update all UI components
        updateAllUIComponents();
        
        console.log('✅ All data fetched and processed');
        console.log('📊 Final dashboard stats:', {
            totalOrders: dashboardStats.totalOrders,
            totalRevenue: dashboardStats.totalRevenue,
            todaysOrders: dashboardStats.todaysOrders,
            todaysRevenue: dashboardStats.todaysRevenue
        });
        
    } catch (error) {
        console.error('❌ Error fetching all data:', error);
        // Use fallback data or keep existing data
    }
}

// ==================== SPECIFIC DATA FETCHERS ====================
async function fetchOrdersData() {
    console.log('📋 Fetching orders...');
    
    // Try multiple endpoints
    const endpoints = [
        '/api/orders?limit=1000',
        '/api/orders?page=1&limit=1000',
        '/api/orders/recent',
        '/api/transactions',
        '/api/sales/orders'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const data = await fetchApi(endpoint);
            if (data) {
                // Extract orders from different response formats
                let orders = extractOrdersFromResponse(data);
                if (orders.length > 0) {
                    console.log(`✅ Orders loaded from ${endpoint}: ${orders.length}`);
                    return orders;
                }
            }
        } catch (error) {
            console.warn(`⚠️ Failed to fetch from ${endpoint}:`, error.message);
        }
    }
    
    console.log('ℹ️ No orders data available');
    return [];
}

function extractOrdersFromResponse(data) {
    let orders = [];
    
    if (Array.isArray(data)) {
        orders = data;
    } else if (data && data.success && Array.isArray(data.data)) {
        orders = data.data;
    } else if (data && data.orders && Array.isArray(data.orders)) {
        orders = data.orders;
    } else if (data && data.transactions && Array.isArray(data.transactions)) {
        orders = data.transactions;
    }
    
    // Normalize order structure
    return orders.map((order, index) => {
        // Handle payment object structure
        const payment = order.payment || {};
        const totalAmount = order.totalAmount || order.total || order.amount || 0;
        const paymentMethod = payment.method || order.paymentMethod || 'cash';
        
        return {
            id: order._id || order.id || `order-${Date.now()}-${index}`,
            orderNumber: order.orderNumber || order.transactionId || `ORD-${String(index + 1).padStart(4, '0')}`,
            customerId: order.customerId || order.customer || `CUST-${index + 1}`,
            customerName: order.customerName || order.customer || 'Walk-in Customer',
            totalAmount: parseFloat(totalAmount),
            items: (order.items || order.products || []).map(item => ({
                name: item.name || item.itemName || 'Unknown Product',
                itemName: item.itemName || item.name || 'Unknown Product',
                quantity: parseInt(item.quantity) || 1,
                price: parseFloat(item.price) || 0
            })),
            status: order.status || 'completed',
            paymentMethod: paymentMethod,
            createdAt: order.createdAt || order.date || new Date().toISOString(),
            updatedAt: order.updatedAt || order.createdAt
        };
    });
}

async function fetchMenuData() {
    console.log('🍽️ Fetching menu items...');
    
    try {
        // Try /api/menu first
        const data = await fetchApi('/api/menu');
        if (data && data.success && data.data && data.data.length > 0) {
            console.log(`✅ Menu items loaded from /api/menu: ${data.data.length}`);
            return data.data.map(item => ({
                _id: item._id || item.id,
                itemName: item.itemName || item.name || 'Unknown',
                name: item.itemName || item.name || 'Unknown',
                stock: item.stock || 0,
                category: item.category || 'General',
                price: item.price || 0,
                status: item.status || 'available'
            }));
        }
        
    } catch (error) {
        console.warn('⚠️ Failed to fetch from /api/menu:', error.message);
    }
    
    console.log('ℹ️ No menu data available');
    return [];
}

async function fetchInventoryData() {
    console.log('📦 Fetching inventory...');
    
    try {
        const data = await fetchApi('/api/inventory');
        if (data && data.success && data.data && data.data.length > 0) {
            console.log(`✅ Inventory loaded: ${data.data.length}`);
            return data.data.map(item => ({
                _id: item._id || item.id,
                name: item.itemName || item.name || 'Unknown',
                itemName: item.itemName || item.name || 'Unknown',
                stock: item.currentStock || item.stock || 0,
                unit: item.unit || 'pcs',
                minStock: item.minStock || 5,
                maxStock: item.maxStock || 100,
                category: item.category || 'General'
            }));
        }
        
        // If no inventory API or empty, use menu items as fallback
        if (allMenuItems && allMenuItems.length > 0) {
            console.log('🔄 Using menu items as inventory fallback');
            return allMenuItems.map(item => ({
                id: item._id || item.id,
                name: item.itemName || item.name || 'Unknown',
                stock: item.stock || 0,
                unit: item.unit || 'pcs',
                minStock: item.minStock || 5,
                maxStock: item.maxStock || 100,
                category: item.category || 'General'
            }));
        }
        
    } catch (error) {
        console.warn('⚠️ Failed to fetch inventory:', error.message);
    }
    
    console.log('ℹ️ No inventory data available');
    return [];
}

async function fetchCustomersData() {
    console.log('👥 Fetching customers...');
    
    try {
        const data = await fetchApi('/api/customers');
        if (data && data.success && data.data) {
            console.log(`✅ Customers loaded: ${data.data.length}`);
            return data.data;
        }
        
        // Extract customers from orders if no customer API
        if (allOrders.length > 0) {
            console.log('🔄 Extracting customers from orders');
            return extractCustomersFromOrders();
        }
        
    } catch (error) {
        console.warn('⚠️ Failed to fetch customers:', error.message);
    }
    
    console.log('ℹ️ No customer data available');
    return [];
}

function extractCustomersFromOrders() {
    const customerMap = new Map();
    
    allOrders.forEach(order => {
        const customerId = order.customerId || `cust-${Math.random().toString(36).substr(2, 9)}`;
        
        if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
                id: customerId,
                name: order.customerName || 'Walk-in Customer',
                firstOrder: order.createdAt,
                lastOrder: order.createdAt,
                totalOrders: 1,
                totalSpent: order.totalAmount || 0
            });
        } else {
            const customer = customerMap.get(customerId);
            customer.totalOrders += 1;
            customer.totalSpent += order.totalAmount || 0;
            customer.lastOrder = order.createdAt;
        }
    });
    
    return Array.from(customerMap.values());
}

// ==================== STATISTICS CALCULATION ====================
function calculateAllStatistics() {
    console.log('🧮 Calculating statistics...');
    
    // Reset all stats
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
    
    // 1. Total Orders (from orders data)
    dashboardStats.totalOrders = allOrders.length;
    
    // 2. Total Menu Items (from menu data)
    dashboardStats.totalMenuItems = allMenuItems.length;
    
    // 3. Total Inventory Items (from inventory data)
    dashboardStats.totalProducts = allInventory.length;
    
    // 4. Total Customers (from customers data)
    dashboardStats.totalCustomers = allCustomers.length;
    
    // 5. Total Revenue (sum of all order totals)
    dashboardStats.totalRevenue = allOrders.reduce((sum, order) => {
        return sum + (order.total || order.totalAmount || 0);
    }, 0);
    
    // 6. Today's Orders and Revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysOrders = allOrders.filter(order => {
        try {
            const orderDate = new Date(order.createdAt);
            return orderDate >= today;
        } catch (error) {
            return false;
        }
    });
    
    dashboardStats.todaysOrders = todaysOrders.length;
    dashboardStats.todaysRevenue = todaysOrders.reduce((sum, order) => {
        return sum + (order.total || order.totalAmount || 0);
    }, 0);
    
    // 7. Inventory Status
    if (allInventory.length > 0) {
        dashboardStats.inventoryLowStock = allInventory.filter(item => {
            const stock = item.stock || 0;
            const minStock = item.minStock || 5;
            return stock > 0 && stock <= minStock;
        }).length;
        
        dashboardStats.inventoryOutOfStock = allInventory.filter(item => {
            const stock = item.stock || 0;
            return stock <= 0;
        }).length;
    }
    
    // 8. Unique Customers
    dashboardStats.uniqueCustomers = allCustomers.length;
    
    // 9. Calculate top selling products
    calculateTopSellingProducts();
    
    console.log('📊 Statistics calculated:', dashboardStats);
}

function calculateTopSellingProducts() {
    console.log('🏆 Calculating top selling products...');
    
    // Reset top selling products
    topSellingProducts = [];
    
    // Create a map to aggregate sales by product
    const productSales = new Map();
    
    // Aggregate sales from all orders
    allOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const productName = item.name || item.itemName || 'Unknown Product';
                const quantity = parseInt(item.quantity) || 1;
                const price = parseFloat(item.price) || 0;
                const total = quantity * price;
                
                if (!productSales.has(productName)) {
                    productSales.set(productName, {
                        name: productName,
                        totalSold: quantity,
                        totalRevenue: total,
                        ordersCount: 1
                    });
                } else {
                    const existing = productSales.get(productName);
                    existing.totalSold += quantity;
                    existing.totalRevenue += total;
                    existing.ordersCount += 1;
                }
            });
        }
    });
    
    // Convert to array and sort by revenue
    topSellingProducts = Array.from(productSales.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10); // Top 10
    
    console.log(`✅ Top selling products calculated: ${topSellingProducts.length}`);
}

// ==================== UI UPDATE FUNCTIONS ====================
function updateAllUIComponents() {
    console.log('🎨 Updating all UI components...');
    
    // 1. Update main dashboard stats
    updateDashboardStats();
    
    // 2. Update Today's Orders table
    updateTodaysOrdersTable();
    
    // 3. Update Top Selling Items table
    updateTopSellingTable();
    
    // 4. Update Inventory Status table
    updateInventoryTable();
    
    // 5. Update Sales Overview
    updateSalesOverview();
    
    console.log('✅ All UI components updated');
}

function updateDashboardStats() {
    console.log('📊 Updating dashboard stats display...');
    console.log('Current dashboardStats object:', dashboardStats);
    
    const elements = {
        'totalOrders': dashboardStats.totalOrders,
        'totalProducts': dashboardStats.totalInventoryItems || dashboardStats.totalProducts,
        'totalCustomers': dashboardStats.totalCustomers,
        'totalRevenue': dashboardStats.totalRevenue,
        'totalMenuItems': dashboardStats.totalMenuItems,
        'todaysOrders': dashboardStats.todaysOrders,
        'todaysRevenue': dashboardStats.todaysRevenue
    };
    
    console.log('📋 Elements to update:', elements);
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            const formattedValue = id.includes('Revenue') ? formatCurrency(value) : formatNumber(value);
            console.log(`✏️ Updating ${id}: ${value} -> ${formattedValue}`);
            element.textContent = formattedValue;
            
            // Add animation for updated values
            if (value > 0) {
                element.classList.add('value-updated');
                setTimeout(() => element.classList.remove('value-updated'), 1000);
            }
        } else {
            console.warn(`⚠️ Element not found: ${id}`);
        }
    });
    
    console.log('✅ Dashboard stats updated');
}

function updateTodaysOrdersTable() {
    if (!todaysOrdersBody) {
        todaysOrdersBody = document.getElementById('todaysOrdersBody');
    }
    
    if (!todaysOrdersBody) {
        console.error('❌ todaysOrdersBody element not found!');
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's orders
    const todaysOrders = allOrders.filter(order => {
        try {
            const orderDate = new Date(order.createdAt);
            return orderDate >= today;
        } catch (error) {
            return false;
        }
    });
    
    if (todaysOrders.length === 0) {
        todaysOrdersBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-clipboard-check"></i> No orders for today yet
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by time (newest first) and limit to 6
    todaysOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const displayOrders = todaysOrders.slice(0, 6);
    
    const tableHTML = displayOrders.map(order => {
        const orderTime = new Date(order.createdAt || Date.now());
        const timeString = orderTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
        
        const totalAmount = order.totalAmount || 0;
        const customerName = order.customerName || 'Walk-in Customer';
        
        const displayCustomer = customerName.length > 15 
            ? customerName.substring(0, 15) + '...' 
            : customerName;
        
        const orderNumber = order.orderNumber || 
                           `ORD-${(order.id || 'N/A').toString().substring(0, 8)}`;
        
        return `
        <tr>
            <td style="font-weight: 500;">${orderNumber}</td>
            <td style="text-align: center; color: #666;">${timeString}</td>
            <td title="${customerName.replace(/"/g, '&quot;')}">${displayCustomer}</td>
            <td style="text-align: center; font-weight: 600; color: #28a745;">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    todaysOrdersBody.innerHTML = tableHTML;
}

function updateTopSellingTable() {
    if (!topItemsTableBody) {
        topItemsTableBody = document.getElementById('topItemsTableBody');
    }
    
    if (!topItemsTableBody) {
        console.error('❌ topItemsTableBody element not found!');
        return;
    }
    
    if (topSellingProducts.length === 0) {
        topItemsTableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-chart-bar"></i> No sales data available
                </td>
            </tr>
        `;
        return;
    }
    
    const tableHTML = topSellingProducts.map(product => {
        const displayName = product.name.length > 25 
            ? product.name.substring(0, 25) + '...' 
            : product.name;
        
        const revenueDisplay = product.totalRevenue > 0 
            ? formatCurrency(product.totalRevenue)
            : '<span style="color: #999; font-style: italic;">No sales</span>';
        
        // Determine status based on sales volume
        let status = 'Normal';
        let statusClass = 'normal';
        
        if (product.totalRevenue >= 10000) {
            status = 'Bestseller';
            statusClass = 'bestseller';
        } else if (product.totalRevenue >= 5000) {
            status = 'Popular';
            statusClass = 'popular';
        } else if (product.totalRevenue === 0) {
            status = 'No Sales';
            statusClass = 'no-sales';
        }
        
        return `
        <tr>
            <td title="${product.name}">${displayName}</td>
            <td style="text-align: center; font-weight: 500;">${revenueDisplay}</td>
            <td style="text-align: center;">
                <span class="status-badge status-${statusClass}">
                    ${status}
                </span>
            </td>
        </tr>
        `;
    }).join('');
    
    topItemsTableBody.innerHTML = tableHTML;
}

function updateInventoryTable() {
    if (!inventoryTableBody) {
        inventoryTableBody = document.getElementById('inventoryTableBody');
    }
    
    if (!inventoryTableBody) {
        console.error('❌ inventoryTableBody element not found!');
        return;
    }
    
    if (allInventory.length === 0) {
        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-boxes"></i> No inventory items available
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by stock level (lowest first)
    const sortedInventory = [...allInventory].sort((a, b) => {
        const stockA = a.stock || 0;
        const stockB = b.stock || 0;
        return stockA - stockB;
    });
    
    // Show only top 10 items
    const displayItems = sortedInventory.slice(0, 10);
    
    const tableHTML = displayItems.map(item => {
        const displayName = item.name?.length > 20 
            ? item.name.substring(0, 20) + '...' 
            : item.name || 'Unknown Item';
        
        const stock = item.stock || 0;
        const minStock = item.minStock || 5;
        const unit = item.unit || 'pcs';
        
        let status = 'In Stock';
        let statusClass = 'in-stock';
        
        if (stock <= 0) {
            status = 'Out of Stock';
            statusClass = 'out-of-stock';
        } else if (stock <= minStock) {
            status = 'Low Stock';
            statusClass = 'low-stock';
        }
        
        return `
        <tr>
            <td title="${item.name || 'Unknown Item'}">${displayName}</td>
            <td style="text-align: center; font-family: monospace;">${formatNumber(stock)} ${unit}</td>
            <td style="text-align: center;">
                <span class="status-badge status-${statusClass}">
                    ${status}
                </span>
            </td>
        </tr>
        `;
    }).join('');
    
    inventoryTableBody.innerHTML = tableHTML;
}

function updateSalesOverview() {
    // Update Today's Sales
    const todaySalesEl = document.getElementById('todaySales');
    if (todaySalesEl) {
        todaySalesEl.textContent = formatCurrency(dashboardStats.todaysRevenue);
    }
    
    // Update last updated time
    const lastUpdatedEl = document.querySelector('.last-updated');
    if (lastUpdatedEl) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        lastUpdatedEl.textContent = `Updated ${timeString}`;
    }
}

// ==================== INITIALIZATION ====================
async function initializeDashboard() {
    console.log('🚀 Dashboard initializing...');
    
    try {
        // 1. Cache DOM elements
        cacheDOMElements();
        
        // 2. Show loading state
        showLoadingState();
        
        // 3. Initialize stats from server-rendered HTML
        console.log('🔹 Reading stats from server-rendered HTML');
        initializeStatsFromHTML();
        
        // 4. Set up event listeners
        setupEventListeners();
        
        // 5. Fetch all data (this will update stats if needed)
        await fetchAllData();
        
        // 6. Set up auto-refresh
        setupAutoRefresh();
        
        console.log('✅ Dashboard initialization complete');
        console.log('📊 Final stats:', dashboardStats);
        
    } catch (error) {
        console.error('❌ Error during dashboard initialization:', error);
        
        // Show error state but keep UI functional
        showErrorState();
    } finally {
        // Hide loading state
        hideLoadingState();
    }
}

function initializeStatsFromHTML() {
    // Try to read already-rendered stats from the HTML
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalCustomersEl = document.getElementById('totalCustomers');
    const totalMenuItemsEl = document.getElementById('totalMenuItems');
    
    if (totalOrdersEl && totalOrdersEl.textContent && totalOrdersEl.textContent !== '0') {
        dashboardStats.totalOrders = parseInt(totalOrdersEl.textContent) || 0;
        console.log(`✅ Loaded totalOrders from HTML: ${dashboardStats.totalOrders}`);
    }
    
    if (totalRevenueEl) {
        const revenueText = totalRevenueEl.textContent.replace('₱', '').replace(/,/g, '');
        const revenue = parseFloat(revenueText) || 0;
        if (revenue > 0) {
            dashboardStats.totalRevenue = revenue;
            console.log(`✅ Loaded totalRevenue from HTML: ${dashboardStats.totalRevenue}`);
        }
    }
    
    if (totalCustomersEl && totalCustomersEl.textContent && totalCustomersEl.textContent !== '0') {
        dashboardStats.totalCustomers = parseInt(totalCustomersEl.textContent) || 0;
        console.log(`✅ Loaded totalCustomers from HTML: ${dashboardStats.totalCustomers}`);
    }
    
    if (totalMenuItemsEl && totalMenuItemsEl.textContent && totalMenuItemsEl.textContent !== '0') {
        dashboardStats.totalMenuItems = parseInt(totalMenuItemsEl.textContent) || 0;
        console.log(`✅ Loaded totalMenuItems from HTML: ${dashboardStats.totalMenuItems}`);
    }
}

function cacheDOMElements() {
    console.log('🔍 Caching DOM elements...');
    
    todaysOrdersBody = document.getElementById('todaysOrdersBody');
    ordersTableBody = document.getElementById('ordersTableBody');
    topItemsTableBody = document.getElementById('topItemsTableBody');
    inventoryTableBody = document.getElementById('inventoryTableBody');
    
    console.log('✅ DOM elements cached');
}

function setupEventListeners() {
    // Search functionality for orders
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterOrders(e.target.value);
        });
    }
    
    // Refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.classList.add('fa-spin');
            await fetchAllData();
            setTimeout(() => refreshBtn.classList.remove('fa-spin'), 1000);
        });
    }
}

function showLoadingState() {
    const loadingHTML = `
        <tr>
            <td colspan="4" style="text-align: center; padding: 30px;">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p style="margin-top: 10px;">Loading data...</p>
                </div>
            </td>
        </tr>
    `;
    
    if (todaysOrdersBody) todaysOrdersBody.innerHTML = loadingHTML;
    if (topItemsTableBody) topItemsTableBody.innerHTML = loadingHTML;
    if (inventoryTableBody) inventoryTableBody.innerHTML = loadingHTML;
    
    // Show loading on stats cards
    const statValues = document.querySelectorAll('.stat-card h3');
    statValues.forEach(el => {
        if (el.textContent === '0' || el.textContent === '₱0.00') {
            el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
    });
}

function hideLoadingState() {
    console.log('👋 Hiding loading state...');
}

function showErrorState() {
    // Update stats to show error state
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
    
    updateDashboardStats();
    
    // Show error messages in tables
    const errorHTML = `
        <tr>
            <td colspan="4" style="text-align: center; padding: 20px; color: #dc3545;">
                <i class="fas fa-exclamation-triangle"></i> Failed to load data
            </td>
        </tr>
    `;
    
    if (todaysOrdersBody) todaysOrdersBody.innerHTML = errorHTML;
    if (topItemsTableBody) topItemsTableBody.innerHTML = errorHTML;
    if (inventoryTableBody) inventoryTableBody.innerHTML = errorHTML;
}

function setupAutoRefresh() {
    // Refresh data every 60 seconds
    setInterval(async () => {
        console.log('🔄 Auto-refresh triggered');
        try {
            await fetchAllData();
        } catch (error) {
            console.warn('⚠️ Auto-refresh failed:', error.message);
        }
    }, 60000);
}

// ==================== HELPER FUNCTIONS ====================
function filterOrders(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!ordersTableBody) return;
    
    if (allOrders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    No orders available to filter
                </td>
            </tr>
        `;
        return;
    }
    
    const filteredOrders = allOrders.filter(order => {
        const orderNumber = order.orderNumber || '';
        const customerName = order.customerName || '';
        
        return orderNumber.toLowerCase().includes(term) ||
               customerName.toLowerCase().includes(term);
    });
    
    if (filteredOrders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-search"></i> No matching orders found
                </td>
            </tr>
        `;
        return;
    }
    
    // Show first 10 filtered orders
    const displayOrders = filteredOrders.slice(0, 10);
    
    const tableHTML = displayOrders.map(order => {
        const orderTime = new Date(order.createdAt || Date.now());
        const timeString = orderTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        const totalAmount = order.totalAmount || 0;
        const customerName = order.customerName || 'Walk-in Customer';
        
        const displayCustomer = customerName.length > 20 
            ? customerName.substring(0, 20) + '...' 
            : customerName;
        
        const orderNumber = order.orderNumber || 
                           `ORD-${(order.id || '000000').toString().substring(0, 8)}`;
        
        return `
        <tr>
            <td style="font-weight: 500;">${orderNumber}</td>
            <td style="text-align: center; color: #666;">${timeString}</td>
            <td title="${customerName}">${displayCustomer}</td>
            <td style="text-align: center; font-weight: 600; color: #28a745;">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    ordersTableBody.innerHTML = tableHTML;
}

// ==================== CSS STYLES ====================
function addDashboardStyles() {
    if (document.querySelector('#dashboard-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'dashboard-styles';
    style.textContent = `
        /* Value update animation */
        @keyframes valueUpdate {
            0% { transform: scale(1); color: inherit; }
            50% { transform: scale(1.05); color: #28a745; }
            100% { transform: scale(1); color: inherit; }
        }
        
        .value-updated {
            animation: valueUpdate 0.5s ease;
        }
        
        /* Loading spinner */
        .loading-spinner {
            color: #6c757d;
            text-align: center;
            padding: 20px;
        }
        
        .loading-spinner i {
            color: #007bff;
        }
        
        /* Status badges */
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            min-width: 80px;
            text-align: center;
        }
        
        .status-in-stock { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status-out-of-stock { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .status-low-stock { background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .status-bestseller { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .status-popular { background-color: #e2e3e5; color: #383d41; border: 1px solid #d6d8db; }
        .status-normal { background-color: #f5f5f5; color: #616161; border: 1px solid #e0e0e0; }
        .status-no-sales { background-color: #f8f9fa; color: #6c757d; border: 1px solid #e9ecef; }
        
        /* Refresh button spin */
        .refresh-btn.fa-spin {
            animation: fa-spin 1s infinite linear;
        }
        
        /* Table styling */
        table {
            width: 100%;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        th {
            background-color: #f8f9fa;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
        }
        
        td {
            padding: 12px 16px;
            border-bottom: 1px solid #dee2e6;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .stat-card {
                padding: 15px !important;
            }
            
            .stat-card h3 {
                font-size: 24px !important;
            }
            
            table {
                font-size: 12px;
            }
            
            th, td {
                padding: 8px;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==================== EXPORT FUNCTIONS ====================
window.filterOrders = filterOrders;
window.refreshDashboard = fetchAllData;

// ==================== STARTUP ====================
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS styles
    addDashboardStyles();
    
    // Initialize dashboard after a short delay
    setTimeout(() => {
        initializeDashboard();
    }, 100);
});

console.log('✅ Dashboard script loaded successfully');