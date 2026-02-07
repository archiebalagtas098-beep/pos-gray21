// ==================== DASHBOARD MAIN SCRIPT ====================

let eventSource = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Store sales data for chart scaling
let salesChartData = {
    last7Days: [],
    dailySales: [],
    maxDailySale: 0,
    todaySales: 0
};

// Animation state
let chartAnimationInProgress = false;

// Dashboard stats
let dashboardStats = {
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    todaysOrders: 0,
    todaysRevenue: 0,
    inventoryLowStock: 0,
    inventoryOutOfStock: 0
};

// Data storage
let allOrders = [];
let allMenuItems = [];
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
    if (numAmount === 0) return '₱0.00';
    
    return '₱' + numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatCurrencySimple(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₱0.00';
    }
    
    const numAmount = parseFloat(amount);
    if (numAmount === 0) return '₱0.00';
    
    // For smaller numbers, don't show decimals if they're .00
    if (numAmount < 1000) {
        if (numAmount % 1 === 0) {
            return '₱' + numAmount.toFixed(0);
        }
    }
    
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

// ==================== API FUNCTIONS ====================
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

// ==================== DASHBOARD STATS ====================
async function fetchDashboardStats() {
    try {
        console.log('📊 Fetching dashboard stats...');
        
        // Fetch stats from API
        const statsResponse = await fetchApi('/api/dashboard/stats');
        
        if (statsResponse && statsResponse.success && statsResponse.data) {
            // Update dashboard stats with API data
            Object.assign(dashboardStats, statsResponse.data);
            console.log('✅ Dashboard stats loaded from API');
        } else {
            console.log('⚠️ Using empty stats - no data available');
            await setEmptyStats();
        }
        
        // Update UI
        updateDashboardUI();
        
        // Fetch additional data
        await Promise.allSettled([
            loadOrders(),
            loadMenuItems(),
            loadTopSellingProducts(),
            loadInventoryStatus()
        ]);
        
        // Render chart with latest data
        renderSalesChart(dashboardStats);
        
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        await setEmptyStats();
        updateDashboardUI();
    }
}

async function setEmptyStats() {
    console.log('🔄 Setting empty stats...');
    
    dashboardStats = {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        todaysOrders: 0,
        todaysRevenue: 0,
        inventoryLowStock: 0,
        inventoryOutOfStock: 0
    };
    
    console.log('✅ Stats reset to 0:', dashboardStats);
}

function updateDashboardUI() {
    console.log('🔄 Updating dashboard UI...');
    
    // Update all dashboard elements
    const elements = {
        'totalOrders': { value: dashboardStats.totalOrders, type: 'number' },
        'totalRevenue': { value: dashboardStats.totalRevenue, type: 'currency' },
        'totalCustomers': { value: dashboardStats.totalCustomers, type: 'number' },
        'totalProducts': { value: dashboardStats.totalProducts, type: 'number' },
        'todaysOrders': { value: dashboardStats.todaysOrders, type: 'number' },
        'todaysRevenue': { value: dashboardStats.todaysRevenue, type: 'currency' }
    };
    
    Object.entries(elements).forEach(([id, data]) => {
        const element = document.getElementById(id);
        if (element) {
            const oldValue = element.textContent.trim();
            let newValue = '';
            
            if (data.type === 'currency') {
                newValue = formatCurrency(data.value);
            } else {
                newValue = formatNumber(data.value);
            }
            
            if (oldValue !== newValue && oldValue !== '') {
                // Animate the change
                animateValueChange(element, oldValue, newValue);
            } else if (oldValue === '') {
                element.textContent = newValue;
                fadeInElement(element, 200);
            }
        }
    });
    
    console.log('✅ Dashboard UI updated');
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
        
        // Try API endpoint
        const data = await fetchApi('/api/orders?limit=50');
        
        if (data && data.success && data.data && Array.isArray(data.data)) {
            allOrders = data.data;
            console.log(`✅ Orders loaded: ${allOrders.length}`);
        } else {
            console.log('✅ No orders found - starting fresh');
            allOrders = [];
        }
        
        // Update recent orders table
        updateRecentOrdersTable();
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        allOrders = [];
        updateRecentOrdersTable();
    }
}

function updateRecentOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (allOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-clipboard-check"></i> No orders found
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first) and take top 10
    const recentOrders = [...allOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
    
    // Add rows
    recentOrders.forEach((order, index) => {
        const row = document.createElement('tr');
        const orderTime = new Date(order.createdAt || Date.now());
        const timeString = orderTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        }).toLowerCase();
        
        const totalAmount = parseFloat(order.total || order.totalAmount || 0);
        const customerName = order.customerName || order.customer || 'Walk-in Customer';
        const orderNumber = order.orderNumber || `ORD-${(order._id || '0000').toString().substring(0, 8)}`;
        
        row.innerHTML = `
            <td>${orderNumber}</td>
            <td>${timeString}</td>
            <td>${customerName}</td>
            <td>${formatCurrency(totalAmount)}</td>
        `;
        
        // Add fade-in animation with delay
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

// ==================== MENU ITEMS ====================
async function loadMenuItems() {
    try {
        console.log('🍽️ Loading menu items...');
        
        const data = await fetchApi('/api/menu');
        
        if (data && data.success && data.data) {
            allMenuItems = data.data;
            console.log(`✅ Menu items loaded: ${allMenuItems.length}`);
        } else {
            console.log('✅ No menu items found');
            allMenuItems = [];
        }
        
        // Update products count
        dashboardStats.totalProducts = allMenuItems.length;
        
    } catch (error) {
        console.error('❌ Error loading menu items:', error);
        allMenuItems = [];
    }
}

// ==================== TOP SELLING PRODUCTS ====================
async function loadTopSellingProducts() {
    try {
        console.log('📈 Loading top selling products...');
        
        const data = await fetchApi('/api/orders/top-selling?limit=10');
        
        if (data && data.success && data.data) {
            topSellingProducts = data.data;
            console.log(`✅ Top selling products loaded: ${topSellingProducts.length}`);
        } else {
            console.log('✅ No top selling products - no sales data');
            topSellingProducts = [];
        }
        
        updateTopItemsTable();
        
    } catch (error) {
        console.error('❌ Error loading top selling products:', error);
        topSellingProducts = [];
        updateTopItemsTable();
    }
}

function updateTopItemsTable() {
    const tableBody = document.getElementById('topItemsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (topSellingProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-chart-bar"></i> No sales data available
                </td>
            </tr>
        `;
        return;
    }
    
    topSellingProducts.forEach((product, index) => {
        const row = document.createElement('tr');
        const displayName = product.name.length > 25 
            ? product.name.substring(0, 25) + '...' 
            : product.name;
        
        // Determine status based on rank
        let status = 'Normal';
        let statusClass = 'status-normal';
        
        if (index < 3) {
            status = 'Bestseller';
            statusClass = 'status-hot';
        } else if (product.totalRevenue > 5000) {
            status = 'Popular';
            statusClass = 'status-trending';
        } else if (product.totalRevenue === 0) {
            status = 'No Sales';
            statusClass = 'status-new';
        }
        
        row.innerHTML = `
            <td title="${product.name}">${displayName}</td>
            <td>${formatCurrency(product.totalRevenue)}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ==================== INVENTORY STATUS ====================
async function loadInventoryStatus() {
    try {
        console.log('📦 Loading inventory status...');
        
        const data = await fetchApi('/api/inventory');
        
        if (data && data.success && data.data) {
            updateInventoryStatusTable(data.data);
            console.log(`✅ Inventory items loaded: ${data.data.length}`);
        } else {
            console.log('✅ No inventory items found');
            updateInventoryStatusTable([]);
        }
        
    } catch (error) {
        console.error('❌ Error loading inventory:', error);
        updateInventoryStatusTable([]);
    }
}

function updateInventoryStatusTable(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (!items || items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-boxes"></i> No inventory items available
                </td>
            </tr>
        `;
        return;
    }
    
    // Count low stock and out of stock items
    let lowStockCount = 0;
    let outOfStockCount = 0;
    
    // Sort by stock level (lowest first)
    const sortedItems = [...items]
        .map(item => {
            const stock = parseFloat(item.currentStock || item.stock || 0);
            const minStock = parseFloat(item.minStock || 5);
            
            let status = 'In Stock';
            let statusClass = 'status-in-stock';
            
            if (stock <= 0) {
                status = 'Out of Stock';
                statusClass = 'status-out-of-stock';
                outOfStockCount++;
            } else if (stock <= minStock) {
                status = 'Low Stock';
                statusClass = 'status-low-stock';
                lowStockCount++;
            }
            
            return {
                ...item,
                displayStock: stock,
                status,
                statusClass
            };
        })
        .sort((a, b) => a.displayStock - b.displayStock)
        .slice(0, 10);
    
    // Update dashboard stats
    dashboardStats.inventoryLowStock = lowStockCount;
    dashboardStats.inventoryOutOfStock = outOfStockCount;
    
    // Create table rows
    sortedItems.forEach(item => {
        const row = document.createElement('tr');
        const displayName = item.itemName || item.name || 'Unknown Item';
        const truncatedName = displayName.length > 20 
            ? displayName.substring(0, 20) + '...' 
            : displayName;
        
        row.innerHTML = `
            <td title="${displayName}">${truncatedName}</td>
            <td>${formatNumber(item.displayStock)} ${item.unit || 'units'}</td>
            <td><span class="status-badge ${item.statusClass}">${item.status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ==================== CHART FUNCTIONS ====================
function renderSalesChart(stats) {
    const chartBars = document.getElementById('chartBars');
    const chartSummary = document.getElementById('chartSummary');
    const graphStatus = document.getElementById('graphStatus');
    
    if (!chartBars) return;
    
    // Clear with fade out
    chartBars.style.opacity = '0';
    chartBars.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        chartBars.innerHTML = '';
        
        // Generate last 7 days sales data (all zeros initially)
        const salesData = generateEmptySalesData();
        
        // Find maximum sales for scaling
        const maxDailySale = Math.max(...salesData.map(day => day.amount));
        const hasSales = maxDailySale > 0;
        
        // Create bars
        const bars = [];
        const targetHeights = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        salesData.forEach((dayData, index) => {
            const bar = document.createElement('div');
            const dayName = dayNames[new Date(dayData.date).getDay()];
            const isToday = index === 6;
            
            // Calculate height percentage (10% for zero sales)
            let heightPercentage = 10;
            
            // Create bar element
            bar.className = 'chart-bar';
            bar.style.cssText = `
                height: 0%;
                background: #F5F5F5;
                margin: 0 6px;
                border-radius: 4px 4px 0 0;
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                position: relative;
                cursor: pointer;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease ${index * 100}ms;
            `;
            
            // Add hover tooltip
            bar.title = `${dayName}: ${formatCurrencySimple(dayData.amount)}`;
            
            // Create amount label
            const amountLabel = document.createElement('div');
            amountLabel.className = 'chart-amount-label';
            amountLabel.textContent = formatCurrencySimple(dayData.amount);
            bar.appendChild(amountLabel);
            
            // Create day label
            const dayLabel = document.createElement('div');
            dayLabel.className = 'chart-day-label';
            dayLabel.textContent = dayName;
            bar.appendChild(dayLabel);
            
            // Add hover effects
            bar.addEventListener('mouseenter', () => {
                if (!chartAnimationInProgress) {
                    bar.style.transform = 'translateY(-10px)';
                    amountLabel.style.opacity = '1';
                }
            });
            
            bar.addEventListener('mouseleave', () => {
                if (!chartAnimationInProgress) {
                    bar.style.transform = 'translateY(0)';
                    amountLabel.style.opacity = '0';
                }
            });
            
            // Store for animation
            bars.push(bar);
            targetHeights.push(heightPercentage);
            
            // Add to chart
            chartBars.appendChild(bar);
        });
        
        // Update status text
        if (graphStatus) {
            graphStatus.textContent = 'No sales recorded yet';
            graphStatus.style.color = '#FF9800';
        }
        
        // Update summary
        if (chartSummary) {
            chartSummary.textContent = 'Today: ₱0.00';
            chartSummary.style.color = '#FF9800';
        }
        
        // Fade in chart container
        chartBars.style.opacity = '1';
        
        // Animate bars
        setTimeout(() => {
            bars.forEach((bar, index) => {
                bar.style.opacity = '1';
                bar.style.transform = 'translateY(0)';
            });
            
            // Start bar growth animation
            setTimeout(() => {
                animateChartBars(bars, targetHeights, 1000);
            }, 300);
        }, 100);
        
    }, 300);
}

function generateEmptySalesData() {
    const today = new Date();
    const salesData = [];
    
    // Generate last 7 days with zero sales
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        salesData.push({
            date: date.toISOString(),
            amount: 0,
            isToday: i === 6
        });
    }
    
    return salesData;
}

function animateChartBars(bars, targetHeights, duration = 1000) {
    if (chartAnimationInProgress) return;
    chartAnimationInProgress = true;
    
    const startTime = performance.now();
    
    function updateAnimation(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        bars.forEach((bar, index) => {
            const targetHeight = targetHeights[index];
            const currentHeight = targetHeight * easeOut;
            
            bar.style.height = `${currentHeight}%`;
        });
        
        if (progress < 1) {
            requestAnimationFrame(updateAnimation);
        } else {
            chartAnimationInProgress = false;
        }
    }
    
    requestAnimationFrame(updateAnimation);
}

function animateValue(element, start, end, duration = 1000, prefix = '', suffix = '') {
    if (!element) return Promise.resolve();
    
    return new Promise(resolve => {
        const startTime = performance.now();
        const isCurrency = prefix === '₱';
        
        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = start + (end - start) * easeOut;
            
            if (isCurrency) {
                element.textContent = `${prefix}${currentValue.toFixed(2)}`;
            } else if (suffix === '%') {
                element.textContent = `${currentValue.toFixed(1)}${suffix}`;
            } else {
                element.textContent = formatNumber(Math.round(currentValue));
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            } else {
                resolve();
            }
        }
        
        requestAnimationFrame(updateValue);
    });
}

function fadeInElement(element, delay = 0) {
    if (!element) return;
    
    setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Trigger reflow
        void element.offsetWidth;
        
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, delay);
}

// ==================== LOGOUT FUNCTIONALITY ====================
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        console.log('✅ Logout button event listener added');
    }
    
    // Also look for any element with logout class
    document.querySelectorAll('[onclick*="logout"], .logout-btn').forEach(element => {
        if (!element.hasAttribute('data-logout-handled')) {
            element.setAttribute('data-logout-handled', 'true');
            element.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
    });
}

async function handleLogout(e) {
    if (e) e.preventDefault();
    
    console.log('🚪 Logout initiated...');
    
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to logout?');
    if (!confirmed) return;
    
    // Show loading state
    showLogoutLoading();
    
    try {
        // Cleanup dashboard resources
        cleanup();
        
        // Send logout request
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            console.log('✅ Logout successful');
            clearLocalData();
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = '/login';
            }, 500);
            
        } else {
            throw new Error('Logout request failed');
        }
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        tryFallbackLogout();
    }
}

function showLogoutLoading() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'logout-loading';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        color: white;
        font-family: Arial, sans-serif;
    `;
    
    loadingOverlay.innerHTML = `
        <div class="spinner" style="
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 20px;
        "></div>
        <h3 style="margin: 0 0 10px 0; color: white;">Logging out...</h3>
        <p style="opacity: 0.8; margin: 0; color: #ddd;">Please wait</p>
    `;
    
    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loadingOverlay);
}

function clearLocalData() {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('🧹 Local data cleared');
}

function tryFallbackLogout() {
    console.log('🔄 Trying fallback logout methods...');
    
    // Try direct redirect to logout endpoint
    window.location.href = '/logout';
    
    // Fallback
    setTimeout(() => {
        window.location.href = '/login?logout=true';
    }, 1000);
}

// ==================== REAL-TIME UPDATES ====================
function initRealTimeUpdates() {
    console.log('🚀 Initializing real-time updates...');
    
    setupSSEConnection();
    
    // Regular refresh every 30 seconds
    setInterval(fetchDashboardStats, 30000);
}

function setupSSEConnection() {
    console.log('📡 Setting up SSE connection...');
    
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
    
    eventSource = new EventSource('/api/admin/events', {
        withCredentials: true
    });
    
    eventSource.onopen = () => {
        console.log('✅ Connected to real-time server');
        isConnected = true;
        reconnectAttempts = 0;
    };
    
    eventSource.onmessage = (event) => {
        console.log('📥 Received SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);
            handleSSEEvent(data);
        } catch (error) {
            console.error('❌ Error parsing SSE event:', error);
        }
    };
    
    eventSource.addEventListener('new_order', (event) => {
        try {
            const data = JSON.parse(event.data);
            handleNewOrderEvent(data);
        } catch (error) {
            console.error('❌ Error processing new order event:', error);
        }
    });
    
    eventSource.addEventListener('stats_update', (event) => {
        try {
            const data = JSON.parse(event.data);
            handleStatsUpdateEvent(data);
        } catch (error) {
            console.error('❌ Error processing stats update:', error);
        }
    });
    
    eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        isConnected = false;
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = Math.min(3000 * reconnectAttempts, 30000);
            console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts})...`);
            
            setTimeout(() => {
                setupSSEConnection();
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached.');
        }
    };
}

function handleSSEEvent(data) {
    console.log('🎯 Handling SSE event:', data.type);
    
    switch (data.type) {
        case 'connected':
            console.log('✅ ' + (data.message || 'Connected to real-time updates'));
            break;
            
        case 'new_order':
            handleNewOrderEvent(data.data);
            break;
            
        case 'stats_update':
            handleStatsUpdateEvent(data.data);
            break;
            
        default:
            console.log('❓ Unknown event type:', data.type);
    }
}

function handleNewOrderEvent(orderData) {
    console.log('🆕 New order received:', orderData.orderNumber);
    
    // Show notification
    showOrderNotification(orderData);
    
    // Add to orders array
    allOrders.unshift(orderData);
    
    // Update tables
    updateRecentOrdersTable();
    
    // Refresh stats
    fetchDashboardStats();
}

function handleStatsUpdateEvent(statsData) {
    console.log('📊 Stats update event received');
    fetchDashboardStats();
}

// ==================== NOTIFICATION SYSTEM ====================
function showOrderNotification(order) {
    // Remove existing notification
    const existing = document.querySelector('.order-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'order-notification';
    notification.innerHTML = `
        <div class="notification-header">
            <strong>🆕 New Order!</strong>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="notification-body">
            <p><strong>Order #:</strong> ${order.orderNumber || 'N/A'}</p>
            <p><strong>Total:</strong> ${formatCurrency(order.total || 0)}</p>
            <p><strong>Customer:</strong> ${order.customerName || 'Walk-in'}</p>
            <p><small>${new Date().toLocaleTimeString()}</small></p>
        </div>
    `;
    
    addNotificationStyles();
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 8000);
}

function addNotificationStyles() {
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .order-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-left: 4px solid #4CAF50;
                border-radius: 8px;
                padding: 15px;
                width: 300px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                font-family: Arial, sans-serif;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #eee;
            }
            
            .notification-header strong {
                color: #333;
                font-size: 16px;
            }
            
            .notification-header button {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
           
            
            .notification-body p {
                margin: 5px 0;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .notification-body strong {
                color: #555;
                font-weight: 600;
                display: inline-block;
                min-width: 70px;
            }
            
            .notification-body small {
                color: #888;
                font-size: 12px;
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== STYLES ====================
function addDashboardStyles() {
    if (!document.getElementById('dashboard-styles')) {
        const style = document.createElement('style');
        style.id = 'dashboard-styles';
        style.textContent = `
            /* Card animations */
            .card-animated {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            
            /* Chart styles */
            .chart-container {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                overflow: hidden;
            }
            
            .chart-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
            }
            
            .chart-bar {
                position: relative;
            }
            
            .chart-amount-label {
                position: absolute;
                top: -25px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: bold;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
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
            
            /* Status badges */
            .status-badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: bold;
                text-align: center;
                min-width: 80px;
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
            
            .status-new {
                background: linear-gradient(135deg, #7b1fa2, #ba68c8);
                color: white;
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
            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }
            
            th {
                font-weight: 600;
                text-align: left;
                padding: 12px;
                border-bottom: 2px solid #dee2e6;
                background-color: #f8f9fa;
                color: #495057;
            }
            
            td {
                padding: 12px;
                border-bottom: 1px solid #e9ecef;
                vertical-align: middle;
            }

            /* Loading animation */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .fade-in {
                animation: fadeIn 0.5s ease forwards;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .chart-container {
                    padding: 15px;
                }
                
                .chart-bar {
                    margin: 0 3px;
                }
                
                .chart-amount-label {
                    font-size: 10px;
                    padding: 1px 6px;
                }
                
                .chart-day-label {
                    font-size: 11px;
                }
                
                table {
                    font-size: 13px;
                }
                
                th, td {
                    padding: 8px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== EVENT HANDLERS ====================
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // Add rotation animation
            this.style.transition = 'transform 0.5s ease';
            this.style.transform = 'rotate(360deg)';
            
            setTimeout(() => {
                this.style.transform = '';
            }, 500);
            
            fetchDashboardStats();
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterOrders(e.target.value);
        });
    }
    
    // Handle page visibility for auto-refresh
    let refreshInterval;
    
    function setupAutoRefresh() {
        clearInterval(refreshInterval);
        
        refreshInterval = setInterval(() => {
            if (!document.hidden) {
                fetchDashboardStats();
            }
        }, 60000);
    }
    
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setupAutoRefresh();
        } else {
            clearInterval(refreshInterval);
        }
    });
    
    setupAutoRefresh();
}

function filterOrders(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const tableBody = document.getElementById('ordersTableBody');
    
    if (!tableBody || !allOrders.length) return;
    
    if (!term) {
        updateRecentOrdersTable();
        return;
    }
    
    // Filter orders
    const filteredOrders = allOrders.filter(order => {
        const orderNumber = (order.orderNumber || '').toLowerCase();
        const customerName = (order.customerName || '').toLowerCase();
        
        return orderNumber.includes(term) || customerName.includes(term);
    });
    
    // Update table with filtered results
    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    No orders found matching "${searchTerm}"
                </td>
            </tr>
        `;
        return;
    }
    
    // Show filtered results
    tableBody.innerHTML = '';
    
    filteredOrders.slice(0, 10).forEach((order, index) => {
        const row = document.createElement('tr');
        const orderTime = new Date(order.createdAt || Date.now());
        const timeString = orderTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        }).toLowerCase();
        
        const totalAmount = parseFloat(order.total || order.totalAmount || 0);
        const customerName = order.customerName || order.customer || 'Walk-in Customer';
        const orderNumber = order.orderNumber || `ORD-${(order._id || '0000').toString().substring(0, 8)}`;
        
        row.innerHTML = `
            <td>${orderNumber}</td>
            <td>${timeString}</td>
            <td>${customerName}</td>
            <td>${formatCurrency(totalAmount)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ==================== CLEANUP ====================
function cleanup() {
    if (eventSource) {
        eventSource.close();
        console.log('🔌 SSE connection closed');
    }
    
    // Clear any intervals
    const intervalId = window.setInterval(function(){}, 9999);
    for (let i = 0; i < intervalId; i++) {
        window.clearInterval(i);
    }
}

// ==================== INITIALIZATION ====================
function initializeDashboard() {
    console.log('📄 Dashboard page loaded');
    
    const isDashboardPage = window.location.pathname.includes('admindashboard') || 
                           window.location.pathname.includes('dashboard') ||
                           document.querySelector('.dashboard-container');
    
    if (!isDashboardPage) return;
    
    console.log('🏁 Starting dashboard initialization...');
    
    // Add styles
    addDashboardStyles();
    
    // Initialize logout functionality
    initLogout();
    
    // Add animation classes to cards
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('card-animated');
    });
    
    // Setup event listeners
    setupEventListeners();
    
    // Set initial values to 0
    document.querySelectorAll('.stat-value').forEach(el => {
        el.textContent = '0';
    });
    
    // Load initial data
    fetchDashboardStats();
    
    // Start real-time updates
    setTimeout(() => {
        initRealTimeUpdates();
    }, 2000);
    
    console.log('✅ Dashboard initialized successfully - starting fresh with no data');
}

// ==================== GLOBAL EXPORTS ====================
window.fixPesoSign = function() {
    const revenueEl = document.getElementById('totalRevenue');
    if (revenueEl && !revenueEl.textContent.includes('₱')) {
        const current = revenueEl.textContent;
        revenueEl.textContent = '₱' + current.replace(/[^\d.]/g, '');
    }
};

window.refreshDashboard = function() {
    fetchDashboardStats();
};

window.logoutDashboard = function() {
    handleLogout();
};

// ==================== STARTUP ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    setTimeout(initializeDashboard, 100);
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

console.log('✅ Dashboard script loaded - Starting fresh with no sample data');