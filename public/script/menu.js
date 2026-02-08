// ==================== GLOBAL VARIABLES ====================
let allMenuItems = [];
let notifications = [];
let notificationCount = 0;
let isNotificationModalOpen = false;
let hasNewNotifications = false;
let currentSection = 'dashboard';
let currentCategory = 'all';
let isModalOpen = false;
let retryCount = 0;
const MAX_RETRIES = 3;

// Menu Database - Keep this section exactly as is
const menuDatabase = {
    'Rice': [
        { name: 'Korean Spicy Bulgogi (Pork)', unit: 'plate', defaultPrice: 180 },
        { name: 'Korean Salt and Pepper (Pork)', unit: 'plate', defaultPrice: 175 },
        { name: 'Crisky Pork Lechon Kawali', unit: 'plate', defaultPrice: 165 },
        { name: 'Cream Dory Fish Fillet', unit: 'plate', defaultPrice: 160 },
        { name: 'Buttered Honey Chicken', unit: 'plate', defaultPrice: 155 },
        { name: 'Buttered Spicy Chicken', unit: 'plate', defaultPrice: 155 },
        { name: 'Chicken Adobo', unit: 'plate', defaultPrice: 145 },
        { name: 'Pork Shanghai', unit: 'plate', defaultPrice: 140 }
    ],
    'Sizzling': [
        { name: 'Sizzling Pork Sisig', unit: 'sizzling plate', defaultPrice: 220 },
        { name: 'Sizzling Liempo', unit: 'sizzling plate', defaultPrice: 210 },
        { name: 'Sizzling Porkchop', unit: 'sizzling plate', defaultPrice: 195 },
        { name: 'Sizzling Fried Chicken', unit: 'sizzling plate', defaultPrice: 185 }
    ],
    'Party': [
        { name: 'Pancit Bihon (S)', unit: 'tray', defaultPrice: 350 },
        { name: 'Pancit Bihon (M)', unit: 'tray', defaultPrice: 550 },
        { name: 'Pancit Bihon (L)', unit: 'tray', defaultPrice: 750 },
        { name: 'Pancit Canton (S)', unit: 'tray', defaultPrice: 380 },
        { name: 'Pancit Canton (M)', unit: 'tray', defaultPrice: 580 },
        { name: 'Pancit Canton (L)', unit: 'tray', defaultPrice: 780 },
        { name: 'Spaghetti (S)', unit: 'tray', defaultPrice: 400 },
        { name: 'Spaghetti (M)', unit: 'tray', defaultPrice: 600 },
        { name: 'Spaghetti (L)', unit: 'tray', defaultPrice: 800 }
    ],
    'Drink': [
        { name: 'Cucumber Lemonade (Glass)', unit: 'glass', defaultPrice: 60 },
        { name: 'Cucumber Lemonade (Pitcher)', unit: 'pitcher', defaultPrice: 180 },
        { name: 'Blue Lemonade (Glass)', unit: 'glass', defaultPrice: 65 },
        { name: 'Blue Lemonade (Pitcher)', unit: 'pitcher', defaultPrice: 190 },
        { name: 'Red Tea (Glass)', unit: 'glass', defaultPrice: 55 },
        { name: 'Soda (Mismo)', unit: 'bottle', defaultPrice: 25 },
        { name: 'Soda 1.5L', unit: 'bottle', defaultPrice: 65 }
    ],
    'Cafe': [
        { name: 'Cafe Americano Tall', unit: 'cup', defaultPrice: 80 },
        { name: 'Cafe Americano Grande', unit: 'cup', defaultPrice: 95 },
        { name: 'Cafe Latte Tall', unit: 'cup', defaultPrice: 90 },
        { name: 'Cafe Latte Grande', unit: 'cup', defaultPrice: 105 },
        { name: 'Caramel Macchiato Tall', unit: 'cup', defaultPrice: 100 },
        { name: 'Caramel Macchiato Grande', unit: 'cup', defaultPrice: 115 }
    ],
    'Milk': [
        { name: 'Milk Tea Regular HC', unit: 'cup', defaultPrice: 85 },
        { name: 'Milk Tea Regular MC', unit: 'cup', defaultPrice: 95 },
        { name: 'Matcha Green Tea HC', unit: 'cup', defaultPrice: 90 },
        { name: 'Matcha Green Tea MC', unit: 'cup', defaultPrice: 100 }
    ],
    'Frappe': [
        { name: 'Matcha Green Tea HC', unit: 'cup', defaultPrice: 120 },
        { name: 'Matcha Green Tea MC', unit: 'cup', defaultPrice: 135 },
        { name: 'Cookies & Cream HC', unit: 'cup', defaultPrice: 125 },
        { name: 'Cookies & Cream MC', unit: 'cup', defaultPrice: 140 },
        { name: 'Strawberry & Cream HC', unit: 'cup', defaultPrice: 130 },
        { name: 'Mango cheese cake HC', unit: 'cup', defaultPrice: 135 }
    ],
    'Snack & Appetizer': [
        { name: 'Cheesy Nachos', unit: 'serving', defaultPrice: 150 },
        { name: 'Nachos Supreme', unit: 'serving', defaultPrice: 180 },
        { name: 'French fries', unit: 'serving', defaultPrice: 90 },
        { name: 'Clubhouse Sandwich', unit: 'sandwich', defaultPrice: 120 },
        { name: 'Fish and Fries', unit: 'serving', defaultPrice: 160 },
        { name: 'Cheesy Dynamite Lumpia', unit: 'piece', defaultPrice: 25 },
        { name: 'Lumpiang Shanghai', unit: 'piece', defaultPrice: 20 }
    ],
    'Budget Meals Served with Rice': [
        { name: 'Fried Chicken', unit: 'meal', defaultPrice: 95 },
        { name: 'Buttered Honey Chicken', unit: 'meal', defaultPrice: 105 },
        { name: 'Buttered Spicy Chicken', unit: 'meal', defaultPrice: 105 },
        { name: 'Tinapa Rice', unit: 'meal', defaultPrice: 85 },
        { name: 'Tuyo Pesto', unit: 'meal', defaultPrice: 80 },
        { name: 'Fried Rice', unit: 'serving', defaultPrice: 50 },
        { name: 'Plain Rice', unit: 'bowl', defaultPrice: 25 }
    ],
    'Specialties': [
        { name: 'Sinigang (PORK)', unit: 'serving', defaultPrice: 280 },
        { name: 'Sinigang (Shrimp)', unit: 'serving', defaultPrice: 320 },
        { name: 'Paknet (Pakbet w/ Bagnet)', unit: 'serving', defaultPrice: 260 },
        { name: 'Buttered Shrimp', unit: 'serving', defaultPrice: 300 },
        { name: 'Special Bulalo (good for 2-3 Persons)', unit: 'pot', defaultPrice: 450 },
        { name: 'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)', unit: 'pot', defaultPrice: 850 }
    ],
    'packaging': [
        { name: 'Paper Cups (12oz)', unit: 'pack', defaultPrice: 250 },
        { name: 'Paper Cups (16oz)', unit: 'pack', defaultPrice: 280 },
        { name: 'Straws (Regular)', unit: 'pack', defaultPrice: 120 },
        { name: 'Straws (Boba)', unit: 'pack', defaultPrice: 150 },
        { name: 'Food Containers (Small)', unit: 'pack', defaultPrice: 180 },
        { name: 'Food Containers (Medium)', unit: 'pack', defaultPrice: 220 },
        { name: 'Food Containers (Large)', unit: 'pack', defaultPrice: 260 },
        { name: 'Plastic Utensils Set', unit: 'set', defaultPrice: 85 },
        { name: 'Napkins (Pack of 50)', unit: 'pack', defaultPrice: 75 }
    ]
};

// Category to display name mapping
const categoryDisplayNames = {
    'Rice': 'Rice Bowl Meals',
    'Sizzling': 'Hot Sizzlers',
    'Party': 'Party Trays',
    'Drink': 'Drinks',
    'Cafe': 'Coffee',
    'Milk': 'Milk Tea',
    'Frappe': 'Frappe',
    'Snack & Appetizer': 'Snacks & Appetizers',
    'Budget Meals Served with Rice': 'Budget Meals',
    'Specialties': 'Specialties',
    'packaging': 'Packaging'
};

// Category-specific units mapping
const categoryUnitsMapping = {
    'Rice': ['plate', 'serving'],
    'Sizzling': ['sizzling plate', 'plate'],
    'Party': ['tray'],
    'Drink': ['glass', 'cup', 'pitcher', 'bottle'],
    'Cafe': ['cup', 'glass'],
    'Milk': ['cup', 'glass'],
    'Frappe': ['cup', 'glass'],
    'Snack & Appetizer': ['serving', 'piece', 'sandwich'],
    'Budget Meals Served with Rice': ['meal', 'bowl'],
    'Specialties': ['serving', 'pot'],
    'packaging': ['pack', 'set', 'box', 'bag']
};

// Unit display labels
const unitDisplayLabels = {
    'plate': 'Plate',
    'plates': 'Plates',
    'sizzling plate': 'Sizzling Plate',
    'tray': 'Tray',
    'trays': 'Trays',
    'glass': 'Glass',
    'glasses': 'Glasses',
    'cup': 'Cup',
    'cups': 'Cups',
    'pitcher': 'Pitcher',
    'pitchers': 'Pitchers',
    'bottle': 'Bottle',
    'bottles': 'Bottles',
    'serving': 'Serving',
    'servings': 'Servings',
    'meal': 'Meal',
    'meals': 'Meals',
    'bowl': 'Bowl',
    'bowls': 'Bowls',
    'sandwich': 'Sandwich',
    'sandwiches': 'Sandwiches',
    'piece': 'Piece',
    'pieces': 'Pieces',
    'pot': 'Pot',
    'pots': 'Pots',
    'pack': 'Pack',
    'packs': 'Packs',
    'set': 'Set',
    'sets': 'Sets',
    'box': 'Box',
    'boxes': 'Boxes',
    'bag': 'Bag',
    'bags': 'Bags'
};

// ==================== DOM ELEMENTS CACHE ====================
const elements = {
    itemModal: document.getElementById('itemModal'),
    modalTitle: document.getElementById('modalTitle'),
    itemForm: document.getElementById('itemForm'),
    closeModal: document.getElementById('closeModal'),
    itemId: document.getElementById('itemId'),
    itemName: document.getElementById('itemName'),
    itemCategory: document.getElementById('itemCategories'),
    itemUnit: document.getElementById('itemUnit'),
    currentStock: document.getElementById('currentStock'),
    minimumStock: document.getElementById('minimumStock'),
    maximumStock: document.getElementById('maximumStock'),
    itemPrice: document.getElementById('itemPrice'),
    addNewItem: document.getElementById('addNewItem'),
    saveItemBtn: document.querySelector('.modal-footer .btn-primary'),
    cancelBtn: document.querySelector('.modal-footer .btn-secondary'),
    navLinks: document.querySelectorAll('.nav-link[data-section]'),
    categoryItems: document.querySelectorAll('.category-item[data-category]'),
    menuGrid: document.getElementById('menuGrid'),
    dashboardGrid: document.getElementById('dashboardGrid'),
    totalProducts: document.getElementById('totalProducts'),
    lowStock: document.getElementById('lowStock'),
    outOfStock: document.getElementById('outOfStock'),
    menuValue: document.getElementById('menuValue'),
    totalMenuItems: document.getElementById('totalMenuItems'),
    currentCategoryTitle: document.getElementById('currentCategoryTitle'),
    sendStockModal: document.getElementById('sendStockModal'),
    sendStockToStaffBtn: document.getElementById('sendStockToStaffBtn'),
    closeSendStockModal: document.getElementById('closeSendStockModal'),
    cancelSendStockBtn: document.getElementById('cancelSendStockBtn'),
    confirmSendStockBtn: document.getElementById('confirmSendStockBtn'),
    stockProduct: document.getElementById('stockProduct'),
    stockQuantity: document.getElementById('stockQuantity'),
    availableStock: document.getElementById('availableStock'),
    transferDate: document.getElementById('transferDate'),
    transferNotes: document.getElementById('transferNotes')
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Menu Management System initializing...');
    
    // Initialize notification system
    addNotificationStyles();
    initializeNotificationSystem();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize categories dropdown
    initializeCategoryDropdown();
    
    // Try to load from localStorage first
    loadFromLocalStorage();
    
    // Then try to fetch from API
    fetchMenuItems();
    
    // Set up auto-refresh
    setInterval(fetchMenuItems, 30000);
    
    console.log('✅ System initialized');
});

// ==================== LOAD FROM LOCALSTORAGE ====================
function loadFromLocalStorage() {
    try {
        const backup = localStorage.getItem('menuItems_backup');
        if (backup) {
            const parsedData = JSON.parse(backup);
            allMenuItems = Array.isArray(parsedData) ? parsedData : [];
            console.log('📦 Loaded from localStorage:', allMenuItems.length, 'items');
            
            // Update UI with localStorage data
            updateAllUIComponents();
            
            const lastUpdate = localStorage.getItem('menuItems_lastUpdate');
            if (lastUpdate) {
                const updateTime = new Date(lastUpdate).toLocaleString();
                console.log('📅 Last update from server:', updateTime);
            }
        } else {
            console.log('📭 No localStorage backup found');
            allMenuItems = [];
        }
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
        allMenuItems = [];
    }
}

// ==================== INITIALIZE CATEGORY DROPDOWN ====================
function initializeCategoryDropdown() {
    if (!elements.itemCategory) return;
    
    elements.itemCategory.innerHTML = '<option value="">Select Category</option>';
    
    Object.keys(categoryDisplayNames).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = categoryDisplayNames[category];
        elements.itemCategory.appendChild(option);
    });
}

// ==================== NOTIFICATION SYSTEM ====================
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc3545;
            color: white;
            font-size: 11px;
            font-weight: bold;
            border-radius: 50%;
            min-width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

    `;
    document.head.appendChild(style);
}

function initializeNotificationSystem() {
    // Create notification button in navbar if it doesn't exist
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.getElementById('notificationNavItem')) {
        const notificationNavItem = document.createElement('li');
        notificationNavItem.id = 'notificationNavItem';
        notificationNavItem.style.cssText = `position: relative; list-style: none;`;
        
        const notificationBtn = document.createElement('a');
        notificationBtn.href = '#';
        notificationBtn.className = 'nav-link';
        notificationBtn.innerHTML = `
            <span>Notifications</span>
            <span id="notificationBadge" class="notification-badge" style="display: none;">0</span>
        `;
        notificationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleNotificationModal();
        });
        
        notificationNavItem.appendChild(notificationBtn);
        navLinks.appendChild(notificationNavItem);
    }
    
    // Create notification container
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            width: 350px;
            max-height: 500px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #ddd;
        `;
        
        const notificationHeader = document.createElement('div');
        notificationHeader.style.cssText = `
            padding: 15px;
            background: #f8f9fa;
            border-bottom: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const headerTitle = document.createElement('h3');
        headerTitle.textContent = 'Notifications';
        headerTitle.style.cssText = `margin: 0; font-size: 16px; font-weight: 600; color: #333;`;
        
        const clearAllBtn = document.createElement('button');
        clearAllBtn.textContent = 'Clear All';
        clearAllBtn.style.cssText = `
            background: none;
            border: none;
            color: #dc3545;
            cursor: pointer;
            font-size: 14px;
            padding: 5px 10px;
            border-radius: 4px;
        `;
        clearAllBtn.addEventListener('click', clearAllNotifications);
        
        notificationHeader.appendChild(headerTitle);
        notificationHeader.appendChild(clearAllBtn);
        
        const notificationList = document.createElement('div');
        notificationList.id = 'notificationList';
        notificationList.style.cssText = `flex: 1; overflow-y: auto; max-height: 400px;`;
        
        const emptyState = document.createElement('div');
        emptyState.id = 'notificationEmptyState';
        emptyState.style.cssText = `padding: 30px 20px; text-align: center; color: #666;`;
        emptyState.innerHTML = `<div style="font-size: 48px; margin-bottom: 10px;">📭</div><p style="margin: 0;">No notifications yet</p>`;
        notificationList.appendChild(emptyState);
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
            padding: 10px;
            background: #f8f9fa;
            border: none;
            border-top: 1px solid #ddd;
            cursor: pointer;
            color: #333;
            font-size: 14px;
        `;
        closeBtn.addEventListener('click', toggleNotificationModal);
        
        notificationContainer.appendChild(notificationHeader);
        notificationContainer.appendChild(notificationList);
        notificationContainer.appendChild(closeBtn);
        
        document.body.appendChild(notificationContainer);
    }
}

function toggleNotificationModal() {
    const notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) return;
    
    if (isNotificationModalOpen) {
        notificationContainer.style.display = 'none';
        isNotificationModalOpen = false;
    } else {
        notificationContainer.style.display = 'flex';
        isNotificationModalOpen = true;
        hasNewNotifications = false;
        updateNotificationBadge();
        
        // Mark all notifications as read
        notifications.forEach(notification => {
            notification.read = true;
        });
        
        renderNotifications();
    }
}

function addNotification(productName, message) {
    const notification = {
        id: Date.now(),
        productName: productName,
        message: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        read: false
    };
    
    notifications.unshift(notification);
    hasNewNotifications = true;
    updateNotificationBadge();
    renderNotifications();
    
    showToast(`New notification: ${productName} is out of stock`, 'warning');
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    notificationCount = unreadCount;
    
    if (notificationCount > 0) {
        badge.textContent = notificationCount > 99 ? '99+' : notificationCount;
        badge.style.display = 'flex';
        
        if (hasNewNotifications && !isNotificationModalOpen) {
            badge.style.animation = 'pulse 1s infinite';
        } else {
            badge.style.animation = 'none';
        }
    } else {
        badge.style.display = 'none';
    }
}

function renderNotifications() {
    const notificationList = document.getElementById('notificationList');
    const emptyState = document.getElementById('notificationEmptyState');
    
    if (!notificationList) return;
    
    notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationList.appendChild(emptyState);
        return;
    }
    
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.style.cssText = `
            padding: 15px;
            border-bottom: 1px solid #eee;
            background: ${!notification.read ? '#fff8e1' : 'white'};
            cursor: pointer;
            transition: background 0.2s;
        `;
        
        notificationItem.addEventListener('click', () => {
            notification.read = true;
            updateNotificationBadge();
            renderNotifications();
        });
        
        const productName = document.createElement('div');
        productName.style.cssText = `font-weight: 600; color: #333; margin-bottom: 5px; font-size: 14px;`;
        productName.textContent = notification.productName;
        
        const message = document.createElement('div');
        message.style.cssText = `color: #666; font-size: 13px; margin-bottom: 5px;`;
        message.textContent = notification.message;
        
        const timestamp = document.createElement('div');
        timestamp.style.cssText = `color: #999; font-size: 12px; display: flex; justify-content: space-between;`;
        timestamp.innerHTML = `
            <span>${notification.date} ${notification.timestamp}</span>
            ${!notification.read ? '<span style="color: #ff9800;">●</span>' : ''}
        `;
        
        notificationItem.appendChild(productName);
        notificationItem.appendChild(message);
        notificationItem.appendChild(timestamp);
        
        notificationList.appendChild(notificationItem);
    });
}

function clearAllNotifications() {
    if (notifications.length === 0) return;
    
    if (confirm('Clear all notifications?')) {
        notifications = [];
        notificationCount = 0;
        hasNewNotifications = false;
        updateNotificationBadge();
        renderNotifications();
    }
}

function checkOutOfStockItems() {
    if (!allMenuItems || allMenuItems.length === 0) return;
    
    const outOfStockItems = allMenuItems.filter(item => item.currentStock === 0);
    
    outOfStockItems.forEach(item => {
        const recentNotification = notifications.find(n => 
            n.productName === (item.name || item.itemName) && 
            n.message.includes('out of stock') &&
            (Date.now() - n.id) < 3600000
        );
        
        if (!recentNotification) {
            addNotification(
                item.name || item.itemName,
                'Out of stock'
            );
        }
    });
}

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    console.log('🔌 Initializing event listeners...');
    
    // Add new item button
    if (elements.addNewItem) {
        elements.addNewItem.addEventListener('click', openAddModal);
        console.log('✅ Add new item button listener added');
    }
    
    // Save item button
    if (elements.saveItemBtn) {
        elements.saveItemBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await handleSaveItem();
        });
        console.log('✅ Save item button listener added');
    }
    
    // Cancel and close modal buttons
    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', closeModal);
    }
    
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeModal);
    }
    
    // Category change listener
    if (elements.itemCategory) {
        elements.itemCategory.addEventListener('change', updateFromCategory);
        console.log('✅ Category change listener added');
    }
    
    // Product name change listener
    if (elements.itemName) {
        elements.itemName.addEventListener('change', updateFromItemNameSelect);
        console.log('✅ Product name change listener added');
    }
    
    // Modal overlay click
    if (elements.itemModal) {
        elements.itemModal.addEventListener('click', (e) => {
            if (e.target === elements.itemModal) {
                closeModal();
            }
        });
    }
    
    // Form submit
    if (elements.itemForm) {
        elements.itemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSaveItem();
        });
    }
    
    // Navigation
    if (elements.navLinks && elements.navLinks.length > 0) {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                showSection(section);
            });
        });
        console.log('✅ Navigation listeners added');
    }
    
    // Category filter
    if (elements.categoryItems && elements.categoryItems.length > 0) {
        elements.categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.getAttribute('data-category');
                const fullname = item.getAttribute('data-fullname');
                filterByCategory(category, fullname);
            });
        });
        console.log('✅ Category filter listeners added');
    }
    
    // Send stock functionality
    if (elements.sendStockToStaffBtn) {
        elements.sendStockToStaffBtn.addEventListener('click', openSendStockModal);
    }
    
    if (elements.closeSendStockModal) {
        elements.closeSendStockModal.addEventListener('click', closeSendStockModal);
    }
    
    if (elements.cancelSendStockBtn) {
        elements.cancelSendStockBtn.addEventListener('click', closeSendStockModal);
    }
    
    if (elements.confirmSendStockBtn) {
        elements.confirmSendStockBtn.addEventListener('click', handleSendStock);
    }
    
    if (elements.stockProduct) {
        elements.stockProduct.addEventListener('change', updateStockTransferSummary);
    }
    
    if (elements.stockQuantity) {
        elements.stockQuantity.addEventListener('input', updateStockTransferSummary);
    }
    
    if (elements.transferDate) {
        const today = new Date().toISOString().split('T')[0];
        elements.transferDate.value = today;
        elements.transferDate.addEventListener('change', updateStockTransferSummary);
    }
    
    // Add send stock modal overlay click
    if (elements.sendStockModal) {
        elements.sendStockModal.addEventListener('click', (e) => {
            if (e.target === elements.sendStockModal) {
                closeSendStockModal();
            }
        });
    }
    
    // Add stock quantity validation
    if (elements.stockQuantity) {
        elements.stockQuantity.addEventListener('blur', function() {
            let value = parseInt(this.value) || 0;
            if (value < 1) {
                this.value = 1;
                updateStockTransferSummary();
            }
        });
    }
    
    // Add logout listener if exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        console.log('✅ Logout listener added');
    }
    
    console.log('✅ All event listeners initialized');
}

// ==================== HELPER FUNCTIONS ====================
function getUnitFromItem(itemName, category) {
    for (const cat in menuDatabase) {
        const foundItem = menuDatabase[cat].find(item => item.name === itemName);
        if (foundItem) {
            return foundItem.unit;
        }
    }
    
    const defaultUnits = {
        'Rice': 'plate',
        'Sizzling': 'sizzling plate',
        'Party': 'tray',
        'Drink': 'glass',
        'Cafe': 'cup',
        'Milk': 'cup',
        'Frappe': 'cup',
        'Snack & Appetizer': 'serving',
        'Budget Meals Served with Rice': 'meal',
        'Specialties': 'serving',
        'packaging': 'pack'
    };
    
    return defaultUnits[category] || 'unit';
}

function getDefaultPrice(itemName) {
    for (const category in menuDatabase) {
        const foundItem = menuDatabase[category].find(item => item.name === itemName);
        if (foundItem) {
            return foundItem.defaultPrice;
        }
    }
    return 0;
}

function getCategoryDisplayName(category) {
    return categoryDisplayNames[category] || category;
}

function populateItemNamesByCategory(category = null) {
    const itemNameSelect = elements.itemName;
    if (!itemNameSelect) return;
    
    itemNameSelect.innerHTML = '<option value="">Select Product</option>';
    
    if (!category) return;
    
    const categoryItems = menuDatabase[category] || [];
    const sortedItems = [...categoryItems].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        option.dataset.unit = item.unit;
        option.dataset.price = item.defaultPrice;
        itemNameSelect.appendChild(option);
    });
    
    console.log(`📋 Populated ${sortedItems.length} items for category: ${category}`);
}

function updateFromItemNameSelect() {
    const itemName = elements.itemName.value;
    const selectedOption = elements.itemName.options[elements.itemName.selectedIndex];
    
    if (!itemName || itemName.trim() === '') {
        if (elements.itemUnit) elements.itemUnit.value = '';
        if (elements.itemPrice) elements.itemPrice.value = '';
        return;
    }
    
    const unit = selectedOption.dataset.unit;
    const price = selectedOption.dataset.price;
    
    if (unit && elements.itemUnit) {
        elements.itemUnit.value = unit;
    }
    
    if (price && elements.itemPrice) {
        elements.itemPrice.value = price;
    }
}

function updateFromCategory() {
    const category = elements.itemCategory.value;
    
    if (!category) {
        if (elements.itemName) {
            elements.itemName.innerHTML = '<option value="">Select Product</option>';
        }
        if (elements.itemUnit) elements.itemUnit.value = '';
        if (elements.itemPrice) elements.itemPrice.value = '';
        return;
    }
    
    updateUnitOptions(category);
    populateItemNamesByCategory(category);
    
    if (elements.itemName) elements.itemName.value = '';
    if (elements.itemUnit) elements.itemUnit.value = '';
    if (elements.itemPrice) elements.itemPrice.value = '';
}

function updateUnitOptions(category) {
    const unitSelect = elements.itemUnit;
    if (!unitSelect) return;
    
    const availableUnits = categoryUnitsMapping[category] || ['pcs'];
    const currentUnit = unitSelect.value;
    
    unitSelect.innerHTML = '<option value="">Select Unit</option>';
    
    availableUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unitDisplayLabels[unit] || unit.charAt(0).toUpperCase() + unit.slice(1);
        unitSelect.appendChild(option);
    });
    
    if (currentUnit && availableUnits.includes(currentUnit)) {
        unitSelect.value = currentUnit;
    } else if (availableUnits.length > 0) {
        const defaultUnits = {
            'Rice': 'plate',
            'Sizzling': 'sizzling plate',
            'Party': 'tray',
            'Drink': 'glass',
            'Cafe': 'cup',
            'Milk': 'cup',
            'Frappe': 'cup',
            'Snack & Appetizer': 'serving',
            'Budget Meals Served with Rice': 'meal',
            'Specialties': 'serving',
            'packaging': 'pack'
        };
        
        unitSelect.value = defaultUnits[category] || availableUnits[0];
    }
}

function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107'};
        color: white;
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateX(100%);
        transition: opacity 0.3s, transform 0.3s;
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

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

// ==================== DELETE FUNCTION ====================
async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    const deleteBtn = event.target;
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = 'Deleting...';
    deleteBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/menu/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                showToast('Product deleted successfully!', 'success');
                
                // Remove from local array
                allMenuItems = allMenuItems.filter(item => item._id !== itemId);
                
                // Update UI
                updateAllUIComponents();
            } else {
                throw new Error(data.message);
            }
        } else {
            throw new Error(`Failed to delete: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        showToast('Failed to delete product. Please try again.', 'error');
    } finally {
        deleteBtn.textContent = originalText;
        deleteBtn.disabled = false;
    }
}

// ==================== UPDATED FETCH FUNCTION ====================
async function fetchMenuItems() {
    try {
        console.log('🔍 Fetching menu items from API...');
        
        const response = await fetch('/api/menu', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        console.log('📡 API Response status:', response.status);
        
        if (response.status === 401) {
            console.warn('⚠️ Unauthorized - using localStorage data only');
            return;
        }
        
        if (!response.ok) {
            console.warn(`⚠️ API error ${response.status} - using localStorage data`);
            return;
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('⚠️ Response is not JSON');
            return;
        }
        
        const data = await response.json();
        console.log('✅ API Response received');
        
        if (data.success) {
            allMenuItems = data.data || [];
            console.log(`✅ ${allMenuItems.length} items loaded from API`);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update all UI components
            updateAllUIComponents();
            
            retryCount = 0;
            
        } else {
            console.error('❌ API returned error:', data.message);
            showToast(data.message || 'Error loading data from server', 'error');
        }
        
    } catch (error) {
        console.error('❌ Error fetching menu items:', error);
        
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`🔄 Retrying fetch (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(fetchMenuItems, 2000 * retryCount);
        }
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('menuItems_backup', JSON.stringify(allMenuItems));
        localStorage.setItem('menuItems_lastUpdate', new Date().toISOString());
        console.log('💾 Saved to localStorage');
    } catch (error) {
        console.warn('⚠️ Could not save to localStorage:', error);
    }
}

// ==================== CORE FUNCTIONS ====================
function updateDashboardStats() {
    if (!allMenuItems || !Array.isArray(allMenuItems)) {
        console.warn('⚠️ allMenuItems is not an array or is empty');
        return;
    }
    
    const totalMenuItems = allMenuItems.length;
    
    const lowStockItems = allMenuItems.filter(item => {
        const currentStock = item.currentStock || 0;
        const minStock = item.minStock || 0;
        return currentStock > 0 && currentStock <= minStock;
    }).length;
    
    const outOfStockItems = allMenuItems.filter(item => {
        const currentStock = item.currentStock || 0;
        return currentStock === 0;
    }).length;
    
    const menuValueTotal = allMenuItems.reduce((total, item) => {
        const price = item.price || 0;
        const stock = item.currentStock || 0;
        return total + (price * stock);
    }, 0);
    
    // Update UI
    if (elements.totalMenuItems) {
        elements.totalMenuItems.textContent = formatNumber(totalMenuItems);
    }
    
    if (elements.lowStock) {
        elements.lowStock.textContent = formatNumber(lowStockItems);
    }
    
    if (elements.outOfStock) {
        elements.outOfStock.textContent = formatNumber(outOfStockItems);
    }
    
    if (elements.menuValue) {
        elements.menuValue.textContent = formatCurrency(menuValueTotal);
    }
    
    checkOutOfStockItems();
}

function showSection(section) {
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.classList.remove('active-section');
    });
    
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.add('active-section');
    }
    
    if (elements.navLinks && elements.navLinks.length > 0) {
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });
    }
    
    currentSection = section;
    
    if (section === 'dashboard') {
        updateDashboardStats();
        renderDashboardGrid();
    } else if (section === 'menu') {
        renderMenuGrid();
    } else if (section === 'viewstock') {
        loadPendingStockRequests();
    }
}

function filterByCategory(category, fullname) {
    currentCategory = category;
    
    if (elements.categoryItems && elements.categoryItems.length > 0) {
        elements.categoryItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-category') === category) {
                item.classList.add('active');
            }
        });
    }
    
    if (elements.currentCategoryTitle) {
        elements.currentCategoryTitle.textContent = fullname || 'Product Menu';
    }
    
    if (currentSection === 'menu') {
        renderMenuGrid();
    }
}

// ==================== RENDER MENU GRID ====================
function renderMenuGrid() {
    console.log('🎨 Rendering menu grid...');
    console.log('📊 Current category:', currentCategory);
    console.log('📦 Total items in allMenuItems:', allMenuItems ? allMenuItems.length : 0);
    
    if (!elements.menuGrid) {
        console.error('❌ menuGrid element not found');
        return;
    }
    
    if (!allMenuItems || !Array.isArray(allMenuItems) || allMenuItems.length === 0) {
        console.log('📭 No items to display');
        elements.menuGrid.innerHTML = `
            <div class="empty-state">
                <h3>No products found</h3>
                <p>Add products using the "Add New Product" button</p>
            </div>
        `;
        return;
    }
    
    let filteredItems = [...allMenuItems];
    
    if (currentCategory !== 'all') {
        filteredItems = allMenuItems.filter(item => item.category === currentCategory);
        console.log(`🔍 Filtered items for ${currentCategory}:`, filteredItems.length);
    }
    
    if (filteredItems.length === 0) {
        console.log('📭 No items to display for this category');
        elements.menuGrid.innerHTML = `
            <div class="empty-state">
                <h3>No products in this category</h3>
                <p>Add products to this category using the "Add New Product" button</p>
            </div>
        `;
        return;
    }
    
    console.log(`🎯 Rendering ${filteredItems.length} items`);
    
    const gridHTML = filteredItems.map(item => {
        const itemName = item.name || item.itemName || 'Unnamed Product';
        const itemPrice = item.price || 0;
        const currentStock = item.currentStock || 0;
        const maxStock = item.maxStock || 0;
        const minStock = item.minStock || 0;
        const unit = item.unit || '';
        const displayUnit = unitDisplayLabels[unit] || unit;
        
        const itemValue = itemPrice * currentStock;
        const stockPercentage = maxStock > 0 ? ((currentStock / maxStock) * 100) : 0;
        
        let stockClass = '';
        if (currentStock === 0) {
            stockClass = 'out-of-stock';
        } else if (currentStock <= minStock) {
            stockClass = 'low-stock';
        }
        
        return `
        <div class="menu-card ${stockClass}">
            <div class="card-header">
                <h4>${itemName}</h4>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openEditModal('${item._id}')">Edit</button>
                    <button class="btn-icon delete" onclick="deleteMenuItem('${item._id}')">Delete</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Category:</span> ${getCategoryDisplayName(item.category)}
                </div>
                <div class="card-info">
                    <span class="label">Current Stock:</span> ${currentStock} ${displayUnit}
                </div>
                <div class="card-info">
                    <span class="label">Selling Price:</span> ₱${itemPrice.toFixed(2)}
                </div>
                <div class="card-info">
                    <span class="label">Stock Value:</span> ₱${itemValue.toFixed(2)}
                </div>
                <div class="card-info">
                    <span class="label">Min Stock:</span> ${minStock} ${displayUnit}
                </div>
                <div class="card-info">
                    <span class="label">Max Stock:</span> ${maxStock} ${displayUnit}
                </div>
                <div class="card-info">
                    <span class="label">Stock Level:</span>
                    <div class="stock-progress">
                        <div class="progress-bar" style="width: ${Math.min(stockPercentage, 100)}%"></div>
                    </div>
                </div>
                <div class="card-info">
                    <span class="label">Status:</span>
                    <span class="status ${currentStock === 0 ? 'out-of-stock' : currentStock <= minStock ? 'low-stock' : 'in-stock'}">
                        ${currentStock === 0 ? 'Out of Stock' : currentStock <= minStock ? 'Low Stock' : 'In Stock'}
                    </span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn-transfer" onclick="openTransferModal('${item._id}', '${itemName}', ${currentStock}, '${displayUnit}')">📤 Transfer Stock</button>
            </div>
        </div>
        `;
    }).join('');
    
    elements.menuGrid.innerHTML = gridHTML;
}

function renderDashboardGrid() {
    if (!elements.dashboardGrid) return;
    
    if (!allMenuItems || !Array.isArray(allMenuItems) || allMenuItems.length === 0) {
        elements.dashboardGrid.innerHTML = `
            <div class="empty-state">
                <h3>No products available</h3>
                <p>Add products to see dashboard data</p>
            </div>
        `;
        return;
    }
    
    const lowStockItems = allMenuItems.filter(item => {
        const currentStock = item.currentStock || 0;
        const minStock = item.minStock || 0;
        return currentStock <= minStock;
    });
    
    const recentItems = lowStockItems.slice(0, 8);
    
    if (recentItems.length === 0) {
        elements.dashboardGrid.innerHTML = `
            <div class="empty-state">
                <h3>All products are well stocked!</h3>
                <p>No low stock items to display</p>
            </div>
        `;
        return;
    }
    
    const gridHTML = recentItems.map(item => {
        const itemName = item.name || item.itemName || 'Unnamed Product';
        const itemPrice = item.price || 0;
        const currentStock = item.currentStock || 0;
        const maxStock = item.maxStock || 0;
        const minStock = item.minStock || 0;
        const unit = item.unit || '';
        const displayUnit = unitDisplayLabels[unit] || unit;
        
        const itemValue = itemPrice * currentStock;
        
        return `
        <div class="menu-card ${currentStock === 0 ? 'out-of-stock' : 'low-stock'}">
            <div class="card-header">
                <h4>${itemName}</h4>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Stock:</span> ${currentStock}/${maxStock} ${displayUnit}
                </div>
                <div class="card-info">
                    <span class="label">Value:</span> ₱${itemValue.toFixed(2)}
                </div>
                <div class="card-info">
                    <span class="label">Min:</span> ${minStock} ${displayUnit}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span>
                    <span class="status ${currentStock === 0 ? 'out-of-stock' : 'low-stock'}">
                        ${currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    elements.dashboardGrid.innerHTML = gridHTML;
}

// ==================== UPDATED CATEGORY COUNTS FUNCTION ====================
function updateCategoryCounts() {
    console.log('📊 Updating category counts...');
    console.log('📦 Total items:', allMenuItems ? allMenuItems.length : 0);
    
    if (!allMenuItems || !Array.isArray(allMenuItems)) {
        console.warn('⚠️ allMenuItems is not an array or is empty');
        return;
    }
    
    // Calculate counts for each category
    const categories = {
        'all': allMenuItems.length,
        'Rice': allMenuItems.filter(item => item.category === 'Rice').length,
        'Sizzling': allMenuItems.filter(item => item.category === 'Sizzling').length,
        'Party': allMenuItems.filter(item => item.category === 'Party').length,
        'Drink': allMenuItems.filter(item => item.category === 'Drink').length,
        'Cafe': allMenuItems.filter(item => item.category === 'Cafe').length,
        'Milk': allMenuItems.filter(item => item.category === 'Milk').length,
        'Frappe': allMenuItems.filter(item => item.category === 'Frappe').length,
        'Snack & Appetizer': allMenuItems.filter(item => item.category === 'Snack & Appetizer').length,
        'Budget Meals Served with Rice': allMenuItems.filter(item => item.category === 'Budget Meals Served with Rice').length,
        'Specialties': allMenuItems.filter(item => item.category === 'Specialties').length,
        'packaging': allMenuItems.filter(item => item.category === 'packaging').length
    };
    
    console.log('📈 Calculated category counts:', categories);
    
    // Update each category item
    if (elements.categoryItems && elements.categoryItems.length > 0) {
        elements.categoryItems.forEach(item => {
            const category = item.getAttribute('data-category');
            const countElement = item.querySelector('.category-count');
            
            if (countElement) {
                const count = categories[category] || 0;
                countElement.textContent = count;
                console.log(`✅ Updated ${category}: ${count}`);
            } else {
                console.warn(`⚠️ No count element found for category: ${category}`);
            }
        });
    } else {
        console.warn('⚠️ No category items found in DOM');
    }
}

// ==================== MODAL FUNCTIONS ====================
function openAddModal() {
    if (isModalOpen) return;
    
    isModalOpen = true;
    const modal = elements.itemModal;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Add New Product';
    if (elements.itemForm) elements.itemForm.reset();
    if (elements.itemId) elements.itemId.value = '';
    
    // Set default values
    if (elements.currentStock) elements.currentStock.value = '0';
    if (elements.minimumStock) elements.minimumStock.value = '20';
    if (elements.maximumStock) elements.maximumStock.value = '200';
    if (elements.itemPrice) elements.itemPrice.value = '';
    
    // Reset category and unit
    if (elements.itemCategory) {
        elements.itemCategory.value = '';
        updateFromCategory();
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemCategory) elements.itemCategory.focus();
    }, 10);
}

async function openEditModal(itemId) {
    if (isModalOpen) return;
    
    const item = allMenuItems.find(i => i._id === itemId);
    if (!item) {
        showToast('Product not found', 'error');
        return;
    }
    
    isModalOpen = true;
    const modal = elements.itemModal;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Edit Product';
    if (elements.itemId) elements.itemId.value = item._id;
    
    // Set category first, then populate other fields
    if (elements.itemCategory) {
        elements.itemCategory.value = item.category;
        updateUnitOptions(item.category);
        populateItemNamesByCategory(item.category);
    }
    
    // Set values after a short delay to ensure dropdowns are populated
    setTimeout(() => {
        if (elements.itemName) {
            elements.itemName.value = item.name || item.itemName || '';
        }
        
        if (elements.itemUnit) {
            elements.itemUnit.value = item.unit || '';
        }
        
        if (elements.itemPrice) {
            elements.itemPrice.value = item.price || '';
        }
        
        if (elements.currentStock) {
            elements.currentStock.value = item.currentStock || 0;
        }
        
        if (elements.minimumStock) {
            elements.minimumStock.value = item.minStock || 20;
        }
        
        if (elements.maximumStock) {
            elements.maximumStock.value = item.maxStock || 200;
        }
    }, 100);
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemName) elements.itemName.focus();
    }, 10);
}

function closeModal() {
    if (elements.itemModal) {
        elements.itemModal.classList.remove('show');
        setTimeout(() => {
            elements.itemModal.style.display = 'none';
            isModalOpen = false;
        }, 150);
    }
}

// ==================== SAVE FUNCTION ====================
async function handleSaveItem() {
    // Get form data
    const formData = {
        itemId: elements.itemId ? elements.itemId.value : '',
        itemName: elements.itemName ? elements.itemName.value : '',
        category: elements.itemCategory ? elements.itemCategory.value : '',
        unit: elements.itemUnit ? elements.itemUnit.value : '',
        currentStock: elements.currentStock ? elements.currentStock.value : '0',
        minStock: elements.minimumStock ? elements.minimumStock.value : '20',
        maxStock: elements.maximumStock ? elements.maximumStock.value : '200',
        price: elements.itemPrice ? elements.itemPrice.value : '0'
    };
    
    // Validate required fields
    if (!formData.itemName || formData.itemName.trim() === '' || formData.itemName === 'Select Product') {
        showToast('Please select a product from the dropdown list', 'error');
        if (elements.itemName) elements.itemName.focus();
        return;
    }
    
    if (!formData.category || formData.category.trim() === '' || formData.category === 'Select Category') {
        showToast('Please select a category from the dropdown', 'error');
        if (elements.itemCategory) elements.itemCategory.focus();
        return;
    }
    
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
        showToast('Please enter a valid price (must be a number greater than 0)', 'error');
        if (elements.itemPrice) elements.itemPrice.focus();
        return;
    }
    
    if (!formData.unit || formData.unit.trim() === '' || formData.unit === 'Select Unit') {
        showToast('Please select a unit from the dropdown', 'error');
        if (elements.itemUnit) elements.itemUnit.focus();
        return;
    }
    
    // Validate stock values
    const maxStock = parseInt(formData.maxStock);
    const minStock = parseInt(formData.minStock);
    const currentStock = parseInt(formData.currentStock);
    
    if (isNaN(maxStock) || maxStock <= 0) {
        showToast('Maximum stock must be a positive number', 'error');
        if (elements.maximumStock) elements.maximumStock.focus();
        return;
    }
    
    if (isNaN(minStock) || minStock < 0) {
        showToast('Minimum stock must be 0 or greater', 'error');
        if (elements.minimumStock) elements.minimumStock.focus();
        return;
    }
    
    if (maxStock <= minStock) {
        showToast('Maximum stock must be greater than minimum stock', 'error');
        if (elements.maximumStock) elements.maximumStock.focus();
        return;
    }
    
    if (currentStock > maxStock) {
        showToast('Current stock cannot exceed maximum stock', 'error');
        if (elements.currentStock) elements.currentStock.focus();
        return;
    }
    
    if (currentStock < 0) {
        showToast('Current stock cannot be negative', 'error');
        if (elements.currentStock) elements.currentStock.focus();
        return;
    }
    
    await saveMenuItem(formData);
}

async function saveMenuItem(itemData) {
    const isEdit = itemData.itemId && itemData.itemId.trim() !== '';
    
    // Disable save button during request
    const saveBtn = elements.saveItemBtn;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    try {
        // Create payload
        const payload = {
            name: itemData.itemName,
            category: itemData.category,
            unit: itemData.unit,
            currentStock: Number(itemData.currentStock),
            minStock: Number(itemData.minStock),
            maxStock: Number(itemData.maxStock),
            price: Number(itemData.price),
            itemType: 'finished',
            isActive: true
        };
        
        let url, method;
        
        if (isEdit) {
            url = `/api/menu/${itemData.itemId}`;
            method = 'PUT';
        } else {
            url = '/api/menu';
            method = 'POST';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        
        if (response.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        const responseText = await response.text();
        let responseData;
        
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
        }
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} - ${responseData.message || 'Unknown error'}`);
        }
        
        if (responseData.success) {
            const action = isEdit ? 'updated' : 'added';
            showToast(`Product ${action} successfully!`, 'success');
            
            // Close modal
            closeModal();
            
            // Refresh data from server
            await fetchMenuItems();
            
        } else {
            throw new Error(responseData.message || 'Failed to save product');
        }
        
    } catch (error) {
        console.error('❌ Error saving product:', error);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// ==================== STOCK TRANSFER FUNCTIONS ====================
function openSendStockModal() {
    if (!allMenuItems || allMenuItems.length === 0) {
        showToast('No products available to transfer', 'error');
        return;
    }
    
    populateStockTransferProducts();
    resetStockTransferForm();
    elements.sendStockModal.style.display = 'flex';
    setTimeout(() => {
        elements.sendStockModal.classList.add('show');
    }, 10);
}

function closeSendStockModal() {
    elements.sendStockModal.classList.remove('show');
    setTimeout(() => {
        elements.sendStockModal.style.display = 'none';
    }, 150);
}

function resetStockTransferForm() {
    if (elements.stockQuantity) elements.stockQuantity.value = '1';
    if (elements.transferNotes) elements.transferNotes.value = '';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    if (elements.transferDate) {
        elements.transferDate.value = today;
        elements.transferDate.min = today;
    }
    
    updateStockTransferSummary();
}

function populateStockTransferProducts() {
    if (!elements.stockProduct) return;
    
    elements.stockProduct.innerHTML = '<option value="">Select Product to Transfer</option>';
    
    if (!allMenuItems || !Array.isArray(allMenuItems)) {
        return;
    }
    
    allMenuItems.forEach(item => {
        if (item.currentStock > 0) {
            const option = document.createElement('option');
            option.value = item._id;
            const displayUnit = unitDisplayLabels[item.unit] || item.unit || '';
            option.textContent = `${item.name || item.itemName} (${item.currentStock} ${displayUnit} available)`;
            option.dataset.stock = item.currentStock;
            option.dataset.unit = item.unit || '';
            option.dataset.name = item.name || item.itemName;
            option.dataset.price = item.price || 0;
            elements.stockProduct.appendChild(option);
        }
    });
}

function updateStockTransferSummary() {
    const productId = elements.stockProduct.value;
    const quantity = parseInt(elements.stockQuantity.value) || 0;
    const date = elements.transferDate.value;
    
    if (!productId) {
        if (elements.availableStock) {
            elements.availableStock.textContent = '0';
        }
        
        const summaryProduct = document.getElementById('summaryProduct');
        const summaryQuantity = document.getElementById('summaryQuantity');
        const summaryDate = document.getElementById('summaryDate');
        const summaryValue = document.getElementById('summaryValue');
        
        if (summaryProduct) summaryProduct.textContent = 'Not selected';
        if (summaryQuantity) summaryQuantity.textContent = '0';
        if (summaryDate) summaryDate.textContent = date || 'Not selected';
        if (summaryValue) summaryValue.textContent = formatCurrency(0);
        
        return;
    }
    
    const productOption = elements.stockProduct.options[elements.stockProduct.selectedIndex];
    const availableStock = parseInt(productOption.dataset.stock) || 0;
    const unit = productOption.dataset.unit || '';
    const displayUnit = unitDisplayLabels[unit] || unit;
    
    if (elements.availableStock) {
        elements.availableStock.textContent = `${availableStock} ${displayUnit}`;
    }
    
    // Update quantity max value
    if (elements.stockQuantity) {
        elements.stockQuantity.max = availableStock;
        if (quantity > availableStock) {
            elements.stockQuantity.value = availableStock;
        }
    }
    
    const summaryProduct = document.getElementById('summaryProduct');
    const summaryQuantity = document.getElementById('summaryQuantity');
    const summaryDate = document.getElementById('summaryDate');
    const summaryValue = document.getElementById('summaryValue');
    
    if (summaryProduct) {
        summaryProduct.textContent = productOption.dataset.name || 'Not selected';
    }
    
    if (summaryQuantity) {
        const actualQuantity = quantity > availableStock ? availableStock : quantity;
        summaryQuantity.textContent = actualQuantity > 0 ? `${actualQuantity} ${displayUnit}` : '0';
    }
    
    if (summaryDate) {
        summaryDate.textContent = date || 'Not selected';
    }
    
    if (summaryValue && productOption.dataset.price) {
        const actualQuantity = quantity > availableStock ? availableStock : quantity;
        const totalValue = actualQuantity * parseFloat(productOption.dataset.price);
        summaryValue.textContent = formatCurrency(totalValue);
    }
}

async function handleSendStock() {
    const productId = elements.stockProduct.value;
    const quantity = parseInt(elements.stockQuantity.value) || 0;
    const date = elements.transferDate.value;
    const notes = elements.transferNotes.value.trim();
    
    if (!productId) {
        showToast('Please select a product to transfer', 'error');
        return;
    }
    
    if (!quantity || quantity <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }
    
    if (!date) {
        showToast('Please select a transfer date', 'error');
        return;
    }
    
    const productOption = elements.stockProduct.options[elements.stockProduct.selectedIndex];
    const availableStock = parseInt(productOption.dataset.stock) || 0;
    const productName = productOption.dataset.name || 'Unknown Product';
    
    if (quantity > availableStock) {
        showToast(`Cannot transfer more than available stock (${availableStock})`, 'error');
        return;
    }
    
    const btn = elements.confirmSendStockBtn;
    const originalText = btn.textContent;
    btn.textContent = 'Transferring...';
    btn.disabled = true;
    
    try {
        // First, update the stock locally
        const itemIndex = allMenuItems.findIndex(item => item._id === productId);
        if (itemIndex === -1) {
            throw new Error('Product not found');
        }
        
        const originalStock = allMenuItems[itemIndex].currentStock;
        allMenuItems[itemIndex].currentStock -= quantity;
        
        // Save to backend
        const response = await fetch(`/api/menu/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                currentStock: allMenuItems[itemIndex].currentStock
            }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            // Revert local change if API fails
            allMenuItems[itemIndex].currentStock = originalStock;
            throw new Error(`Failed to update stock: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Log the transfer
            await logStockTransfer({
                productId: productId,
                productName: productName,
                quantity: quantity,
                date: date,
                notes: notes,
                previousStock: originalStock,
                newStock: allMenuItems[itemIndex].currentStock
            });
            
            showToast(`${quantity} ${allMenuItems[itemIndex].unit} of ${productName} transferred successfully!`, 'success');
            closeSendStockModal();
            
            // Update UI
            updateAllUIComponents();
            
            // Add notification
            addNotification(
                productName,
                `Stock transferred: ${quantity} units sent to staff. Remaining: ${allMenuItems[itemIndex].currentStock}`
            );
            
        } else {
            // Revert local change if API fails
            allMenuItems[itemIndex].currentStock = originalStock;
            throw new Error(data.message || 'Failed to update stock');
        }
        
    } catch (error) {
        console.error('Error transferring stock:', error);
        showToast(`Failed to transfer stock: ${error.message}`, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function logStockTransfer(transferData) {
    try {
        const response = await fetch('/api/stock-transfers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                ...transferData,
                type: 'transfer_to_staff',
                status: 'completed',
                timestamp: new Date().toISOString()
            }),
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.success;
        }
        return false;
    } catch (error) {
        console.error('Error logging stock transfer:', error);
        return false;
    }
}

// ==================== LOGOUT FUNCTION ====================
function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(() => {
        window.location.href = '/login';
    })
    .catch(error => {
        console.error('Logout error:', error);
        window.location.href = '/login';
    });
}

// ==================== UPDATE ALL UI COMPONENTS ====================
function updateAllUIComponents() {
    console.log('🔄 Updating all UI components...');
    console.log('📊 Current section:', currentSection);
    
    // Update based on current section
    if (currentSection === 'dashboard') {
        renderDashboardGrid();
        updateDashboardStats();
    } else if (currentSection === 'menu') {
        renderMenuGrid();
    }
    
    updateCategoryCounts();
    populateStockTransferProducts();
    console.log('✅ All UI components updated');
}

// ==================== STOCK REQUEST MANAGEMENT ====================

async function loadPendingStockRequests() {
    try {
        console.log('📦 Loading pending stock requests...');
        
        const response = await fetch('/api/stock-requests/pending', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load stock requests');
        }
        
        const result = await response.json();
        const requests = result.data || [];
        
        console.log('Received requests:', requests);
        
        const tableBody = document.getElementById('stockRequestsTableBody');
        const emptyState = document.getElementById('emptyStockState');
        
        if (requests.length === 0) {
            tableBody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        tableBody.innerHTML = requests.map(req => `
            <tr>
                <td><strong>${req.productName || 'Unknown'}</strong></td>
                <td>${req.requestedQuantity || 0}</td>
                <td><span class="priority-badge priority-${req.priority || 'medium'}">${(req.priority || 'medium').toUpperCase()}</span></td>
                <td>${req.requestedBy || 'System'}</td>
                <td>${new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td><span class="status-badge status-${req.status || 'pending'}">${(req.status || 'pending').toUpperCase()}</span></td>
                <td>
                    <button class="btn-action" onclick="viewStockDetail('${req._id}')" title="View Details">👁️ View</button>
                    ${req.status === 'pending' ? `
                        <button class="btn-action" onclick="approveStockRequest('${req._id}')" title="Approve" style="color: green;">✓ Approve</button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
        
        // Update badge
        const pendingBadge = document.getElementById('pendingStockBadge');
        if (pendingBadge && requests.length > 0) {
            pendingBadge.textContent = requests.length;
            pendingBadge.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Error loading stock requests:', error);
        const tableBody = document.getElementById('stockRequestsTableBody');
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Error loading stock requests: ${error.message}</td></tr>`;
    }
}

function viewStockDetail(requestId) {
    try {
        console.log('👁️ Viewing stock detail:', requestId);
        
        fetch(`/api/stock-requests/${requestId}`, {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                const req = result.data;
                
                // Populate modal
                document.getElementById('detailProductName').textContent = req.productName || '-';
                document.getElementById('detailQuantity').textContent = req.requestedQuantity || '-';
                document.getElementById('detailPriority').textContent = (req.priority || 'medium').toUpperCase();
                document.getElementById('detailRequestedBy').textContent = req.requestedBy || '-';
                document.getElementById('detailDateRequested').textContent = new Date(req.createdAt).toLocaleDateString();
                document.getElementById('detailStatus').textContent = (req.status || 'pending').toUpperCase();
                document.getElementById('detailNotes').textContent = req.notes || 'No notes';
                
                // Show action buttons based on status
                const actionForm = document.getElementById('actionForm');
                const fulfillBtn = document.getElementById('fulfillStockBtn');
                const rejectBtn = document.getElementById('rejectStockBtn');
                
                if (req.status === 'pending') {
                    actionForm.style.display = 'block';
                    fulfillBtn.style.display = 'block';
                    fulfillBtn.onclick = () => fulfillStockRequest(requestId);
                    rejectBtn.style.display = 'block';
                    rejectBtn.onclick = () => rejectStockRequest(requestId);
                } else {
                    actionForm.style.display = 'none';
                    fulfillBtn.style.display = 'none';
                    rejectBtn.style.display = 'none';
                }
                
                // Set default fulfill quantity
                document.getElementById('fulfillQuantity').value = req.requestedQuantity || '';
                
                // Show modal
                document.getElementById('viewStockModal').style.display = 'block';
                document.getElementById('viewStockModal').dataset.requestId = requestId;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading request details');
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fulfillStockRequest(requestId) {
    try {
        const quantity = parseInt(document.getElementById('fulfillQuantity').value) || 0;
        
        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }
        
        const response = await fetch(`/api/stock-requests/${requestId}/fulfill`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ quantity })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Stock request fulfilled successfully!');
            document.getElementById('viewStockModal').style.display = 'none';
            loadPendingStockRequests();
        } else {
            alert('❌ Error fulfilling request: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fulfilling request');
    }
}

async function rejectStockRequest(requestId) {
    if (!confirm('Are you sure you want to reject this stock request?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/stock-requests/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ 
                status: 'rejected',
                notes: 'Rejected by admin'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Stock request rejected');
            document.getElementById('viewStockModal').style.display = 'none';
            loadPendingStockRequests();
        } else {
            alert('❌ Error rejecting request: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error rejecting request');
    }
}

async function approveStockRequest(requestId) {
    try {
        const response = await fetch(`/api/stock-requests/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ 
                status: 'approved',
                notes: 'Approved by admin'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Stock request approved');
            loadPendingStockRequests();
        } else {
            alert('❌ Error approving request: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error approving request');
    }
}

// ==================== EVENT LISTENERS FOR STOCK REQUESTS ====================

function setupStockRequestListeners() {
    const viewStockBtn = document.getElementById('viewStockBtn');
    if (viewStockBtn) {
        viewStockBtn.addEventListener('click', () => {
            showSection('viewstock');
        });
    }
    
    const refreshStockBtn = document.getElementById('refreshStockRequestsBtn');
    if (refreshStockBtn) {
        refreshStockBtn.addEventListener('click', loadPendingStockRequests);
    }
    
    const closeViewStockModal = document.getElementById('closeViewStockModal');
    if (closeViewStockModal) {
        closeViewStockModal.addEventListener('click', () => {
            document.getElementById('viewStockModal').style.display = 'none';
        });
    }
    
    const cancelViewStockBtn = document.getElementById('cancelViewStockBtn');
    if (cancelViewStockBtn) {
        cancelViewStockBtn.addEventListener('click', () => {
            document.getElementById('viewStockModal').style.display = 'none';
        });
    }
    
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            loadPendingStockRequests();
        });
    }
}

// Call setup on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupStockRequestListeners);
} else {
    setupStockRequestListeners();
}

// ==================== GLOBAL EXPORTS ====================
window.handleLogout = handleLogout;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteMenuItem = deleteMenuItem;
window.handleSendStock = handleSendStock;
window.updateStockTransferSummary = updateStockTransferSummary;
window.toggleNotificationModal = toggleNotificationModal;
window.clearAllNotifications = clearAllNotifications;
window.viewStockDetail = viewStockDetail;
window.fulfillStockRequest = fulfillStockRequest;
window.rejectStockRequest = rejectStockRequest;
window.approveStockRequest = approveStockRequest;
window.loadPendingStockRequests = loadPendingStockRequests;

console.log('✅ Menu Management System loaded successfully');