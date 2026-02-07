// ==================== DASHBOARD MAIN SCRIPT ====================

let eventSource = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

let dashboardStats = {
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    todaysOrders: 0,
    todaysRevenue: 0,
    inventoryLowStock: 0,
    inventoryOutOfStock: 0,
    totalInventory: 0
};

let allOrders = [];
let allMenuItems = [];
let allInventory = [];
let allCustomers = [];
let topSellingProducts = [];

// ==================== UTILITY FUNCTIONS ====================
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

function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ==================== API FUNCTIONS ====================
async function fetchApi(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            console.error(`API Error ${response.status}: ${response.statusText}`);
            return { success: false, status: response.status };
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Fetch error for ${endpoint}:`, error);
        return { success: false, message: error.message };
    }
}

// ==================== DASHBOARD DATA FETCHING ====================
async function fetchAllData() {
    try {
        console.log('Fetching all dashboard data...');
        
        // Show loading state
        showLoading(true);
        
        // Fetch all data in parallel
        const [ordersData, menuData, inventoryData, customersData, topSellingData] = await Promise.allSettled([
            fetchApi('/api/orders'),
            fetchApi('/api/menu'),
            fetchApi('/api/inventory'),
            fetchApi('/api/customers'),
            fetchApi('/api/orders/top-selling')
        ]);

        console.log('Data fetch results:', {
            orders: ordersData.status,
            menu: menuData.status,
            inventory: inventoryData.status,
            customers: customersData.status,
            topSelling: topSellingData.status
        });

        // Process orders
        if (ordersData.status === 'fulfilled' && ordersData.value?.success) {
            allOrders = Array.isArray(ordersData.value.data) ? ordersData.value.data : [];
            console.log(`Loaded ${allOrders.length} orders`);
        } else {
            console.warn('Failed to load orders, using empty array');
            allOrders = [];
        }

        // Process menu items
        if (menuData.status === 'fulfilled' && menuData.value?.success) {
            allMenuItems = Array.isArray(menuData.value.data) ? menuData.value.data : [];
            console.log(`Loaded ${allMenuItems.length} menu items`);
        } else {
            console.warn('Failed to load menu items, using empty array');
            allMenuItems = [];
        }

        // Process inventory
        if (inventoryData.status === 'fulfilled' && inventoryData.value?.success) {
            allInventory = Array.isArray(inventoryData.value.data) ? inventoryData.value.data : [];
            console.log(`Loaded ${allInventory.length} inventory items`);
        } else {
            console.warn('Failed to load inventory, using empty array');
            allInventory = [];
        }

        // Process customers
        if (customersData.status === 'fulfilled' && customersData.value?.success) {
            allCustomers = Array.isArray(customersData.value.data) ? customersData.value.data : [];
            console.log(`Loaded ${allCustomers.length} customers`);
        } else {
            console.warn('Failed to load customers, using empty array');
            allCustomers = [];
        }

        // Process top selling products
        if (topSellingData.status === 'fulfilled' && topSellingData.value?.success) {
            topSellingProducts = Array.isArray(topSellingData.value.data) ? topSellingData.value.data : [];
            console.log(`Loaded ${topSellingProducts.length} top selling products from API`);
        } else {
            console.warn('Failed to load top selling products from API, will calculate from orders');
            topSellingProducts = [];
        }

        // If no top selling data from API, calculate from orders
        if (topSellingProducts.length === 0 && allOrders.length > 0) {
            console.log('Calculating top selling products from orders...');
            calculateTopSellingFromOrders();
        }

        // Calculate statistics
        calculateDashboardStats();
        
        // Update all UI components
        updateDashboardUI();
        updateRecentOrdersTable();
        updateTopItemsTable();
        updateInventoryStatusTable();
        renderSalesChart();

        console.log('Dashboard data updated successfully');
        showNotification('Dashboard updated successfully', 'success');

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showNotification('Error updating dashboard data', 'error');
        
        // Keep existing data and try to calculate stats
        calculateDashboardStats();
        updateDashboardUI();
    } finally {
        showLoading(false);
    }
}

// ==================== DASHBOARD STATS CALCULATION ====================
function calculateDashboardStats() {
    console.log('Calculating dashboard statistics...');
    
    // Get today's date for filtering
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Initialize counters
    let totalRevenue = 0;
    let todaysRevenue = 0;
    let todaysOrders = 0;
    
    // Track unique customers from orders (for fallback)
    const uniqueCustomerIds = new Set();
    
    // 1. CALCULATE FROM ORDERS:
    // - Total Orders (count of all orders)
    // - Today's Orders (orders created today)
    // - Total Revenue (sum of all order totals)
    // - Today's Revenue (sum of today's order totals)
    
    allOrders.forEach(order => {
        if (!order || typeof order !== 'object') return;
        
        // Get order total safely
        const orderTotal = parseFloat(order.total || order.totalAmount || order.amount || 0);
        if (!isNaN(orderTotal)) {
            totalRevenue += orderTotal;
        }
        
        // Check if order is from today
        const orderDate = order.createdAt ? new Date(order.createdAt) : 
                         order.date ? new Date(order.date) : 
                         new Date();
        
        if (orderDate >= todayStart && orderDate < todayEnd) {
            todaysOrders++;
            todaysRevenue += orderTotal;
        }
        
        // Track customer from order (for fallback customer count)
        if (order.customerId) {
            uniqueCustomerIds.add(order.customerId.toString());
        } else if (order.customerName && order.customerName !== 'Walk-in Customer') {
            uniqueCustomerIds.add(order.customerName);
        }
    });
    
    // 2. CALCULATE FROM CUSTOMERS API:
    // - Total Customers (primary source)
    let totalCustomersCount = allCustomers.length;
    
    // If no customers from API but we have orders with customers, use that as fallback
    if (totalCustomersCount === 0 && uniqueCustomerIds.size > 0) {
        totalCustomersCount = uniqueCustomerIds.size;
        console.log(`Using ${totalCustomersCount} unique customers from orders as fallback`);
    }
    
    // 3. CALCULATE FROM INVENTORY:
    // - Total Inventory Items (count)
    // - Inventory Status (low stock, out of stock)
    let lowStockCount = 0;
    let outOfStockCount = 0;
    
    allInventory.forEach(item => {
        if (!item || typeof item !== 'object') return;
        
        const stock = parseFloat(item.currentStock || item.stock || item.quantity || 0);
        const minStock = parseFloat(item.minStock || item.minimumStock || item.reorderLevel || 5);
        
        if (isNaN(stock)) return;
        
        if (stock <= 0) {
            outOfStockCount++;
        } else if (stock <= minStock) {
            lowStockCount++;
        }
    });
    
    // 4. GET FROM MENU:
    // - Total Products (count of all menu items)
    
    // Update dashboard stats object
    dashboardStats = {
        totalOrders: allOrders.length,              // From orders
        totalRevenue: totalRevenue,                 // From orders
        totalCustomers: totalCustomersCount,        // From customers API (or orders fallback)
        totalProducts: allMenuItems.length,         // From menu API
        todaysOrders: todaysOrders,                 // From orders (filtered by today)
        todaysRevenue: todaysRevenue,               // From orders (filtered by today)
        inventoryLowStock: lowStockCount,           // From inventory
        inventoryOutOfStock: outOfStockCount,       // From inventory
        totalInventory: allInventory.length         // From inventory
    };
    
    console.log('Dashboard stats calculated:', dashboardStats);
}

// ==================== UI UPDATES ====================
function updateDashboardUI() {
    console.log('Updating dashboard UI with stats:', dashboardStats);
    
    // Update main stat cards
    updateStatCard('totalOrders', dashboardStats.totalOrders, 'number');
    updateStatCard('totalRevenue', dashboardStats.totalRevenue, 'currency');
    updateStatCard('totalCustomers', dashboardStats.totalCustomers, 'number');
    updateStatCard('totalProducts', dashboardStats.totalProducts, 'number');
    updateStatCard('todaysOrders', dashboardStats.todaysOrders, 'number');
    updateStatCard('todaysRevenue', dashboardStats.todaysRevenue, 'currency');
    
    // Update inventory card
    updateInventoryStatsUI();
}

function updateStatCard(elementId, value, type) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element ${elementId} not found`);
        return;
    }

    const oldValue = element.textContent.trim();
    let newValue = type === 'currency' ? formatCurrency(value) : formatNumber(value);

    if (oldValue !== newValue) {
        // Add animation class
        element.classList.add('stat-value-updating');
        
        // Update value
        element.textContent = newValue;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('stat-value-updating');
        }, 500);
    }
}

function updateInventoryStatsUI() {
    // Update total inventory count
    const totalInventoryElement = document.getElementById('totalInventory');
    if (totalInventoryElement) {
        const inventoryText = `${formatNumber(dashboardStats.totalInventory)} items`;
        if (totalInventoryElement.textContent !== inventoryText) {
            totalInventoryElement.textContent = inventoryText;
        }
    }
    
    // Update inventory status if elements exist
    const lowStockElement = document.getElementById('inventoryLowStock');
    const outOfStockElement = document.getElementById('inventoryOutOfStock');
    
    if (lowStockElement) {
        lowStockElement.textContent = formatNumber(dashboardStats.inventoryLowStock);
        if (dashboardStats.inventoryLowStock > 0) {
            lowStockElement.style.color = '#FF9800';
            lowStockElement.style.fontWeight = 'bold';
        } else {
            lowStockElement.style.color = '';
            lowStockElement.style.fontWeight = '';
        }
    }
    
    if (outOfStockElement) {
        outOfStockElement.textContent = formatNumber(dashboardStats.inventoryOutOfStock);
        if (dashboardStats.inventoryOutOfStock > 0) {
            outOfStockElement.style.color = '#f44336';
            outOfStockElement.style.fontWeight = 'bold';
        } else {
            outOfStockElement.style.color = '';
            outOfStockElement.style.fontWeight = '';
        }
    }
}

// ==================== RECENT ORDERS TABLE ====================
function updateRecentOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) {
        console.warn('Recent orders table body not found');
        return;
    }

    // Clear table
    tableBody.innerHTML = '';

    if (allOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    No orders found
                </td>
            </tr>
        `;
        return;
    }

    // Sort by date (newest first) and take top 10
    const recentOrders = [...allOrders]
        .filter(order => order && order.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

    recentOrders.forEach((order, index) => {
        const row = document.createElement('tr');
        const orderDate = new Date(order.createdAt || Date.now());
        const timeString = orderDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });

        const totalAmount = parseFloat(order.total || 0);
        const customerName = order.customerName || order.customerId || 'Walk-in Customer';
        const orderNumber = order.orderNumber || `ORD-${(order._id || '').toString().substring(0, 8) || (index + 1)}`;

        row.innerHTML = `
            <td>${orderNumber}</td>
            <td>${timeString}</td>
            <td>${customerName}</td>
            <td>${formatCurrency(totalAmount)}</td>
        `;

        // Add animation
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        tableBody.appendChild(row);

        // Animate row appearance
        setTimeout(() => {
            row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// ==================== TOP SELLING PRODUCTS ====================
function calculateTopSellingFromOrders() {
    console.log('Calculating top selling products from orders data...');
    
    const productSales = {};
    let productCount = 0;

    allOrders.forEach(order => {
        if (!order || !order.items || !Array.isArray(order.items)) return;
        
        order.items.forEach(item => {
            if (!item || !item.name) return;
            
            const productName = item.name;
            const quantity = parseFloat(item.quantity || 1);
            const price = parseFloat(item.price || item.menuPrice || 0);
            
            if (isNaN(quantity) || isNaN(price)) return;
            
            const revenue = quantity * price;

            if (!productSales[productName]) {
                productSales[productName] = {
                    name: productName,
                    totalQuantity: 0,
                    totalRevenue: 0
                };
            }

            productSales[productName].totalQuantity += quantity;
            productSales[productName].totalRevenue += revenue;
            productCount++;
        });
    });

    topSellingProducts = Object.values(productSales)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10);
    
    console.log(`Calculated ${topSellingProducts.length} top selling products from ${productCount} items`);
}

function updateTopItemsTable() {
    const tableBody = document.getElementById('topItemsTableBody');
    if (!tableBody) {
        console.warn('Top items table body not found');
        return;
    }

    tableBody.innerHTML = '';

    if (topSellingProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #666;">
                    No sales data available
                </td>
            </tr>
        `;
        return;
    }

    topSellingProducts.forEach((product, index) => {
        const row = document.createElement('tr');
        const displayName = product.name?.length > 25 
            ? product.name.substring(0, 25) + '...' 
            : product.name;

        let status = 'Normal';
        let statusClass = 'status-normal';

        if (index < 3) {
            status = 'Bestseller';
            statusClass = 'status-hot';
        } else if (product.totalRevenue > 5000) {
            status = 'Popular';
            statusClass = 'status-trending';
        }

        row.innerHTML = `
            <td title="${product.name}">${displayName}</td>
            <td>${formatCurrency(product.totalRevenue)}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
        `;

        tableBody.appendChild(row);
    });
}

// ==================== INVENTORY STATUS TABLE ====================
function updateInventoryStatusTable() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) {
        console.warn('Inventory table body not found');
        return;
    }

    tableBody.innerHTML = '';

    if (!allInventory || allInventory.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #666;">
                    No inventory items available
                </td>
            </tr>
        `;
        return;
    }

    // Sort by stock level (lowest first) and take top 10
    const sortedItems = [...allInventory]
        .filter(item => item && item.itemName)
        .map(item => {
            const stock = parseFloat(item.currentStock || item.stock || 0);
            const minStock = parseFloat(item.minStock || item.minimumStock || 5);

            let status = 'In Stock';
            let statusClass = 'status-in-stock';

            if (stock <= 0) {
                status = 'Out of Stock';
                statusClass = 'status-out-of-stock';
            } else if (stock <= minStock) {
                status = 'Low Stock';
                statusClass = 'status-low-stock';
            }

            return {
                name: item.itemName || item.name || 'Unknown Item',
                stock: stock,
                unit: item.unit || 'units',
                status,
                statusClass
            };
        })
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 10);

    // Create table rows
    sortedItems.forEach((item, index) => {
        const row = document.createElement('tr');
        const truncatedName = item.name.length > 20 
            ? item.name.substring(0, 20) + '...' 
            : item.name;

        row.innerHTML = `
            <td title="${item.name}">${truncatedName}</td>
            <td>${formatNumber(item.stock)} ${item.unit}</td>
            <td><span class="status-badge ${item.statusClass}">${item.status}</span></td>
        `;

        // Add row animation
        row.style.opacity = '0';
        tableBody.appendChild(row);

        setTimeout(() => {
            row.style.transition = 'opacity 0.3s ease';
            row.style.opacity = '1';
        }, index * 100);
    });
}

// ==================== SALES CHART ====================
function renderSalesChart() {
    const chartBars = document.getElementById('chartBars');
    const chartSummary = document.getElementById('chartSummary');
    if (!chartBars) {
        console.warn('Chart bars element not found');
        return;
    }

    chartBars.innerHTML = '';

    const last7Days = generateLast7DaysSales();
    const today = new Date().toISOString().split('T')[0];
    const todaySales = last7Days.find(day => day.date === today)?.amount || 0;
    const maxSale = Math.max(...last7Days.map(day => day.amount), 1);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    last7Days.forEach((dayData, index) => {
        const bar = document.createElement('div');
        const dayName = dayNames[new Date(dayData.date).getDay()];
        const isToday = dayData.date === today;
        const heightPercentage = Math.max((dayData.amount / maxSale) * 100, 5);

        bar.className = 'chart-bar';
        bar.innerHTML = `
            <div class="chart-amount-label">${formatCurrency(dayData.amount)}</div>
            <div class="chart-day-label">${dayName}</div>
        `;

        bar.style.cssText = `
            height: 0%;
            background: ${isToday ? 'linear-gradient(180deg, #4CAF50, #2E7D32)' : 'linear-gradient(180deg, #448aff, #2979ff)'};
            margin: 0 6px;
            border-radius: 4px 4px 0 0;
            flex: 1;
            position: relative;
            cursor: pointer;
            opacity: 0;
            transform: translateY(20px);
        `;

        // Add hover effects
        bar.addEventListener('mouseenter', () => {
            bar.style.transform = 'translateY(-5px)';
            bar.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            bar.querySelector('.chart-amount-label').style.opacity = '1';
        });

        bar.addEventListener('mouseleave', () => {
            bar.style.transform = 'translateY(0)';
            bar.style.boxShadow = 'none';
            bar.querySelector('.chart-amount-label').style.opacity = '0';
        });

        chartBars.appendChild(bar);

        // Animate bar appearance
        setTimeout(() => {
            bar.style.opacity = '1';
            bar.style.transform = 'translateY(0)';
            bar.style.transition = 'all 0.3s ease, height 1s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                bar.style.height = `${heightPercentage}%`;
            }, 100);
        }, index * 100);
    });

    if (chartSummary) {
        chartSummary.textContent = `Today: ${formatCurrency(todaySales)}`;
        chartSummary.style.color = todaySales > 0 ? '#4CAF50' : '#FF9800';
        chartSummary.style.fontWeight = 'bold';
    }
}

function generateLast7DaysSales() {
    const salesData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        let daySales = 0;
        const dayOrders = allOrders.filter(order => {
            if (!order || !order.createdAt) return false;
            const orderDate = new Date(order.createdAt);
            return orderDate.toISOString().split('T')[0] === dateString;
        });

        dayOrders.forEach(order => {
            daySales += parseFloat(order.total || 0);
        });

        salesData.push({
            date: dateString,
            amount: daySales,
            ordersCount: dayOrders.length
        });
    }

    return salesData;
}

// ==================== HELPER FUNCTIONS ====================
function showLoading(show) {
    const loadingOverlay = document.getElementById('dashboardLoading');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles if not present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                max-width: 300px;
            }
            
            .notification-success {
                background: linear-gradient(135deg, #4CAF50, #2E7D32);
                border-left: 4px solid #2E7D32;
            }
            
            .notification-error {
                background: linear-gradient(135deg, #f44336, #c62828);
                border-left: 4px solid #c62828;
            }
            
            .notification-info {
                background: linear-gradient(135deg, #2196F3, #1565C0);
                border-left: 4px solid #1565C0;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function initRealTimeUpdates() {
    // Check for updates every 30 seconds
    const updateInterval = setInterval(() => {
        console.log('Checking for data updates...');
        fetchAllData();
    }, 30000);
    
    // Store interval ID for cleanup
    window.dashboardUpdateInterval = updateInterval;
}

function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
            
            fetchAllData().finally(() => {
                setTimeout(() => {
                    refreshBtn.disabled = false;
                    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                }, 1000);
            });
        });
    }
    
    // Manual refresh with Ctrl+R (but not when in input fields)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'r' && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            fetchAllData();
        }
    });
    
    // Auto-refresh when tab becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            fetchAllData();
        }
    });
}

// ==================== DASHBOARD INITIALIZATION ====================
function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    // Check if we're on a dashboard page
    const isDashboardPage = window.location.pathname.includes('admindashboard') || 
                           window.location.pathname.includes('dashboard') ||
                           document.querySelector('.dashboard-container') ||
                           document.querySelector('.dashboard-stats') ||
                           document.querySelector('.stat-card');
    
    if (!isDashboardPage) {
        console.log('Not on dashboard page, skipping initialization');
        return;
    }
    
    // Add dashboard styles
    addDashboardStyles();
    
    // Initialize all stat values to 0
    document.querySelectorAll('.stat-value').forEach(el => {
        if (el.textContent.trim() === '' || el.textContent.trim() === '0') {
            el.textContent = '0';
            el.style.opacity = '0.7';
        }
    });
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial data load
    fetchAllData();
    
    // Start periodic updates
    setTimeout(() => {
        initRealTimeUpdates();
    }, 30000);
    
    console.log('Dashboard initialized successfully');
}

function addDashboardStyles() {
    if (!document.getElementById('dashboard-styles')) {
        const style = document.createElement('style');
        style.id = 'dashboard-styles';
        style.textContent = `
            /* Dashboard Styles */
            .stat-card {
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .stat-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0,0,0,0.1);
            }
            
            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #4CAF50, #2196F3);
            }
            
            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .stat-value-updating {
                animation: pulse 0.5s ease;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); color: inherit; }
                50% { transform: scale(1.05); color: #4CAF50; }
                100% { transform: scale(1); color: inherit; }
            }
            
            /* Chart Styles */
            .chart-container {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                overflow: hidden;
            }
            
            .chart-bar {
                position: relative;
                transition: all 0.3s ease;
            }
            
            .chart-amount-label {
                position: absolute;
                top: -25px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
                pointer-events: none;
            }
            
            .chart-day-label {
                position: absolute;
                bottom: -25px;
                left: 50%;
                transform: translateX(-50%);
                color: #666;
                font-size: 12px;
                font-weight: 500;
                white-space: nowrap;
            }
            
            /* Status Badges */
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: bold;
                text-align: center;
                min-width: 80px;
                transition: all 0.2s ease;
            }
            
            .status-badge:hover {
                transform: scale(1.05);
                box-shadow: 0 3px 8px rgba(0,0,0,0.1);
            }
            
            .status-hot {
                background: linear-gradient(135deg, #ff4081, #ff79a9);
                color: white;
            }
            
            .status-trending {
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
            
            /* Loading Overlay */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #4CAF50;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Table Animations */
            table tbody tr {
                transition: all 0.3s ease;
            }
            
            table tbody tr:hover {
                background-color: #f5f5f5;
                transform: translateX(5px);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add loading overlay if not present
    if (!document.getElementById('dashboardLoading')) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'dashboardLoading';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loadingOverlay);
    }
}

// ==================== CLEANUP FUNCTION ====================
function cleanupDashboard() {
    if (window.dashboardUpdateInterval) {
        clearInterval(window.dashboardUpdateInterval);
    }
    
    if (eventSource) {
        eventSource.close();
    }
}

// ==================== STARTUP ====================
// Handle page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    // If document is already loaded
    setTimeout(initializeDashboard, 100);
}

// Handle page unload
window.addEventListener('beforeunload', cleanupDashboard);
window.addEventListener('unload', cleanupDashboard);

// Export functions for debugging
window.dashboardDebug = {
    fetchAllData,
    calculateDashboardStats,
    updateDashboardUI,
    getStats: () => dashboardStats,
    getData: () => ({
        allOrders,
        allMenuItems,
        allInventory,
        allCustomers,
        topSellingProducts
    })
};