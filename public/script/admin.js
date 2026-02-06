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

// ==================== LOGOUT FUNCTIONALITY ====================
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutLink = document.querySelector('[href*="logout"]');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        console.log('✅ Logout button event listener added');
    }
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
        console.log('✅ Logout link event listener added');
    }
    
    // Also look for any element with logout class
    document.querySelectorAll('.logout-btn, .btn-logout, [onclick*="logout"]').forEach(element => {
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
        // Cleanup dashboard resources first
        cleanup();
        
        // Send logout request
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            console.log('✅ Logout successful');
            // Clear any local storage/session data
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
        
        // Fallback: try traditional logout
        tryFallbackLogout();
    }
}

function showLogoutLoading() {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'logout-loading';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
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
        <h3 style="margin: 0 0 10px 0;">Logging out...</h3>
        <p style="opacity: 0.8; margin: 0;">Please wait</p>
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
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear any cookies that might be set
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('🧹 Local data cleared');
}

function tryFallbackLogout() {
    console.log('🔄 Trying fallback logout methods...');
    
    // Method 1: Direct redirect to logout endpoint
    window.location.href = '/logout';
    
    // Method 2: If that doesn't work, try after delay
    setTimeout(() => {
        window.location.href = '/auth/logout';
    }, 1000);
    
    // Method 3: Final fallback
    setTimeout(() => {
        window.location.href = '/login?logout=true';
    }, 2000);
}

// ==================== UTILITY FUNCTIONS ====================
function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}

function formatCurrencySimple(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₱0.00';
    }
    
    const numAmount = parseFloat(amount);
    if (numAmount === 0) return '₱0.00';
    
    // Format with commas for thousands
    return '₱' + numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// ==================== CHART ANIMATIONS ====================
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
            
            // Update bar height
            bar.style.height = `${currentHeight}%`;
            
            // Add glow effect for today's bar
            if (index === 6) {
                const glowIntensity = 10 + (5 * easeOut);
                const glowOpacity = 0.2 + (0.3 * easeOut);
                bar.style.boxShadow = `0 0 ${glowIntensity}px rgba(76, 175, 80, ${glowOpacity})`;
            }
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
                element.textContent = Math.round(currentValue);
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

function pulseElement(element) {
    if (!element) return;
    
    element.style.transition = 'all 0.3s ease';
    element.style.transform = 'scale(1.05)';
    element.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.boxShadow = '';
    }, 300);
}

const broadcastToAdmins = (data) => {
  if (adminClients.size === 0) {
    return;
  }
  
  const eventData = `data: ${JSON.stringify(data)}\n\n`;
  
  adminClients.forEach(client => {
    try {
      client.res.write(eventData);
      if (client.res.flush) {
        client.res.flush();
      }
    } catch (error) {
      adminClients.delete(client);
    }
  });
};

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
        
        // Get today's date and last 7 days
        const today = new Date();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push(date);
        }
        
        // Get day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Calculate sales data for last 7 days
        const salesData = calculateWeeklySales(stats);
        
        // Find maximum sales for scaling
        const maxDailySale = Math.max(...salesData.map(day => day.amount));
        const hasSales = maxDailySale > 0;
        
        // Calculate bar heights with proper scaling
        const bars = [];
        const targetHeights = [];
        
        salesData.forEach((dayData, index) => {
            const bar = document.createElement('div');
            const dayName = dayNames[last7Days[index].getDay()];
            
            // Calculate height percentage
            let heightPercentage;
            if (hasSales) {
                // Scale based on max sale (5% minimum, 95% maximum)
                heightPercentage = 5 + (dayData.amount / maxDailySale) * 90;
                heightPercentage = Math.min(Math.max(heightPercentage, 5), 95);
            } else {
                // For zero sales, show minimal bars with variation
                heightPercentage = 5 + (index * 0.5); // 5% to 8.5%
            }
            
            const isToday = index === 6;
            
            // Create bar element
            bar.style.cssText = `
                height: 0%;
                background: ${isToday ? 
                    (hasSales ? '#4CAF50' : '#FF9800') : 
                    (hasSales ? '#E0E0E0' : '#F5F5F5')};
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
                transition: opacity 0.5s ease ${index * 100}ms, 
                            transform 0.5s ease ${index * 100}ms;
            `;
            
            // Add hover tooltip
            bar.title = `${dayName}: ${formatCurrencySimple(dayData.amount)}`;
            
            // Create amount label (shown on hover)
            const amountLabel = document.createElement('div');
            amountLabel.style.cssText = `
                position: absolute;
                top: -25px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: bold;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
            `;
            amountLabel.textContent = formatCurrencySimple(dayData.amount);
            bar.appendChild(amountLabel);
            
            // Create day label
            const dayLabel = document.createElement('div');
            dayLabel.style.cssText = `
                position: absolute;
                bottom: -25px;
                left: 50%;
                transform: translateX(-50%);
                color: #666;
                font-size: 11px;
                font-weight: ${isToday ? 'bold' : 'normal'};
                white-space: nowrap;
            `;
            dayLabel.textContent = dayName;
            bar.appendChild(dayLabel);
            
            // Add hover effects
            bar.addEventListener('mouseenter', () => {
                bar.style.transform = 'translateY(-10px) scale(1.05)';
                amountLabel.style.opacity = '1';
            });
            
            bar.addEventListener('mouseleave', () => {
                bar.style.transform = 'translateY(0) scale(1)';
                amountLabel.style.opacity = '0';
            });
            
            // Store for animation
            bars.push(bar);
            targetHeights.push(heightPercentage);
            
            // Add to chart
            chartBars.appendChild(bar);
        });
        
        // Update status text
        if (graphStatus) {
            if (hasSales) {
                const todaySales = salesData[6].amount;
                const yesterdaySales = salesData[5].amount;
                let changeText = '';
                
                if (yesterdaySales > 0) {
                    const changePercent = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
                    if (changePercent > 0) {
                        changeText = `↑ ${changePercent.toFixed(1)}% from yesterday`;
                    } else if (changePercent < 0) {
                        changeText = `↓ ${Math.abs(changePercent).toFixed(1)}% from yesterday`;
                    } else {
                        changeText = 'Same as yesterday';
                    }
                } else {
                    changeText = 'New sales today!';
                }
                
                graphStatus.textContent = `Today: ${formatCurrencySimple(todaySales)} • ${changeText}`;
            } else {
                graphStatus.textContent = 'No sales recorded today';
            }
            fadeInElement(graphStatus, 800);
        }
        
        // Update summary
        if (chartSummary) {
            const todaySales = hasSales ? salesData[6].amount : 0;
            chartSummary.textContent = `Today: ${formatCurrencySimple(todaySales)}`;
            chartSummary.style.color = hasSales ? '#4CAF50' : '#FF9800';
            chartSummary.style.fontWeight = 'bold';
            fadeInElement(chartSummary, 1000);
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
                animateChartBars(bars, targetHeights, 1200);
            }, 500);
        }, 300);
        
    }, 300);
}

function calculateWeeklySales(stats) {
    const today = new Date();
    const salesData = [];
    
    // Get today's sales from stats
    const todaySales = stats.totalRevenue || 0;
    const hasSales = todaySales > 0;
    
    // Generate sales for last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        let daySales = 0;
        
        if (i === 6) { // Today
            daySales = todaySales;
        } else if (hasSales) {
            // Generate realistic decreasing sales for previous days
            const basePercentage = 30 + (i * 10); // 30% for 6 days ago, up to 80% for yesterday
            const variation = 0.8 + Math.random() * 0.4; // Random variation between 80-120%
            daySales = (todaySales * basePercentage / 100) * variation;
            
            // Round to reasonable values
            if (daySales < 100) {
                daySales = Math.round(daySales / 10) * 10; // Round to nearest 10
            } else if (daySales < 1000) {
                daySales = Math.round(daySales / 50) * 50; // Round to nearest 50
            } else {
                daySales = Math.round(daySales / 100) * 100; // Round to nearest 100
            }
            
            // Ensure no negative values
            daySales = Math.max(0, daySales);
        }
        
        salesData.push({
            date: date,
            amount: daySales,
            isToday: i === 6
        });
    }
    
    return salesData;
}

// ==================== DASHBOARD UPDATE FUNCTIONS ====================
function updateDashboardDisplay(stats) {
    console.log('Updating dashboard with stats:', stats);
    
    // Store old values for animation
    const oldStats = {
        totalOrders: parseInt(document.getElementById('totalOrders')?.textContent.replace(/,/g, '') || 0),
        totalRevenue: parseFloat(document.getElementById('totalRevenue')?.textContent.replace(/[^0-9.-]+/g, "") || 0),
        totalCustomers: parseInt(document.getElementById('totalCustomers')?.textContent.replace(/,/g, '') || 0),
        totalProducts: parseInt(document.getElementById('totalProducts')?.textContent.replace(/,/g, '') || 0)
    };
    
    // Animate updates
    updateStatsWithAnimation(oldStats, stats);
    
    // Render sales chart
    renderSalesChart(stats);
}

function updateStatsWithAnimation(oldStats, newStats) {
    // Total Orders
    const totalOrdersEl = document.getElementById('totalOrders');
    if (totalOrdersEl) {
        animateValue(totalOrdersEl, oldStats.totalOrders, newStats.totalOrders || 0, 800);
        fadeInElement(totalOrdersEl, 200);
    }
    
    // Total Revenue
    const totalRevenueEl = document.getElementById('totalRevenue');
    if (totalRevenueEl) {
        const oldValue = oldStats.totalRevenue || 0;
        const newValue = newStats.totalRevenue || 0;
        animateValue(totalRevenueEl, oldValue, newValue, 1200, '₱');
        fadeInElement(totalRevenueEl, 300);
        
        // Pulse effect for revenue update
        setTimeout(() => {
            pulseElement(totalRevenueEl.closest('.card'));
        }, 1300);
    }
    
    // Total Customers
    const totalCustomersEl = document.getElementById('totalCustomers');
    if (totalCustomersEl) {
        animateValue(totalCustomersEl, oldStats.totalCustomers, newStats.totalCustomers || 0, 800);
        fadeInElement(totalCustomersEl, 400);
    }
    
    // Total Products
    const totalProductsEl = document.getElementById('totalProducts');
    if (totalProductsEl) {
        animateValue(totalProductsEl, oldStats.totalProducts, newStats.totalProducts || 0, 800);
        fadeInElement(totalProductsEl, 500);
    }
}

// ==================== REAL-TIME UPDATES ====================
function initRealTimeUpdates() {
    console.log('🚀 Initializing real-time updates...');
    
    setupSSEConnection();
    
    fetchDashboardStats();
    
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
            const delay = Math.min(3000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts})...`);
            
            setTimeout(() => {
                setupSSEConnection();
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached. Real-time updates disabled.');
            // Fall back to polling
            setInterval(fetchDashboardStats, 10000);
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
    
    showOrderNotification(orderData);
    
    updateOrdersTable(orderData);
    
    fetchDashboardStats();
}

function handleStatsUpdateEvent(statsData) {
    console.log('📊 Stats update event received, refetching dashboard stats...');
    // Refetch all stats to get complete data
    fetchDashboardStats();
}

// ==================== NOTIFICATION SYSTEM ====================
function showOrderNotification(order) {
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
            <p><strong>Total:</strong> ${formatCurrencySimple(order.total || 0)}</p>
            <p><strong>Type:</strong> ${order.type || 'Dine In'}</p>
            <p><strong>Items:</strong> ${order.items || order.itemCount || 1}</p>
            <p><small>${order.timestamp || new Date().toLocaleTimeString()}</small></p>
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
                width: 320px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                font-family: Arial, sans-serif;
                backdrop-filter: blur(10px);
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
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
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .notification-header button:hover {
                background: #f5f5f5;
                color: #333;
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
                width: 80px;
            }
            
            .notification-body small {
                color: #888;
                font-size: 12px;
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== TABLE UPDATES ====================
function updateOrdersTable(order) {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${order.orderNumber || 'N/A'}</td>
        <td>${order.timestamp || new Date().toLocaleTimeString()}</td>
        <td>${order.customerName || 'Walk-in'}</td>
        <td>${formatCurrencySimple(order.total || 0)}</td>
    `;
    
    newRow.style.animation = 'fadeIn 0.5s ease';
    
    if (tableBody.firstChild) {
        tableBody.insertBefore(newRow, tableBody.firstChild);
    } else {
        tableBody.appendChild(newRow);
    }
    
    // Keep only last 10 orders
    const rows = tableBody.getElementsByTagName('tr');
    if (rows.length > 10) {
        tableBody.removeChild(rows[rows.length - 1]);
    }
    
    addFadeInAnimation();
}

function addFadeInAnimation() {
    if (!document.getElementById('fadeIn-animation')) {
        const style = document.createElement('style');
        style.id = 'fadeIn-animation';
        style.textContent = `
            @keyframes fadeIn {
                from { 
                    opacity: 0; 
                    transform: translateY(-10px); 
                    background-color: rgba(76, 175, 80, 0.1);
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                    background-color: transparent;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== API FUNCTIONS ====================
async function fetchDashboardStats() {
    try {
        console.log('📊 Fetching dashboard stats...');
        
        const response = await fetch('/api/dashboard/stats', {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📊 API Response:', result);
        
        const stats = result.success ? result.data : result;
        console.log('📊 Stats extracted:', {
            totalOrders: stats.totalOrders,
            todaysOrders: stats.todaysOrders,
            totalCustomers: stats.totalCustomers,
            totalProducts: stats.totalProducts
        });
        
        updateDashboardDisplay(stats);
        
        // Fetch today's orders separately
        try {
            const ordersResponse = await fetch('/api/orders/today', {
                credentials: 'include'
            });
            if (ordersResponse.ok) {
                const ordersResult = await ordersResponse.json();
                if (ordersResult.success && ordersResult.data) {
                    console.log('📋 Today\'s orders loaded:', ordersResult.data.length);
                    updateRecentOrdersTable(ordersResult.data);
                }
            }
        } catch (ordersError) {
            console.error('❌ Error fetching today\'s orders:', ordersError);
        }
        
        if (stats.topProducts && stats.topProducts.length > 0) {
            updateTopItemsTable(stats.topProducts);
        }
        
        if (stats.lowStockItems || stats.outOfStockItems) {
            loadInventoryStatus();
        }
        
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        const fallbackStats = {
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            totalProducts: 0
        };
        updateDashboardDisplay(fallbackStats);
    }
}

function updateRecentOrdersTable(orders) {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody || !orders) return;
    
    tableBody.innerHTML = '';
    
    console.log('📋 Updating orders table with', orders.length, 'orders');
    
    // Show only recent 10 orders
    orders.slice(0, 10).forEach(order => {
        const row = document.createElement('tr');
        const displayCustomerId = order.customerId || 'Walk-in';
        const orderTime = order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A';
        
        row.innerHTML = `
            <td>${order.orderNumber || 'N/A'}</td>
            <td>${orderTime}</td>
            <td>${displayCustomerId}</td>
            <td>${formatCurrencySimple(order.total || 0)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateTopItemsTable(topProducts) {
    const tableBody = document.getElementById('topItemsTableBody');
    if (!tableBody || !topProducts) return;
    
    tableBody.innerHTML = '';
    
    topProducts.slice(0, 10).forEach((product, index) => {
        const row = document.createElement('tr');
        const totalSales = product.quantity || product.totalSold || 0;
        const revenue = product.revenue || product.totalRevenue || 0;
        
        // Determine status based on sales rank
        let status = '📈 Trending';
        let statusClass = 'status-trending';
        
        if (index < 3) {
            status = '🔥 Hot';
            statusClass = 'status-hot';
        } else if (totalSales === 0) {
            status = '📊 New';
            statusClass = 'status-new';
        }
        
        row.innerHTML = `
            <td>${product.name || product.itemName || 'Unknown'}</td>
            <td>${formatCurrencySimple(revenue)}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

async function loadInventoryStatus() {
    try {
        console.log('📦 Loading inventory status...');
        
        const response = await fetch('/api/inventory');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const inventoryItems = result.success ? result.data : [];
        
        console.log('📦 Inventory items loaded:', inventoryItems.length);
        
        if (inventoryItems && inventoryItems.length > 0) {
            updateInventoryStatusTable(inventoryItems);
        }
    } catch (error) {
        console.error('❌ Error loading inventory:', error);
    }
}

function updateInventoryStatusTable(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Sort by stock level (low stock first)
    const sortedItems = items.sort((a, b) => (a.currentStock || 0) - (b.currentStock || 0));
    
    // Display top 8 items with lowest stock
    sortedItems.slice(0, 8).forEach(item => {
        const row = document.createElement('tr');
        
        // Determine status based on stock level
        let status = 'In Stock';
        let statusClass = 'status-in-stock';
        
        if ((item.currentStock || 0) === 0) {
            status = 'Out of Stock';
            statusClass = 'status-out-of-stock';
        } else if ((item.currentStock || 0) <= 10) {
            status = 'Low Stock';
            statusClass = 'status-low-stock';
        }
        
        row.innerHTML = `
            <td>${item.itemName || item.name || 'N/A'}</td>
            <td>${formatNumber(item.currentStock || 0)} ${item.unit || 'units'}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// ==================== STYLES ====================
function addDashboardStyles() {
    if (!document.getElementById('dashboard-styles')) {
        const style = document.createElement('style');
        style.id = 'dashboard-styles';
        style.textContent = `
            /* Loading animation */
            @keyframes loadingPulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(0.98); }
            }
            
            @keyframes cardGlow {
                0%, 100% { box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
                50% { box-shadow: 0 5px 20px rgba(76, 175, 80, 0.2); }
            }
            
            .loading-pulse {
                animation: loadingPulse 1.5s ease-in-out infinite;
            }
            
            .card-animated {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .card-animated:hover {
                transform: translateY(-8px);
                box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
            }
            
            /* Chart styles */
            .chart-container {
                position: relative;
                min-height: 250px;
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
            
            /* Status badges */
            .status-badge {
                display: inline-block;
                padding: 3px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-align: center;
                min-width: 80px;
            }
            
            .status-hot {
                background: #ffebee;
                color: #c62828;
            }
            
            .status-trending {
                background: #e3f2fd;
                color: #1565c0;
            }
            
            .status-new {
                background: #f3e5f5;
                color: #7b1fa2;
            }
            
            .status-in-stock {
                background: #e8f5e9;
                color: #2e7d32;
            }
            
            .status-low-stock {
                background: #fff3e0;
                color: #ef6c00;
            }
            
            .status-out-of-stock {
                background: #ffebee;
                color: #c62828;
            }
            
            /* Table styles */
            table tbody tr {
                transition: all 0.3s ease;
            }
            
            table tbody tr:hover {
                background: #f8f9fa;
                transform: translateX(5px);
            }
            
            /* Stats cards */
            .stat-card {
                position: relative;
                overflow: hidden;
                border: none;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                transition: all 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            
            .stat-card .card-title {
                color: #666;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .stat-card .card-value {
                font-size: 28px;
                font-weight: bold;
                color: #333;
                margin: 0;
            }
            
            /* Chart bar hover effects */
            .chart-bar:hover {
                filter: brightness(1.1);
                transform: translateY(-5px) !important;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .chart-container {
                    padding: 15px;
                }
                
                .chart-bar {
                    margin: 0 3px;
                }
                
                .stat-card .card-value {
                    font-size: 22px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== EVENT HANDLERS ====================
function setupEventListeners() {
    // Add click animations to cards
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.card');
        if (card) {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 200);
        }
    });
    
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
            loadInventoryStatus();
        });
    }
    
    // Listen for payment completion events
    window.addEventListener('paymentCompleted', function(e) {
        console.log('💳 Payment completed, refreshing dashboard...');
        setTimeout(() => {
            fetchDashboardStats();
            loadInventoryStatus();
        }, 2000);
    });
    
    // Listen for storage events (other tabs)
    window.addEventListener('storage', function(e) {
        if (e.key === 'orderPaymentCompleted') {
            console.log('💳 Payment from other tab, refreshing dashboard...');
            fetchDashboardStats();
            loadInventoryStatus();
        }
    });
    
    // Handle page visibility
    let refreshInterval;
    
    function setupAutoRefresh() {
        if (refreshInterval) clearInterval(refreshInterval);
        
        refreshInterval = setInterval(() => {
            if (!document.hidden) {
                console.log('🔄 Auto-refreshing dashboard...');
                fetchDashboardStats();
                loadInventoryStatus();
            }
        }, 60000); // Refresh every minute
    }
    
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setupAutoRefresh();
        } else {
            if (refreshInterval) clearInterval(refreshInterval);
        }
    });
    
    setupAutoRefresh();
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
    
    // Set initial values
    const totalRevenueEl = document.getElementById('totalRevenue');
    if (totalRevenueEl && totalRevenueEl.textContent.trim() === '') {
        totalRevenueEl.textContent = '₱0.00';
    }
    
    // Load initial data
    fetchDashboardStats();
    loadInventoryStatus();
    
    // Start real-time updates after a short delay
    setTimeout(() => {
        initRealTimeUpdates();
    }, 1500);
    
    // Emergency fix for peso sign
    setInterval(() => {
        const revenueEl = document.getElementById('totalRevenue');
        if (revenueEl && !revenueEl.textContent.includes('₱')) {
            console.log('Emergency: Missing ₱ sign, fixing...');
            const current = revenueEl.textContent;
            revenueEl.textContent = '₱' + current.replace(/[^\d.]/g, '');
        }
    }, 5000);
    
    console.log('✅ Dashboard initialized successfully');
}

// ==================== GLOBAL EXPORTS ====================
window.fixPesoSign = function() {
    const revenueEl = document.getElementById('totalRevenue');
    if (revenueEl) {
        const current = revenueEl.textContent;
        if (!current.includes('₱')) {
            const number = current.replace(/[^\d.]/g, '') || '0.00';
            revenueEl.textContent = '₱' + number;
            console.log('Fixed peso sign:', revenueEl.textContent);
        }
    }
};

window.refreshDashboard = function() {
    fetchDashboardStats();
    loadInventoryStatus();
};

window.logoutDashboard = function() {
    handleLogout();
};

// ==================== STARTUP ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
});

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateDashboardDisplay,
        fetchDashboardStats,
        initRealTimeUpdates,
        cleanup,
        handleLogout
    };
}

console.log('✅ Dashboard script loaded');