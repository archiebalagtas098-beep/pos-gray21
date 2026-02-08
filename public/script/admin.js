// ============================================
// ELEMENT SELECTORS
// ============================================

// Main content container
let mainContent = document.querySelector('.main-content');

// Stats elements
let totalOrdersEl = document.getElementById('totalOrders');
let totalRevenueEl = document.getElementById('totalRevenue');
let totalCustomersEl = document.getElementById('totalCustomers');
let totalProductsEl = document.getElementById('totalProducts');
let totalMenuItemsEl = document.getElementById('totalMenuItems');

// Chart elements
let chartBarsEl = document.getElementById('chartBars');
let chartLabelsEl = document.getElementById('chartLabels');
let chartFooterEl = document.getElementById('chartFooter');
let chartSummaryEl = document.getElementById('chartSummary');

// Table bodies
let inventoryTableBody = document.getElementById('inventoryTableBody');
let todaysOrdersBody = document.getElementById('todaysOrdersBody');
let topItemsTableBody = document.getElementById('topItemsTableBody');

// Navigation
let dashboardMenu = document.querySelectorAll('.dashboard-menu a');
let menuSearch = document.getElementById('menuSearch');

// Global variables
let eventSource = null;
let statsRefreshInterval = null;
let currentStats = {};
let isConnected = false;

// ============================================
// CORE FETCH FUNCTIONS - DASHBOARD
// ============================================

/**
 * Fetch dashboard statistics from API
 */
async function fetchDashboardStats() {
    try {
        let token = getToken();
        let response = await fetch('/api/admin/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            let errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        let stats = await response.json();
        currentStats = stats; // Store globally
        updateStatsDisplay(stats);
        return stats;
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        showToast('Failed to load dashboard statistics', 'error');
        return null;
    }
}

/**
 * Update dashboard stats display elements
 */
function updateStatsDisplay(stats) {
    if (totalOrdersEl && stats.totalOrders !== undefined) {
        totalOrdersEl.textContent = stats.totalOrders;
    }
    
    if (totalRevenueEl && stats.totalRevenue !== undefined) {
        totalRevenueEl.textContent = '₱' + (stats.totalRevenue || 0).toFixed(2);
    }
    
    if (totalCustomersEl && stats.totalCustomers !== undefined) {
        totalCustomersEl.textContent = stats.totalCustomers;
    }
    
    if (totalProductsEl && stats.totalInventoryItems !== undefined) {
        totalProductsEl.textContent = stats.totalInventoryItems;
    }
    
    if (totalMenuItemsEl && stats.totalMenuItems !== undefined) {
        totalMenuItemsEl.textContent = stats.totalMenuItems;
    }
}

/**
 * Fetch today's orders
 */
async function fetchTodaysOrders() {
    try {
        let today = new Date().toISOString().split('T')[0];
        let response = await fetch(`/api/admin/orders/today?date=${today}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let orders = await response.json();
        populateTodaysOrders(orders);
        return orders;
    } catch (error) {
        console.error('Failed to fetch today\'s orders:', error);
        showToast('Failed to load today\'s orders', 'error');
        return [];
    }
}

/**
 * Fetch inventory status
 */
async function fetchInventoryStatus() {
    try {
        let response = await fetch('/api/admin/inventory/status', {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let inventory = await response.json();
        populateInventoryTable(inventory);
        return inventory;
    } catch (error) {
        console.error('Failed to fetch inventory:', error);
        showToast('Failed to load inventory data', 'error');
        return [];
    }
}

/**
 * Fetch top selling items
 */
async function fetchTopSellingItems() {
    try {
        let response = await fetch('/api/admin/analytics/top-items', {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let topItems = await response.json();
        populateTopItemsTable(topItems);
        return topItems;
    } catch (error) {
        console.error('Failed to fetch top items:', error);
        showToast('Failed to load top selling items', 'error');
        return [];
    }
}

/**
 * Fetch sales chart data
 */
async function fetchSalesChartData(period = 'today') {
    try {
        let response = await fetch(`/api/admin/analytics/sales?period=${period}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let chartData = await response.json();
        renderSalesChart(chartData, period);
        return chartData;
    } catch (error) {
        console.error('Failed to fetch chart data:', error);
        showToast('Failed to load sales chart', 'error');
        return null;
    }
}

// ============================================
// INVENTORY FETCH FUNCTIONS
// ============================================

/**
 * Fetch all inventory items
 */
async function fetchAllInventory() {
    try {
        let response = await fetch('/api/admin/inventory', {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let inventory = await response.json();
        return inventory;
    } catch (error) {
        console.error('Failed to fetch inventory:', error);
        showToast('Failed to load inventory', 'error');
        return [];
    }
}

/**
 * Add new inventory item
 */
async function addInventoryItem(itemData) {
    try {
        let response = await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let result = await response.json();
        showToast('Inventory item added successfully', 'success');
        
        // Refresh inventory status on dashboard
        fetchInventoryStatus();
        
        return result;
    } catch (error) {
        console.error('Failed to add inventory item:', error);
        showToast('Failed to add inventory item', 'error');
        return null;
    }
}

/**
 * Update inventory item
 */
async function updateInventoryItem(itemId, updateData) {
    try {
        let response = await fetch(`/api/admin/inventory/${itemId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let result = await response.json();
        showToast('Inventory updated successfully', 'success');
        
        // Refresh inventory status on dashboard
        fetchInventoryStatus();
        
        return result;
    } catch (error) {
        console.error('Failed to update inventory:', error);
        showToast('Failed to update inventory', 'error');
        return null;
    }
}

/**
 * Delete inventory item
 */
async function deleteInventoryItem(itemId) {
    try {
        let response = await fetch(`/api/admin/inventory/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showToast('Inventory item deleted successfully', 'success');
        
        // Refresh inventory status on dashboard
        fetchInventoryStatus();
        
        return true;
    } catch (error) {
        console.error('Failed to delete inventory item:', error);
        showToast('Failed to delete inventory item', 'error');
        return false;
    }
}

// ============================================
// MENU MANAGEMENT FETCH FUNCTIONS
// ============================================

/**
 * Fetch all menu items
 */
async function fetchAllMenuItems() {
    try {
        let response = await fetch('/api/admin/menu', {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let menuItems = await response.json();
        return menuItems;
    } catch (error) {
        console.error('Failed to fetch menu items:', error);
        showToast('Failed to load menu items', 'error');
        return [];
    }
}

/**
 * Add new menu item
 */
async function addMenuItem(menuData) {
    try {
        // Handle image upload if present
        let formData = new FormData();
        
        // Add all menu data to formData
        for (let key in menuData) {
            if (key === 'image' && menuData[key] instanceof File) {
                formData.append('image', menuData[key]);
            } else {
                formData.append(key, menuData[key]);
            }
        }
        
        let response = await fetch('/api/admin/menu', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let result = await response.json();
        showToast('Menu item added successfully', 'success');
        
        // Update menu count on dashboard
        fetchDashboardStats();
        
        return result;
    } catch (error) {
        console.error('Failed to add menu item:', error);
        showToast('Failed to add menu item', 'error');
        return null;
    }
}

/**
 * Update menu item
 */
async function updateMenuItem(itemId, updateData) {
    try {
        let formData = new FormData();
        
        // Add all update data to formData
        for (let key in updateData) {
            if (key === 'image' && updateData[key] instanceof File) {
                formData.append('image', updateData[key]);
            } else {
                formData.append(key, updateData[key]);
            }
        }
        
        let response = await fetch(`/api/admin/menu/${itemId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let result = await response.json();
        showToast('Menu item updated successfully', 'success');
        return result;
    } catch (error) {
        console.error('Failed to update menu item:', error);
        showToast('Failed to update menu item', 'error');
        return null;
    }
}

/**
 * Delete menu item
 */
async function deleteMenuItem(itemId) {
    try {
        let response = await fetch(`/api/admin/menu/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showToast('Menu item deleted successfully', 'success');
        
        // Update menu count on dashboard
        fetchDashboardStats();
        
        return true;
    } catch (error) {
        console.error('Failed to delete menu item:', error);
        showToast('Failed to delete menu item', 'error');
        return false;
    }
}

// ============================================
// STAFF MANAGEMENT FETCH FUNCTIONS
// ============================================

/**
 * Fetch all staff members
 */
async function fetchAllStaff() {
    try {
        let response = await fetch('/api/admin/staff', {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let staff = await response.json();
        return staff;
    } catch (error) {
        console.error('Failed to fetch staff:', error);
        showToast('Failed to load staff data', 'error');
        return [];
    }
}

/**
 * Add new staff member
 */
async function addStaff(staffData) {
    try {
        let response = await fetch('/api/admin/staff', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(staffData)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let result = await response.json();
        showToast('Staff member added successfully', 'success');
        
        // Send welcome email
        if (staffData.sendWelcomeEmail) {
            sendWelcomeEmail(staffData.email, result.temporaryPassword);
        }
        
        return result;
    } catch (error) {
        console.error('Failed to add staff member:', error);
        showToast('Failed to add staff member', 'error');
        return null;
    }
}

/**
 * Update staff member
 */
async function updateStaff(staffId, updateData) {
    try {
        let response = await fetch(`/api/admin/staff/${staffId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let result = await response.json();
        showToast('Staff member updated successfully', 'success');
        return result;
    } catch (error) {
        console.error('Failed to update staff member:', error);
        showToast('Failed to update staff member', 'error');
        return null;
    }
}

/**
 * Delete staff member
 */
async function deleteStaff(staffId) {
    try {
        let response = await fetch(`/api/admin/staff/${staffId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showToast('Staff member deleted successfully', 'success');
        return true;
    } catch (error) {
        console.error('Failed to delete staff member:', error);
        showToast('Failed to delete staff member', 'error');
        return false;
    }
}

// ============================================
// SALES REPORTS FETCH FUNCTIONS
// ============================================

/**
 * Generate sales report with total revenue calculation
 */
async function generateSalesReport(startDate, endDate, reportType = 'daily') {
    try {
        let params = new URLSearchParams({
            startDate: startDate,
            endDate: endDate,
            type: reportType
        });
        
        let response = await fetch(`/api/admin/reports/sales?${params}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let reportData = await response.json();
        
        // Calculate total revenue from report data
        let totalRevenue = calculateTotalRevenueFromReport(reportData);
        
        // Add total revenue to report data
        reportData.totalRevenue = totalRevenue;
        
        return reportData;
    } catch (error) {
        console.error('Failed to generate sales report:', error);
        showToast('Failed to generate sales report', 'error');
        return null;
    }
}

/**
 * Calculate total revenue from sales report data
 */
function calculateTotalRevenueFromReport(reportData) {
    let totalRevenue = 0;
    
    if (reportData.dailySales && Array.isArray(reportData.dailySales)) {
        // For daily sales report
        reportData.dailySales.forEach(day => {
            totalRevenue += day.revenue || 0;
        });
    } else if (reportData.orders && Array.isArray(reportData.orders)) {
        // For detailed orders report
        reportData.orders.forEach(order => {
            totalRevenue += order.total || 0;
        });
    } else if (reportData.categories && Array.isArray(reportData.categories)) {
        // For category-wise report
        reportData.categories.forEach(category => {
            totalRevenue += category.revenue || 0;
        });
    }
    
    return totalRevenue;
}

/**
 * Export sales report
 */
async function exportSalesReport(reportData, format = 'pdf') {
    try {
        let response = await fetch('/api/admin/reports/export', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: reportData,
                format: format
            })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        // Handle file download
        let blob = await response.blob();
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = `sales_report_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('Report exported successfully', 'success');
        return true;
    } catch (error) {
        console.error('Failed to export report:', error);
        showToast('Failed to export report', 'error');
        return false;
    }
}

// ============================================
// ORDER COMPLETION FUNCTIONS
// ============================================

/**
 * Mark order as completed
 */
async function completeOrder(orderId) {
    try {
        let response = await fetch(`/api/admin/orders/${orderId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completedAt: new Date().toISOString()
            })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let result = await response.json();
        
        // Update dashboard stats
        await updateStatsAfterOrderCompletion(orderId);
        
        // Refresh today's orders
        fetchTodaysOrders();
        
        showToast('Order marked as completed', 'success');
        return result;
    } catch (error) {
        console.error('Failed to complete order:', error);
        showToast('Failed to complete order', 'error');
        return null;
    }
}

/**
 * Update dashboard stats after order completion
 */
async function updateStatsAfterOrderCompletion(orderId) {
    try {
        // Fetch updated order details
        let orderResponse = await fetch(`/api/admin/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!orderResponse.ok) return;
        
        let order = await orderResponse.json();
        
        // Update dashboard stats
        if (totalOrdersEl) {
            let currentOrders = parseInt(totalOrdersEl.textContent) || 0;
            totalOrdersEl.textContent = currentOrders + 1;
        }
        
        if (totalRevenueEl && order.total) {
            let currentRevenueText = totalRevenueEl.textContent.replace('₱', '');
            let currentRevenue = parseFloat(currentRevenueText) || 0;
            let newRevenue = currentRevenue + order.total;
            totalRevenueEl.textContent = '₱' + newRevenue.toFixed(2);
        }
        
        // Update currentStats object
        if (currentStats.totalOrders) currentStats.totalOrders++;
        if (currentStats.totalRevenue) currentStats.totalRevenue += order.total;
        
        // Update sales chart if visible
        if (chartBarsEl) {
            fetchSalesChartData('today');
        }
        
    } catch (error) {
        console.error('Error updating stats after order completion:', error);
    }
}

// ============================================
// REAL-TIME ORDER UPDATES
// ============================================

/**
 * Handle order status change from real-time events
 */
function handleOrderStatusChange(orderData) {
    if (orderData.status === 'completed') {
        // Update dashboard stats
        if (totalOrdersEl) {
            let currentOrders = parseInt(totalOrdersEl.textContent) || 0;
            totalOrdersEl.textContent = currentOrders + 1;
        }
        
        if (totalRevenueEl && orderData.total) {
            let currentRevenueText = totalRevenueEl.textContent.replace('₱', '');
            let currentRevenue = parseFloat(currentRevenueText) || 0;
            let newRevenue = currentRevenue + orderData.total;
            totalRevenueEl.textContent = '₱' + newRevenue.toFixed(2);
        }
        
        // Remove from today's orders if present
        removeOrderFromTodayOrders(orderData.id);
        
        // Update sales chart
        updateSalesChartWithNewOrder(orderData);
    }
}

/**
 * Remove completed order from today's orders table
 */
function removeOrderFromTodayOrders(orderId) {
    if (todaysOrdersBody) {
        let rows = todaysOrdersBody.querySelectorAll('tr');
        rows.forEach(row => {
            let orderNumberCell = row.querySelector('td:first-child');
            if (orderNumberCell && orderNumberCell.textContent.includes(orderId.toString())) {
                row.remove();
            }
        });
    }
}

/**
 * Update sales chart with new order
 */
function updateSalesChartWithNewOrder(order) {
    // This would update the chart data with the new order amount
    // For now, we'll refresh the chart data
    fetchSalesChartData('today');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get authentication token from cookie
 */
function getToken() {
    let cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        let [name, value] = cookie.trim().split('=');
        if (name === 'token') {
            return value;
        }
    }
    return null;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Check if toast container exists, create if not
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    let toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 10px;">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize dashboard
 */
async function initializeDashboard() {
    try {
        // Load all dashboard data
        await Promise.all([
            fetchDashboardStats(),
            fetchTodaysOrders(),
            fetchInventoryStatus(),
            fetchTopSellingItems(),
            fetchSalesChartData('today')
        ]);
        
        // Initialize real-time updates
        initializeRealTimeUpdates();
        
        // Set up periodic refresh for stats (every 5 minutes)
        statsRefreshInterval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
        
        showToast('Dashboard loaded successfully', 'success');
        
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (eventSource) {
        eventSource.close();
    }
    if (statsRefreshInterval) {
        clearInterval(statsRefreshInterval);
    }
});