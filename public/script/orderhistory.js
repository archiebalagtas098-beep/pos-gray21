// ==================== DASHBOARD MAIN SCRIPT ====================

let eventSource = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let refreshInterval = null;
let dataUpdateTimeout = null;

// Dashboard data storage
let dashboardData = {
    stats: {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        todaysOrders: 0,
        todaysRevenue: 0,
        inventoryLowStock: 0,
        inventoryOutOfStock: 0
    },
    orders: [],
    topProducts: [],
    inventory: [],
    lastUpdate: null
};

// Polling frequency for updates (in milliseconds)
const POLLING_INTERVAL = 10000; // 10 seconds
const DATA_CHECK_INTERVAL = 5000; // 5 seconds
let lastDataCheck = 0;

// ==================== INITIALIZATION ====================
function initializeDashboard() {
    console.log('📄 Dashboard initialization started');
    
    // Check if we're on a dashboard page
    const isDashboardPage = window.location.pathname.includes('admindashboard') || 
                           window.location.pathname.includes('dashboard') ||
                           document.querySelector('.dashboard-container, .admin-dashboard, [data-dashboard="true"]');
    
    if (!isDashboardPage) {
        console.log('⏭️ Not a dashboard page, skipping initialization');
        return;
    }
    
    console.log('🏁 Starting dashboard initialization...');
    
    try {
        // Add styles
        addDashboardStyles();
        
        // Initialize logout functionality
        initLogout();
        
        // Setup event listeners
        setupEventListeners();
        
        // Set initial placeholder values
        setPlaceholderValues();
        
        // Load all data
        loadAllData();
        
        // Start real-time updates
        setTimeout(() => {
            initRealTimeUpdates();
        }, 1000);
        
        // Start data polling for updates
        startDataPolling();
        
        console.log('✅ Dashboard initialized successfully');
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showErrorNotification('Dashboard initialization failed');
    }
}

function setPlaceholderValues() {
    // Set initial values for all dashboard elements
    const elements = {
        'totalOrders': '0',
        'totalRevenue': '₱0.00',
        'totalCustomers': '0',
        'totalProducts': '0',
        'todaysOrders': '0',
        'todaysRevenue': '₱0.00'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // Set empty state for tables
    const emptyRow = (message) => `
        <tr>
            <td colspan="4" style="text-align: center; padding: 20px; color: #999;">
                ${message}
            </td>
        </tr>
    `;
    
    const ordersTable = document.getElementById('ordersTableBody');
    if (ordersTable) ordersTable.innerHTML = emptyRow('Loading orders...');
    
    const topItemsTable = document.getElementById('topItemsTableBody');
    if (topItemsTable) topItemsTable.innerHTML = emptyRow('Loading top products...');
    
    const inventoryTable = document.getElementById('inventoryTableBody');
    if (inventoryTable) inventoryTable.innerHTML = emptyRow('Loading inventory...');
}

async function loadAllData() {
    console.log('📦 Loading all dashboard data...');
    
    try {
        // Load dashboard stats first
        await fetchDashboardStats();
        
        // Load other data in parallel
        await Promise.allSettled([
            loadOrders(),
            loadTopProducts(),
            loadInventory()
        ]);
        
        // Set last update timestamp
        dashboardData.lastUpdate = Date.now();
        
        console.log('✅ All data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showErrorNotification('Failed to load dashboard data. Retrying...');
        
        // Retry after 5 seconds
        setTimeout(loadAllData, 5000);
    }
}

// ==================== API FUNCTIONS ====================
async function fetchApi(endpoint, options = {}) {
    try {
        console.log(`📡 Fetching: ${endpoint}`);
        
        const response = await fetch(endpoint, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            console.error(`❌ API ${endpoint} returned ${response.status}`);
            return { success: false, message: `HTTP ${response.status}` };
        }
        
        const data = await response.json();
        console.log(`✅ API ${endpoint} response received`);
        return data;
        
    } catch (error) {
        console.error(`❌ Error fetching ${endpoint}:`, error.message);
        return { success: false, message: error.message };
    }
}

async function fetchDashboardStats() {
    try {
        console.log('📊 Fetching dashboard stats...');
        
        // Try multiple endpoints to get stats
        let data = await fetchApi('/api/stats');
        
        // If /api/stats fails, try building stats from orders API
        if (!data || !data.success) {
            console.warn('⚠️ /api/stats endpoint failed, fetching data separately');
            
            // Fetch orders to calculate stats
            const ordersData = await fetchApi('/api/orders?limit=1000&page=1');
            const customersData = await fetchApi('/api/customers?limit=100');
            
            if (ordersData && ordersData.success && Array.isArray(ordersData.data)) {
                const orders = ordersData.data;
                
                // Calculate stats from orders
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
                
                let totalRevenue = 0;
                let todaysRevenue = 0;
                let todaysOrders = 0;
                
                orders.forEach(order => {
                    const orderTotal = parseFloat(order.total || 0);
                    totalRevenue += orderTotal;
                    
                    const orderDate = new Date(order.createdAt || order.date);
                    if (orderDate >= todayStart && orderDate < todayEnd) {
                        todaysOrders++;
                        todaysRevenue += orderTotal;
                    }
                });
                
                data = {
                    success: true,
                    data: {
                        totalOrders: orders.length,
                        totalRevenue: totalRevenue,
                        todaysOrders: todaysOrders,
                        todaysRevenue: todaysRevenue,
                        totalCustomers: customersData?.data?.length || 0,
                        totalMenuItems: 0,
                        inventoryLowStock: 0,
                        inventoryOutOfStock: 0
                    }
                };
            }
        }
        
        if (data && data.success && data.data) {
            // Check if stats have changed
            const statsChanged = hasStatsChanged(data.data);
            
            // Update dashboard stats
            dashboardData.stats = {
                ...dashboardData.stats,
                totalOrders: data.data.totalOrders || 0,
                totalRevenue: data.data.totalRevenue || 0,
                todaysOrders: data.data.todaysOrders || 0,
                todaysRevenue: data.data.todaysRevenue || 0,
                totalCustomers: data.data.totalCustomers || 0,
                totalProducts: data.data.totalMenuItems || 0,
                inventoryLowStock: data.data.inventoryLowStock || 0,
                inventoryOutOfStock: data.data.inventoryOutOfStock || 0
            };
            
            console.log('✅ Stats loaded:', dashboardData.stats);
            
            // Update UI if stats changed
            if (statsChanged) {
                updateDashboardUI();
                showUpdateNotification('Dashboard stats updated');
            }
            
            return true;
            
        } else {
            console.warn('⚠️ No stats data from API');
            // Set all stats to 0
            dashboardData.stats = {
                totalOrders: 0,
                totalRevenue: 0,
                totalCustomers: 0,
                totalProducts: 0,
                todaysOrders: 0,
                todaysRevenue: 0,
                inventoryLowStock: 0,
                inventoryOutOfStock: 0
            };
            updateDashboardUI();
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        // Set all stats to 0 on error
        dashboardData.stats = {
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            totalProducts: 0,
            todaysOrders: 0,
            todaysRevenue: 0,
            inventoryLowStock: 0,
            inventoryOutOfStock: 0
        };
        updateDashboardUI();
        return false;
    }
}

function hasStatsChanged(newStats) {
    const oldStats = dashboardData.stats;
    
    return (
        oldStats.totalOrders !== newStats.totalOrders ||
        oldStats.totalRevenue !== newStats.totalRevenue ||
        oldStats.totalCustomers !== newStats.totalCustomers ||
        oldStats.totalProducts !== newStats.totalProducts ||
        oldStats.todaysOrders !== newStats.todaysOrders ||
        oldStats.todaysRevenue !== newStats.todaysRevenue ||
        oldStats.inventoryLowStock !== newStats.inventoryLowStock ||
        oldStats.inventoryOutOfStock !== newStats.inventoryOutOfStock
    );
}

function updateDashboardUI() {
    console.log('🔄 Updating dashboard UI...');
    
    const stats = dashboardData.stats;
    
    // Update all stat cards with animation
    const updateStat = (elementId, value, isCurrency = false) => {
        const element = document.getElementById(elementId);
        if (element) {
            const oldValue = element.textContent;
            const newValue = isCurrency ? formatCurrency(value) : formatNumber(value);
            
            if (oldValue !== newValue) {
                animateValueChange(element, oldValue, newValue);
            }
        }
    };
    
    updateStat('totalOrders', stats.totalOrders);
    updateStat('totalRevenue', stats.totalRevenue, true);
    updateStat('totalCustomers', stats.totalCustomers);
    updateStat('totalProducts', stats.totalProducts);
    updateStat('todaysOrders', stats.todaysOrders);
    updateStat('todaysRevenue', stats.todaysRevenue, true);
}

function animateValueChange(element, oldValue, newValue) {
    element.style.transition = 'all 0.3s ease';
    element.style.transform = 'scale(1.1)';
    element.style.color = '#4CAF50';
    
    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
        
        setTimeout(() => {
            element.style.color = '';
        }, 300);
    }, 150);
}

// ==================== ORDER MANAGEMENT ====================
async function loadOrders() {
    try {
        console.log('📋 Loading orders...');
        
        // Try to fetch today's orders
        let data = await fetchApi('/api/orders/today?limit=20');
        
        // Fallback: if today's orders endpoint fails, fetch all orders and filter
        if (!data || !data.success || !data.data) {
            console.warn('⚠️ /api/orders/today failed, trying /api/orders');
            data = await fetchApi('/api/orders?limit=50&page=1');
            
            if (data && data.success && data.data) {
                // Filter to only today's orders
                const today = new Date();
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
                const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
                
                console.log(`🔍 Filtering orders from ${startOfDay} to ${endOfDay}`);
                data.data = data.data.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= startOfDay && orderDate <= endOfDay;
                });
                console.log(`✅ Filtered ${data.data.length} orders for today`);
            }
        }
        
        if (data && data.success && data.data && Array.isArray(data.data)) {
            console.log('📊 Orders data received:', {
                count: data.data.length,
                sample: data.data[0] || 'No orders'
            });
            
            // Check if orders have changed
            const ordersChanged = hasOrdersChanged(data.data);
            
            if (ordersChanged) {
                dashboardData.orders = data.data || [];
                console.log(`✅ Orders loaded: ${dashboardData.orders.length}`);
                updateOrdersTable();
                if (data.data.length > 0) {
                    showUpdateNotification('New orders loaded');
                }
            } else {
                console.log('ℹ️ No new orders, skipping table update');
            }
        } else {
            console.log('⚠️ No orders data from API');
            dashboardData.orders = [];
            updateOrdersTable();
        }
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        dashboardData.orders = [];
        updateOrdersTable();
    }
}

function hasOrdersChanged(newOrders) {
    if (dashboardData.orders.length !== newOrders.length) {
        return true;
    }
    
    // Check if any order is different
    for (let i = 0; i < newOrders.length; i++) {
        const newOrder = newOrders[i];
        const oldOrder = dashboardData.orders[i];
        
        if (!oldOrder || 
            newOrder._id !== oldOrder._id || 
            newOrder.total !== oldOrder.total ||
            newOrder.status !== oldOrder.status) {
            return true;
        }
    }
    
    return false;
}

function updateOrdersTable() {
    // Try both possible IDs for today's orders
    let tableBody = document.getElementById('todaysOrdersBody');
    if (!tableBody) {
        tableBody = document.getElementById('ordersTableBody');
    }
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (dashboardData.orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #999;">
                    No orders today
                </td>
            </tr>
        `;
        return;
    }
    
    // Add orders to table (limited to 5 for today's orders section)
    const ordersToDisplay = dashboardData.orders.slice(0, 5);
    ordersToDisplay.forEach((order, index) => {
        const row = document.createElement('tr');
        const orderTime = new Date(order.createdAt || Date.now());
        const timeString = orderTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Get customer display name - try multiple fields
        let customerDisplay = 'Walk-in Customer';
        if (order.customerName) {
            customerDisplay = order.customerName;
        } else if (order.customerId) {
            customerDisplay = typeof order.customerId === 'string' ? order.customerId.substring(0, 8) : 'Customer';
        }
        
        row.innerHTML = `
            <td>${order.orderNumber || 'N/A'}</td>
            <td>${timeString}</td>
            <td>${customerDisplay}</td>
            <td>${formatCurrency(order.total || order.totalAmount || 0)}</td>
        `;
        
        // Add fade-in animation
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        tableBody.appendChild(row);
        
        // Animate row appearance
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// ==================== TOP PRODUCTS ====================
async function loadTopProducts() {
    try {
        console.log('📈 Loading top products...');
        
        // Try multiple endpoints for top products
        let data = await fetchApi('/api/orders/top-selling?limit=10');
        
        if (!data || !data.success) {
            console.warn('⚠️ Failed to load top products, trying alternative endpoint');
            data = await fetchApi('/api/products?limit=10');
        }
        
        if (data && data.success && Array.isArray(data.data)) {
            // Check if top products have changed
            const productsChanged = hasTopProductsChanged(data.data);
            
            if (productsChanged) {
                dashboardData.topProducts = data.data || [];
                console.log(`✅ Top products loaded: ${dashboardData.topProducts.length}`);
                updateTopProductsTable();
                if (data.data.length > 0) {
                    showUpdateNotification('Top products updated');
                }
            }
        } else {
            console.log('⚠️ No top products data from API');
            dashboardData.topProducts = [];
            updateTopProductsTable();
        }
        
    } catch (error) {
        console.error('❌ Error loading top products:', error);
        dashboardData.topProducts = [];
        updateTopProductsTable();
    }
}

function hasTopProductsChanged(newProducts) {
    if (dashboardData.topProducts.length !== newProducts.length) {
        return true;
    }
    
    // Check if any product is different
    for (let i = 0; i < newProducts.length; i++) {
        const newProduct = newProducts[i];
        const oldProduct = dashboardData.topProducts[i];
        
        if (!oldProduct || 
            newProduct.name !== oldProduct.name || 
            newProduct.revenue !== oldProduct.revenue ||
            newProduct.status !== oldProduct.status) {
            return true;
        }
    }
    
    return false;
}

function updateTopProductsTable() {
    const tableBody = document.getElementById('topItemsTableBody');
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (dashboardData.topProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #999;">
                    No sales data available
                </td>
            </tr>
        `;
        return;
    }
    
    // Add products to table
    dashboardData.topProducts.forEach((product, index) => {
        const row = document.createElement('tr');
        // Use 'name' from aggregation, or '_id' as fallback
        const productName = product.name || product._id || 'Unknown Product';
        const totalSales = product.totalRevenue || product.revenue || 0;
        const statusClass = 'status-normal';
        const statusText = 'Normal';
        
        row.innerHTML = `
            <td>${productName}</td>
            <td>${formatCurrency(totalSales)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ==================== INVENTORY MANAGEMENT ====================
async function loadInventory() {
    try {
        console.log('📦 Loading inventory...');
        
        const data = await fetchApi('/api/inventory');
        
        if (data && data.success && data.data) {
            // Check if inventory has changed
            const inventoryChanged = hasInventoryChanged(data.data);
            
            if (inventoryChanged) {
                dashboardData.inventory = data.data || [];
                console.log(`✅ Inventory loaded: ${dashboardData.inventory.length}`);
                updateInventoryTable();
                if (data.data.length > 0) {
                    showUpdateNotification('Inventory updated');
                }
            }
        } else {
            console.log('⚠️ No inventory data from API');
            dashboardData.inventory = [];
            updateInventoryTable();
        }
        
    } catch (error) {
        console.error('❌ Error loading inventory:', error);
        dashboardData.inventory = [];
        updateInventoryTable();
    }
}

function hasInventoryChanged(newInventory) {
    if (dashboardData.inventory.length !== newInventory.length) {
        return true;
    }
    
    // Check if any inventory item is different
    for (let i = 0; i < newInventory.length; i++) {
        const newItem = newInventory[i];
        const oldItem = dashboardData.inventory[i];
        
        if (!oldItem || 
            newItem.name !== oldItem.name || 
            newItem.stock !== oldItem.stock ||
            newItem.status !== oldItem.status) {
            return true;
        }
    }
    
    return false;
}

function updateInventoryTable() {
    // Try both possible IDs
    let tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) {
        tableBody = document.getElementById('inventoryStatusBody');
    }
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (dashboardData.inventory.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #999;">
                    No inventory items available
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by stock status (low stock first)
    const sortedInventory = [...dashboardData.inventory].sort((a, b) => {
        const statusOrder = { 'out-of-stock': 0, 'low-stock': 1, 'in-stock': 2 };
        const statusA = a.status || 'in-stock';
        const statusB = b.status || 'in-stock';
        return statusOrder[statusA] - statusOrder[statusB];
    });
    
    // Add inventory items to table
    sortedInventory.forEach((item, index) => {
        const row = document.createElement('tr');
        // Determine stock status
        let status = 'in-stock';
        let statusText = 'In Stock';
        
        const currentStock = item.currentStock || item.stock || 0;
        const minStock = item.minStock || 0;
        
        if (currentStock === 0) {
            status = 'out-of-stock';
            statusText = 'Out of Stock';
        } else if (currentStock < minStock) {
            status = 'low-stock';
            statusText = 'Low Stock';
        }
        
        const itemName = item.itemName || item.name || 'Unknown Item';
        const unit = item.unit || 'unit';
        const stockDisplay = `${formatNumber(currentStock)} ${unit}`;
        const statusClass = `status-${status}`;
        
        row.innerHTML = `
            <td>${itemName}</td>
            <td>${stockDisplay}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ==================== UTILITY FUNCTIONS ====================
function formatNumber(num) {
    if (num === undefined || num === null || isNaN(parseFloat(num))) return '0';
    return new Intl.NumberFormat('en-US').format(parseFloat(num));
}

function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(parseFloat(amount))) {
        return '₱0.00';
    }
    
    const numAmount = parseFloat(amount);
    if (numAmount === 0) return '₱0.00';
    
    return '₱' + numAmount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ==================== LOGOUT FUNCTIONALITY ====================
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Look for other logout elements
    document.querySelectorAll('[onclick*="logout"], .logout-btn').forEach(element => {
        element.addEventListener('click', handleLogout);
    });
}

async function handleLogout(e) {
    if (e) e.preventDefault();
    
    const confirmed = confirm('Are you sure you want to logout?');
    if (!confirmed) return;
    
    // Show loading overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        color: white;
    `;
    overlay.innerHTML = `
        <div style="text-align: center;">
            <div style="
                width: 50px;
                height: 50px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #4CAF50;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <h3>Logging out...</h3>
        </div>
    `;
    document.body.appendChild(overlay);
    
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Clear local data
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirect to login
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/logout';
    }
}

// ==================== REAL-TIME UPDATES ====================
function initRealTimeUpdates() {
    console.log('🚀 Initializing real-time updates...');
    
    setupSSEConnection();
    
    // Set up periodic refresh (every 30 seconds)
    setupAutoRefresh();
}

function setupSSEConnection() {
    if (eventSource) {
        eventSource.close();
    }
    
    try {
        eventSource = new EventSource('/api/admin/events');
        
        eventSource.onopen = () => {
            console.log('✅ Connected to real-time updates');
            isConnected = true;
        };
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleRealTimeUpdate(data);
            } catch (error) {
                console.error('Error parsing real-time update:', error);
            }
        };
        
        eventSource.onerror = () => {
            console.log('❌ SSE connection error');
            isConnected = false;
            
            // Try to reconnect
            setTimeout(setupSSEConnection, 5000);
        };
        
    } catch (error) {
        console.error('Failed to setup SSE:', error);
    }
}

function handleRealTimeUpdate(data) {
    if (!data || !data.type) return;
    
    switch (data.type) {
        case 'new_order':
            handleNewOrder(data.data);
            break;
        case 'stats_update':
            fetchDashboardStats();
            break;
        default:
            console.log('Unknown update type:', data.type);
    }
}

function handleNewOrder(order) {
    console.log('🆕 New order:', order);
    
    // Add order to the beginning of the list
    dashboardData.orders.unshift(order);
    
    // Update orders table
    updateOrdersTable();
    
    // Refresh stats
    fetchDashboardStats();
    
    // Show notification
    showNotification('New Order Received', `Order #${order.orderNumber} for ${formatCurrency(order.total)}`);
}

function showNotification(title, message) {
    // Remove existing notification
    const existing = document.querySelector('.dashboard-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'dashboard-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <button class="notification-close">×</button>
    `;
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function setupAutoRefresh() {
    // Clear existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Set up new interval (every 30 seconds)
    refreshInterval = setInterval(() => {
        if (!isConnected) {
            console.log('🔄 Refreshing dashboard data...');
            fetchDashboardStats();
        }
    }, 30000);
}

function startDataPolling() {
    // Check for data updates every POLLING_INTERVAL
    setInterval(async () => {
        if (document.hidden) return; // Don't poll when tab is not active
        
        try {
            console.log('🔄 Polling for data updates...');
            
            // Check for orders updates
            await loadOrders();
            
            // Check for stats updates
            await fetchDashboardStats();
            
            // Check for inventory updates
            await loadInventory();
            
            // Check for top products updates
            await loadTopProducts();
            
        } catch (error) {
            console.error('❌ Error during data polling:', error);
        }
    }, POLLING_INTERVAL);
}

// ==================== EVENT HANDLERS ====================
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // Add animation
            refreshBtn.style.transform = 'rotate(360deg)';
            refreshBtn.style.transition = 'transform 0.5s ease';
            
            setTimeout(() => {
                refreshBtn.style.transform = '';
            }, 500);
            
            // Refresh all data
            loadAllData();
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterOrdersTable(e.target.value);
        });
    }
    
    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Page became visible, refresh data
            fetchDashboardStats();
        }
    });
}

function filterOrdersTable(searchTerm) {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    const term = searchTerm.toLowerCase();
    
    if (!term) {
        updateOrdersTable();
        return;
    }
    
    // Filter orders
    const filteredOrders = dashboardData.orders.filter(order =>
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term)
    );
    
    // Update table with filtered results
    tableBody.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #999;">
                    No orders matching "${searchTerm}"
                </td>
            </tr>
        `;
        return;
    }
    
    // Add filtered orders
    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        const orderTime = new Date(order.createdAt);
        const timeString = orderTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        row.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${timeString}</td>
            <td>${order.customerName}</td>
            <td>${formatCurrency(order.total)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function showUpdateNotification(message) {
    console.log(`📢 ${message}`);
    
    // Create a simple console notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-sync-alt"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// ==================== STYLES ====================
function addDashboardStyles() {
    if (!document.getElementById('dashboard-styles')) {
        const style = document.createElement('style');
        style.id = 'dashboard-styles';
        style.textContent = `
            /* Dashboard animations */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .fade-in {
                animation: fadeIn 0.5s ease forwards;
            }
            
            /* Card styles */
            .dashboard-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }

            
            /* Status badges */
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-align: center;
                min-width: 80px;
            }
            
            .status-bestseller {
                background: linear-gradient(135deg, #ff4081, #ff79a9);
                color: white;
            }
            
            .status-popular {
                background: linear-gradient(135deg, #448aff, #82b1ff);
                color: white;
            }
            
            .status-normal {
                background: #f5f5f5;
                color: #666;
                border: 1px solid #ddd;
            }
            
            .status-in-stock {
                background: #e8f5e9;
                color: #2e7d32;
                border: 1px solid #c8e6c9;
            }
            
            .status-low-stock {
                background: #fff3e0;
                color: #ef6c00;
                border: 1px solid #ffe0b2;
            }
            
            .status-out-of-stock {
                background: #ffebee;
                color: #c62828;
                border: 1px solid #ffcdd2;
            }
            
            /* Table styles */
            .dashboard-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }
            
            .dashboard-table th {
                text-align: left;
                padding: 12px;
                background: #f8f9fa;
                font-weight: 600;
                color: #495057;
                border-bottom: 2px solid #dee2e6;
            }
            
            .dashboard-table td {
                padding: 12px;
                border-bottom: 1px solid #e9ecef;
            }
            
            /* Notification */
            .dashboard-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-left: 4px solid #4CAF50;
                border-radius: 8px;
                padding: 15px;
                width: 300px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 1000;
                display: flex;
                justify-content: space-between;
                align-items: center;
                animation: fadeIn 0.3s ease;
            }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-content strong {
                color: #333;
                font-size: 14px;
                display: block;
                margin-bottom: 5px;
            }
            
            .notification-content p {
                color: #666;
                font-size: 13px;
                margin: 0;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .status-badge {
                    min-width: 60px;
                    font-size: 11px;
                    padding: 3px 8px;
                }
                
                .dashboard-notification {
                    width: calc(100% - 40px);
                    right: 20px;
                    left: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== ERROR HANDLING ====================
function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'dashboard-notification';
    notification.style.borderLeftColor = '#F44336';
    
    notification.innerHTML = `
        <div class="notification-content">
            <strong>⚠️ Error</strong>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ==================== CLEANUP ====================
function cleanup() {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
    
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// ==================== GLOBAL EXPORTS ====================
window.refreshDashboard = function() {
    loadAllData();
};

window.fixPesoSign = function() {
    const revenueEl = document.getElementById('totalRevenue');
    if (revenueEl && !revenueEl.textContent.includes('₱')) {
        revenueEl.textContent = '₱' + revenueEl.textContent.replace(/[^0-9.]/g, '');
    }
};

// ==================== STARTUP ====================
// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    // DOM already loaded
    setTimeout(initializeDashboard, 100);
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

console.log('✅ Orderhistory script loaded successfully');