let dashboardStats = {
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalInventoryItems: 0,
    inventoryLowStock: 0,
    inventoryOutOfStock: 0,
    totalMenuItems: 0,
    inventoryItems: [] // Make sure this exists
};

// ... (keep all other variables and helper functions the same) ...

// Dashboard functions
async function fetchDashboardStats() {
    try {
        console.log('Fetching dashboard stats...');

        const response = await fetch('/api/dashboard/stats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            dashboardStats = data.data;
            updateDashboardDisplay();
            console.log('Dashboard stats updated:', dashboardStats);
            
            // If inventory items are not in the stats, fetch them separately
            if (!dashboardStats.inventoryItems || dashboardStats.inventoryItems.length === 0) {
                console.log('Fetching inventory items separately...');
                await fetchInventoryItems();
            }
        } else {
            throw new Error(data.message || 'Failed to fetch dashboard stats');
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// NEW FUNCTION: Fetch inventory items separately
async function fetchInventoryItems() {
    try {
        console.log('Fetching inventory items...');
        
        const response = await fetch('/api/inventory', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            dashboardStats.inventoryItems = data.data;
            dashboardStats.totalInventoryItems = data.data.length;
            
            // Update the inventory display
            updateInventoryDashboard();
            
            // Also update the total inventory count in the stat card
            const totalInventoryEl = document.getElementById('totalInventory');
            if (totalInventoryEl) {
                totalInventoryEl.textContent = formatNumber(dashboardStats.totalInventoryItems);
            }
            
            console.log('Inventory items loaded:', dashboardStats.inventoryItems.length);
        } else {
            throw new Error(data.message || 'Failed to fetch inventory items');
        }
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        // Don't show toast to avoid spamming, just log it
    }
}

// UPDATED: Inventory dashboard function - now shows real items
function updateInventoryDashboard() {
    console.log('📦 Updating inventory dashboard...');
    
    // Get the tbody from inventory table
    const inventoryTableBody = document.querySelector('.inventory-table tbody');
    if (!inventoryTableBody) {
        console.log('❌ Inventory table body not found');
        return;
    }
    
    // Clear table
    inventoryTableBody.innerHTML = '';
    
    // Update the "Updated X:XX PM" text
    const updatedTimeElement = document.querySelector('.updated-time');
    if (updatedTimeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        updatedTimeElement.textContent = `Updated ${timeString}`;
    }
    
    // Check if we have inventory data
    if (!dashboardStats.inventoryItems || dashboardStats.inventoryItems.length === 0) {
        console.log('No inventory items data available');
        
        // Try to fetch inventory data if not available
        fetchInventoryItems().then(() => {
            // After fetching, update the display again
            setTimeout(updateInventoryDashboard, 500);
        });
        
        // Show loading message
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" class="empty-message">Loading inventory...</td>';
        inventoryTableBody.appendChild(row);
        return;
    }
    
    // Get actual inventory items
    const inventoryItems = dashboardStats.inventoryItems;
    console.log('Inventory items to display:', inventoryItems);
    
    if (inventoryItems.length > 0) {
        // Sort by stock level (lowest first to show critical items first)
        const sortedItems = [...inventoryItems].sort((a, b) => {
            const stockA = a.currentStock || a.quantity || a.stock || 0;
            const stockB = b.currentStock || b.quantity || b.stock || 0;
            return stockA - stockB;
        });
        
        // Display actual inventory items
        sortedItems.slice(0, 8).forEach(item => {
            console.log('Displaying item:', item);
            
            // Get item name - try different property names
            let itemName = 'Unknown Item';
            if (item.itemName) itemName = item.itemName;
            else if (item.name) itemName = item.name;
            else if (item.productName) itemName = item.productName;
            else if (item.product) itemName = item.product;
            else if (item.title) itemName = item.title;
            
            // Get stock quantity - try different property names
            let stockQuantity = 0;
            if (item.currentStock !== undefined) stockQuantity = item.currentStock;
            else if (item.quantity !== undefined) stockQuantity = item.quantity;
            else if (item.stock !== undefined) stockQuantity = item.stock;
            else if (item.stockQuantity !== undefined) stockQuantity = item.stockQuantity;
            
            // Get unit - try different property names
            let unit = 'units';
            if (item.unit) unit = item.unit;
            else if (item.measurementUnit) unit = item.measurementUnit;
            else if (item.uom) unit = item.uom;
            else if (item.unitOfMeasure) unit = item.unitOfMeasure;
            
            // Determine status
            let status = 'In Stock';
            let statusClass = 'status-in-stock';
            
            if (stockQuantity === 0) {
                status = 'Out of Stock';
                statusClass = 'status-out-of-stock';
            } else if (item.reorderLevel && stockQuantity <= item.reorderLevel) {
                status = 'Low Stock';
                statusClass = 'status-low-stock';
            } else if (stockQuantity <= 10) { // Default low stock threshold
                status = 'Low Stock';
                statusClass = 'status-low-stock';
            }
            
            // Create table row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${itemName}</td>
                <td>${stockQuantity} ${unit}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
            `;
            inventoryTableBody.appendChild(row);
        });
    } else {
        // No inventory items
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" class="empty-message">No inventory items found</td>';
        inventoryTableBody.appendChild(row);
    }
    
    console.log('✅ Inventory dashboard updated');
}

// UPDATED: Initialize page to fetch inventory separately
function initializePage() {
    const path = window.location.pathname;
    console.log('Initializing page for path:', path);
    
    // Setup menu update listener
    setupMenuUpdateListener();
    
    // Dashboard page
    if (path === '/' || path.includes('dashboard')) {
        console.log('Loading dashboard...');
        
        // Initial data load
        fetchDashboardStats();
        fetchInventoryItems(); // Fetch inventory separately
        updateMenuItemsCount();
        loadOrders();
        
        // Refresh data periodically
        setInterval(() => {
            fetchDashboardStats();
            fetchInventoryItems(); // Refresh inventory too
            updateMenuItemsCount();
            loadOrders();
        }, 30000);
        
        // Setup payment update listener
        setupPaymentListener();
    }
}

// ... (keep all other functions the same) ...

// Expose fetchInventoryItems to window
window.fetchInventoryItems = fetchInventoryItems;