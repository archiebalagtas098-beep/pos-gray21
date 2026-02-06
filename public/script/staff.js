let currentOrder = [];
let orderType = null;
let currentCategory = 'all';
let selectedPaymentMethod = null;
let productCatalog = [];

const menuDatabase = {
    'Rice': [
        { name: 'Korean Spicy Bulgogi (Pork)', unit: 'plate', defaultPrice: 180 },
        { name: 'Korean Salt and Pepper (Pork)', unit: 'plate', defaultPrice: 175 },
        { name: 'Crispy Pork Lechon Kawali', unit: 'plate', defaultPrice: 165 },
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
    ]
};

// Category to display name mapping
const categoryDisplayNames = {
    'Rice': 'Rice Bowl Meals',
    'Sizzling': 'Hot Sizzlers',
    'Party': 'Party Tray',
    'Drink': 'Drinks',
    'Cafe': 'Coffee',
    'Milk': 'Milk Tea',
    'Frappe': 'Frappe',
    'Snack & Appetizer': 'Snacks & Appetizer',
    'Budget Meals Served with Rice': 'Budget Meals Served with Rice',
    'Specialties': 'Specialties'
};

const BACKEND_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', function() {
    loadAllMenuItems();
    setupCategoryButtons();
    
    // Initial setup
    renderMenu();
    updatePayButtonState();
    
    // Set initial order type to "None"
    setOrderTypeNone();
    
    // Event listeners
    const tableInput = document.getElementById('tableNumber');
    if (tableInput) {
        tableInput.addEventListener('input', updatePayButtonState);
    }
    
    const inputPayment = document.getElementById('inputPayment');
    if (inputPayment) {
        inputPayment.addEventListener('input', updatePayButtonState);
    }
    
    // Category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(btn => {
            const category = btn.getAttribute('data-category');
            btn.addEventListener('click', () => filterCategory(category));
            
            if (category === 'all') {
                btn.classList.add('active');
            }
        });
    }
    
    // Search input
    const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchFood(e.target.value);
        });
    }
    
    console.log('✅ POS System loaded - ALL PRODUCTS WILL BE SHOWN');
    
    // Auto-refresh menu items every 30 seconds
    setInterval(() => {
        console.log('🔄 Auto-refreshing menu items...');
        loadAllMenuItems();
    }, 30000);
    
    // Add stock management buttons
    setTimeout(() => {
        addStockManagementButtons();
    }, 1000);
});

// Set order type to "None"
function setOrderTypeNone() {
    orderType = null;
    
    const display = document.getElementById("orderTypeDisplay");
    if (display) display.textContent = "None";
    
    // Remove active class from both buttons
    const dineInBtn = document.querySelector('.dineinandtakeout-btn:nth-child(1)');
    const takeoutBtn = document.querySelector('.dineinandtakeout-btn:nth-child(2)');
    
    if (dineInBtn) dineInBtn.classList.remove('active');
    if (takeoutBtn) takeoutBtn.classList.remove('active');
    
    const tableInput = document.getElementById('tableNumber');
    if (tableInput) {
        tableInput.value = '';
        tableInput.disabled = false;
        tableInput.placeholder = "Enter Table:";
    }
    
    updatePayButtonState();
}

// Load ALL menu items - FROM ACTUAL DATABASE
async function loadAllMenuItems() {
    try {
        console.log('📡 Fetching ALL menu items from backend...');
        
        // First, try to get from database
        const response = await fetch(`${BACKEND_URL}/api/products/actual-menu`, {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.data) {
                // Process the data from backend
                productCatalog = [];
                
                // Go through each category in the actual menu database
                for (const [categoryKey, items] of Object.entries(menuDatabase)) {
                    const displayCategory = categoryDisplayNames[categoryKey] || categoryKey;
                    
                    for (const menuItem of items) {
                        // Try to find this item in the database response
                        let dbItem = null;
                        
                        if (result.data.categories) {
                            for (const categoryData of result.data.categories) {
                                if (categoryData.category === displayCategory) {
                                    const found = categoryData.items.find(item => 
                                        item.name.toLowerCase() === menuItem.name.toLowerCase()
                                    );
                                    if (found) {
                                        dbItem = found;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // Create product object
                        productCatalog.push({
                            name: menuItem.name,
                            price: dbItem?.productStatus === 'not_in_database' ? menuItem.defaultPrice : (dbItem?.defaultPrice || menuItem.defaultPrice),
                            category: displayCategory,
                            image: 'default_food.jpg',
                            stock: dbItem?.productStock || 50, // Default stock if not in DB
                            unit: menuItem.unit,
                            vatable: true,
                            _id: dbItem?.productId || `temp_${Date.now()}_${menuItem.name.replace(/\s+/g, '_')}`,
                            inventoryItemId: dbItem?.inventoryItemId || null,
                            minStock: 10,
                            status: dbItem?.productStatus === 'available' ? 'available' : 'available'
                        });
                    }
                }
                
                console.log(`✅ Loaded ${productCatalog.length} products (ALL from menu database)`);
                renderMenu();
                return;
            }
        }
        
        // If API fails, load from local menu database
        console.log('⚠️ Using local menu database (backend not responding)');
        loadFromLocalMenuDatabase();
        
    } catch (error) {
        console.error('❌ Error loading menu items:', error);
        loadFromLocalMenuDatabase();
    }
}

// Load from local menu database
function loadFromLocalMenuDatabase() {
    productCatalog = [];
    
    // Convert menuDatabase to productCatalog format
    for (const [categoryKey, items] of Object.entries(menuDatabase)) {
        const displayCategory = categoryDisplayNames[categoryKey] || categoryKey;
        
        for (const menuItem of items) {
            productCatalog.push({
                name: menuItem.name,
                price: menuItem.defaultPrice,
                category: displayCategory,
                image: 'default_food.jpg',
                stock: 50, // Default stock
                unit: menuItem.unit,
                vatable: true,
                _id: `temp_${Date.now()}_${menuItem.name.replace(/\s+/g, '_')}`,
                inventoryItemId: null,
                minStock: 10,
                status: 'available'
            });
        }
    }
    
    console.log(`✅ Loaded ${productCatalog.length} products from local menu database`);
    renderMenu();
}

function checkAllFieldsFilled() {
    const hasItems = currentOrder.length > 0;
    const hasOrderType = orderType && orderType !== "None";
    const hasPaymentMethod = selectedPaymentMethod && selectedPaymentMethod.trim() !== '';
    
    let hasTableNumber = true;
    if (orderType === "Dine In") {
        const tableInput = document.getElementById('tableNumber');
        hasTableNumber = tableInput && tableInput.value.trim() !== '';
    }
    
    let hasPaymentAmount = true;
    if (selectedPaymentMethod === 'cash') {
        const inputPayment = document.getElementById('inputPayment');
        hasPaymentAmount = inputPayment && inputPayment.value.trim() !== '';
    }
    
    return hasItems && hasOrderType && hasPaymentMethod && hasTableNumber && hasPaymentAmount;
}

function updatePayButtonState() {
    const payButton = document.getElementById('payButton');
    if (!payButton) return;
    
    const allFieldsFilled = checkAllFieldsFilled();
    
    if (allFieldsFilled) {
        payButton.disabled = false;
        payButton.style.opacity = '1';
        payButton.style.cursor = 'pointer';
        payButton.style.backgroundColor = '#28a745';
    } else {
        payButton.disabled = true;
        payButton.style.opacity = '0.6';
        payButton.style.cursor = 'not-allowed';
        payButton.style.backgroundColor = '#6c757d';
    }
}

function searchFood(searchTerm) {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    
    if (!searchTerm.trim()) {
        renderMenu();
        return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filteredProducts = productCatalog.filter(product => {
        if (currentCategory !== 'all' && product.category !== currentCategory) return false;
        if (product.name.toLowerCase().includes(term)) return true;
        if (product.category.toLowerCase().includes(term)) return true;
        return false;
    });
    
    container.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
    
    updatePayButtonState();
}

function renderMenu() {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    container.innerHTML = '';

    const items = currentCategory === 'all'
        ? productCatalog
        : productCatalog.filter(p => p.category === currentCategory);

    if (items.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-utensils"></i>
                <h3>No products in this category</h3>
                <p>Try selecting a different category</p>
            </div>
        `;
        return;
    }

    items.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
    
    updatePayButtonState();
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'compact-product-card';
    
    const isOutOfStock = product.stock <= 0;
    
    // Store product data for stock request modal
    card.dataset.productName = product.name;
    card.dataset.productId = product._id;
    card.dataset.productCategory = product.category;
    card.dataset.productPrice = product.price;
    card.dataset.productUnit = product.unit;
    
    // HANDLE OUT OF STOCK - MAKE CLICKABLE FOR STOCK REQUEST
    if (isOutOfStock) {
        card.classList.add('out-of-stock');
        card.style.cursor = 'pointer';
        card.style.opacity = '0.8';
        card.style.pointerEvents = 'auto';
        card.onclick = () => showStockRequestModal(product);
    } else {
        card.style.cursor = 'pointer';
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        card.onclick = () => addItemToOrder(product.name, product.price);
    }

    let stockStatus = '';
    let stockClass = '';
    
    if (product.stock <= 0) {
        stockStatus = 'Out of Stock';
        stockClass = 'out-stock';
    } else if (product.stock <= (product.minStock || 10)) {
        stockStatus = `${product.stock} ${product.unit} left`;
        stockClass = 'low-stock';
    } else if (product.stock <= 30) {
        stockStatus = `${product.stock} ${product.unit}`;
        stockClass = 'medium-stock';
    } else {
        stockStatus = `${product.stock} ${product.unit} available`;
        stockClass = 'high-stock';
    }

    // Get real-time stock before showing card (only for in-stock items)
    if (!isOutOfStock) {
        getRealTimeStock(product.name).then(realStock => {
            if (realStock !== null && realStock !== product.stock) {
                product.stock = realStock;
                updateStockDisplay(product.name, realStock);
            }
        });
    }

    card.innerHTML = `
        <img src="/images/${product.image}" 
             onerror="this.onerror=null; this.src='/images/default_food.jpg';" 
             alt="${product.name}" />
        <div class="compact-product-name">${product.name}</div>
        <div class="compact-product-category">${product.category}</div>
        <div class="compact-product-price">₱${product.price}</div>
        <div class="compact-product-stock ${stockClass}">
            ${stockStatus}
        </div>
        ${isOutOfStock ? '<div class="request-stock-badge">Click to Request Stock</div>' : ''}
    `;
    
    return card;
}

// Get real-time stock from server
async function getRealTimeStock(productName) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/inventory/stock/${encodeURIComponent(productName)}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();
        
        if (result.success && result.data) {
            return result.data.stock || result.data.inventoryStock || 0;
        }
        return null;
    } catch (error) {
        return null;
    }
}

function showStockRequestModal(product) {
    const modalHTML = `
    <div id="stockRequestModal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    ">
        <div style="
            background: white;
            padding: 25px;
            border-radius: 12px;
            width: 90%;
            max-width: 450px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #ef4444;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #ef4444;"></i>
                    <h2 style="margin: 0; color: #374151; font-size: 20px;">Request Stock</h2>
                </div>
                <button onclick="closeStockRequestModal()" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                    padding: 8px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div style="margin-bottom: 25px;">
                <div style="
                    background: #fef2f2;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                ">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <i class="fas fa-box" style="color: #ef4444;"></i>
                        <h3 style="margin: 0; color: #374151; font-size: 16px;">Product Information</h3>
                    </div>
                    <div style="
                        display: grid;
                        grid-template-columns: 100px 1fr;
                        gap: 10px;
                        font-size: 14px;
                    ">
                        <div style="color: #6b7280;">Product:</div>
                        <div style="font-weight: 500; color: #374151;">${product.name}</div>
                        
                        <div style="color: #6b7280;">Category:</div>
                        <div style="font-weight: 500; color: #374151;">${product.category}</div>
                        
                        <div style="color: #6b7280;">Current Stock:</div>
                        <div style="font-weight: 500; color: #dc2626;">
                            <span style="background: #fee2e2; padding: 2px 6px; border-radius: 4px;">0 ${product.unit}</span>
                        </div>
                        
                        <div style="color: #6b7280;">Price:</div>
                        <div style="font-weight: 500; color: #374151;">₱${product.price}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Stock Request Details</h4>
                    <div style="
                        background: #f0f9ff;
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid #e0f2fe;
                    ">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Requested Quantity
                            </label>
                            <input type="number" 
                                   id="requestedQuantity" 
                                   min="1" 
                                   max="1000" 
                                   value="10" 
                                   style="
                                        width: 100%;
                                        padding: 10px;
                                        border: 2px solid #e5e7eb;
                                        border-radius: 8px;
                                        font-size: 16px;
                                        box-sizing: border-box;
                                   ">
                            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
                                Enter the quantity of ${product.unit} you want to request
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Priority Level
                            </label>
                            <div style="display: flex; gap: 10px;">
                                <button onclick="setStockRequestPriority('low')" 
                                        id="priorityLow"
                                        style="
                                            flex: 1;
                                            padding: 10px;
                                            background: #f0fdf4;
                                            border: 2px solid #bbf7d0;
                                            border-radius: 6px;
                                            color: #059669;
                                            font-weight: 500;
                                            cursor: pointer;
                                        ">
                                    <i class="fas fa-clock"></i> Low
                                </button>
                                <button onclick="setStockRequestPriority('medium')" 
                                        id="priorityMedium"
                                        style="
                                            flex: 1;
                                            padding: 10px;
                                            background: #fffbeb;
                                            border: 2px solid #fef3c7;
                                            border-radius: 6px;
                                            color: #d97706;
                                            font-weight: 500;
                                            cursor: pointer;
                                        ">
                                    <i class="fas fa-exclamation-circle"></i> Medium
                                </button>
                                <button onclick="setStockRequestPriority('high')" 
                                        id="priorityHigh"
                                        style="
                                            flex: 1;
                                            padding: 10px;
                                            background: #fef2f2;
                                            border: 2px solid #fecaca;
                                            border-radius: 6px;
                                            color: #dc2626;
                                            font-weight: 500;
                                            cursor: pointer;
                                        ">
                                    <i class="fas fa-exclamation-triangle"></i> High
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Additional Notes (Optional)
                            </label>
                            <textarea id="requestNotes" 
                                      placeholder="Add any additional information..."
                                      rows="3"
                                      style="
                                        width: 100%;
                                        padding: 10px;
                                        border: 2px solid #e5e7eb;
                                        border-radius: 8px;
                                        font-size: 14px;
                                        box-sizing: border-box;
                                        resize: vertical;
                                      "></textarea>
                        </div>
                    </div>
                </div>
                
                <div style="
                    background: #fffbeb;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                ">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <i class="fas fa-info-circle" style="color: #f59e0b; font-size: 18px; margin-top: 2px;"></i>
                        <div>
                            <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">Note:</h4>
                            <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.4;">
                                This request will be sent to the menu management admin. You will be notified when the stock is updated.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="closeStockRequestModal()" style="
                    flex: 1;
                    padding: 12px;
                    background: #f3f4f6;
                    color: #374151;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                ">
                    Cancel
                </button>
                <button onclick="submitStockRequest('${product.name.replace(/'/g, "\\'")}', '${product._id}')" style="
                    flex: 1;
                    padding: 12px;
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    <i class="fas fa-paper-plane"></i> Send Request
                </button>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set default priority to Medium
    setTimeout(() => {
        setStockRequestPriority('medium');
    }, 10);
}

function closeStockRequestModal() {
    const modal = document.getElementById('stockRequestModal');
    if (modal) {
        modal.remove();
    }
}

function setStockRequestPriority(priority) {
    // Reset all buttons
    const priorityButtons = document.querySelectorAll('#stockRequestModal button[id^="priority"]');
    if (!priorityButtons.length) return;
    
    priorityButtons.forEach(btn => {
        btn.style.background = '';
        btn.style.border = '';
        btn.style.color = '';
    });
    
    // Set active button
    const activeBtn = document.getElementById(`priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`);
    if (activeBtn) {
        switch(priority) {
            case 'low':
                activeBtn.style.background = '#10b981';
                activeBtn.style.color = 'white';
                activeBtn.style.border = '2px solid #059669';
                break;
            case 'medium':
                activeBtn.style.background = '#f59e0b';
                activeBtn.style.color = 'white';
                activeBtn.style.border = '2px solid #d97706';
                break;
            case 'high':
                activeBtn.style.background = '#dc2626';
                activeBtn.style.color = 'white';
                activeBtn.style.border = '2px solid #b91c1c';
                break;
        }
    }
    
    // Store priority in global variable
    window.currentRequestPriority = priority;
}

// Submit stock request to backend
async function submitStockRequest(productName, productId) {
    try {
        const quantityInput = document.getElementById('requestedQuantity');
        const notesInput = document.getElementById('requestNotes');
        
        if (!quantityInput || !quantityInput.value) {
            alert('Please enter a quantity');
            return;
        }
        
        const requestedQuantity = parseInt(quantityInput.value);
        if (requestedQuantity <= 0 || requestedQuantity > 1000) {
            alert('Please enter a valid quantity (1-1000)');
            return;
        }
        
        const notes = notesInput ? notesInput.value : '';
        const priority = window.currentRequestPriority || 'medium';
        
        console.log(`📨 Submitting stock request for ${productName}: ${requestedQuantity} (${priority} priority)`);
        
        // Prepare request data
        const requestData = {
            productName: productName,
            productId: productId,
            requestedQuantity: requestedQuantity,
            priority: priority,
            notes: notes,
            requestDate: new Date().toISOString(),
            status: 'pending'
        };
        
        // Send request to backend
        const response = await fetch(`${BACKEND_URL}/api/stock-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                showStockRequestSuccess(productName, requestedQuantity);
                
                // Close modal
                closeStockRequestModal();
                
                // Optionally refresh stock data
                setTimeout(() => {
                    loadAllMenuItems();
                }, 2000);
            } else {
                throw new Error(result.message || 'Failed to submit request');
            }
        } else {
            throw new Error('Server error: ' + response.status);
        }
        
    } catch (error) {
        console.error('Error submitting stock request:', error);
        alert(`Failed to submit stock request: ${error.message}`);
    }
}

function showStockRequestSuccess(productName, quantity) {
    const successHTML = `
    <div id="stockRequestSuccess" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    ">
        <div style="
            background: white;
            padding: 25px;
            border-radius: 12px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        ">
            <div style="
                width: 60px;
                height: 60px;
                background: #10b981;
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <i class="fas fa-check" style="color: white; font-size: 30px;"></i>
            </div>
            
            <h2 style="color: #10b981; margin-bottom: 10px;">Request Sent!</h2>
            <p style="color: #666; margin-bottom: 20px;">
                Your stock request for <strong>${productName}</strong> has been sent to the admin.
            </p>
            
            <div style="
                background: #f0fdf4;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 25px;
                border: 1px solid #bbf7d0;
            ">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #666;">Product:</span>
                    <span style="font-weight: bold; color: #333;">${productName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #666;">Quantity:</span>
                    <span style="font-weight: bold; color: #333;">${quantity}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #666;">Status:</span>
                    <span style="font-weight: bold; color: #f59e0b;">Pending Review</span>
                </div>
            </div>
            
            <div style="
                background: #f0f9ff;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid #e0f2fe;
            ">
                <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                    <i class="fas fa-clock" style="color: #0ea5e9;"></i>
                    <span style="color: #0ea5e9; font-size: 14px;">
                        Admin will review your request shortly
                    </span>
                </div>
            </div>
            
            <button onclick="closeStockRequestSuccess()" style="
                width: 100%;
                padding: 12px;
                background: #10b981;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.3s;
            " onmouseover="this.style.background='#0da271'" onmouseout="this.style.background='#10b981'">
                OK
            </button>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
}

function closeStockRequestSuccess() {
    const successMsg = document.getElementById('stockRequestSuccess');
    if (successMsg) {
        successMsg.remove();
    }
}

// Add item to order with real-time stock check
async function addItemToOrder(name, price) {
    // Get real-time stock first
    let realStock = null;
    try {
        realStock = await getRealTimeStock(name);
    } catch (error) {
        console.log('Using local stock:', error.message);
    }
    
    const product = productCatalog.find(p => p.name === name);
    
    if (!product) {
        alert('Product Not Found In Menu');
        return;
    }
    
    // Update with real stock if available
    if (realStock !== null) {
        product.stock = realStock;
        updateStockDisplay(name, realStock);
    }
    
    // CHECK IF OUT OF STOCK
    if (product.stock <= 0) {
        alert(`Sorry, ${name} is out of stock!`);
        showStockRequestModal(product);
        return;
    }
    
    const existingItem = currentOrder.find(i => i.name === name);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    // Check if adding one more would exceed available stock
    if (currentQuantity >= product.stock) {
        alert(`Only ${product.stock} ${product.unit} of ${name} available in stock!`);
        return;
    }
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        currentOrder.push({ 
            name, 
            price, 
            quantity: 1, 
            stock: product.stock, 
            unit: product.unit, 
            vatable: product.vatable,
            _id: product._id,
            image: product.image 
        });
    }
    
    product.stock--;
    
    // Update display WITHOUT ANIMATION
    updateStockDisplay(name, product.stock);
    
    renderOrder();
    updateInputPaymentField();
    updatePayButtonState();
    
    console.log(`Added ${name}. Stock: ${product.stock}`);
}

function removeItemFromOrder(index) {
    const item = currentOrder[index];
    
    if (item.quantity > 1) {
        item.quantity--;
        // Update stock permanently
        const product = productCatalog.find(p => p.name === item.name);
        if (product) {
            product.stock++;
            updateStockDisplay(item.name, product.stock);
        }
    } else {
        // Update stock permanently for all items being removed
        const product = productCatalog.find(p => p.name === item.name);
        if (product) {
            product.stock += item.quantity;
            updateStockDisplay(item.name, product.stock);
        }
        currentOrder.splice(index, 1);
    }
    
    renderOrder();
    updateInputPaymentField();
    updatePayButtonState();
}

function renderOrder() {
    const list = document.getElementById('productlist');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('totals');

    if (!list) {
        console.error('productlist element not found!');
        return;
    }

    list.innerHTML = '';
    let subtotal = 0;
    let vatableAmount = 0;

    currentOrder.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        if (item.vatable) {
            vatableAmount += itemTotal;
        }

        const product = productCatalog.find(p => p.name === item.name);
        const remainingStock = product ? product.stock : 0;
        
        list.innerHTML += `
            <li>
                <div class="order-item-info">
                    <span class="order-item-name">${item.name}</span>
                    <span class="order-item-stock">Available: ${remainingStock} ${item.unit || 'left'}</span>
                </div>
                <div class="order-item-controls">
                    <span class="order-item-quantity">x${item.quantity}</span>
                    <span class="order-item-price">₱${itemTotal.toFixed(2)}</span>
                    <button onclick="removeItemFromOrder(${index})" class="remove-item-btn">✕</button>
                </div>
            </li>`;
    });

    const fixedTax = 0;
    const total = subtotal + fixedTax;

    if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = '₱0.12';
    if (totalEl) totalEl.textContent = `${total.toFixed(2)}`;
    
    updatePayButtonState();
}

// Update stock display - NO ANIMATIONS
function updateStockDisplay(productName, newStock) {
    const product = productCatalog.find(p => p.name === productName);
    if (!product) return;
    
    product.stock = newStock;
    
    // Update all instances of this product in the menu
    const menuContainer = document.getElementById('menuContainer');
    if (menuContainer) {
        const productCards = menuContainer.querySelectorAll('.compact-product-card');
        
        productCards.forEach(card => {
            const nameElement = card.querySelector('.compact-product-name');
            if (nameElement && nameElement.textContent === productName) {
                const stockElement = card.querySelector('.compact-product-stock');
                if (stockElement) {
                    // Update stock status
                    let stockStatus = '';
                    let stockClass = '';
                    
                    if (newStock <= 0) {
                        stockStatus = 'Out of Stock';
                        stockClass = 'out-stock';
                        
                        // Make card clickable for stock request
                        card.classList.add('out-of-stock');
                        card.style.cursor = 'pointer';
                        card.style.opacity = '0.8';
                        card.style.pointerEvents = 'auto';
                        card.onclick = () => showStockRequestModal(product);
                        
                        // Add request badge if not exists
                        if (!card.querySelector('.request-stock-badge')) {
                            const badge = document.createElement('div');
                            badge.className = 'request-stock-badge';
                            badge.textContent = 'Click to Request Stock';
                            card.appendChild(badge);
                        }
                    } else if (newStock <= (product.minStock || 10)) {
                        stockStatus = `${newStock} ${product.unit} left`;
                        stockClass = 'low-stock';
                        
                        // Enable the card for ordering
                        card.classList.remove('out-of-stock');
                        card.style.cursor = 'pointer';
                        card.style.opacity = '1';
                        card.style.pointerEvents = 'auto';
                        card.onclick = () => addItemToOrder(productName, product.price);
                        
                        // Remove request badge if exists
                        const badge = card.querySelector('.request-stock-badge');
                        if (badge) {
                            badge.remove();
                        }
                    } else if (newStock <= 30) {
                        stockStatus = `${newStock} ${product.unit}`;
                        stockClass = 'medium-stock';
                        
                        // Enable the card for ordering
                        card.classList.remove('out-of-stock');
                        card.style.cursor = 'pointer';
                        card.style.opacity = '1';
                        card.style.pointerEvents = 'auto';
                        card.onclick = () => addItemToOrder(productName, product.price);
                        
                        // Remove request badge if exists
                        const badge = card.querySelector('.request-stock-badge');
                        if (badge) {
                            badge.remove();
                        }
                    } else {
                        stockStatus = `${newStock} ${product.unit} available`;
                        stockClass = 'high-stock';
                        
                        // Enable the card for ordering
                        card.classList.remove('out-of-stock');
                        card.style.cursor = 'pointer';
                        card.style.opacity = '1';
                        card.style.pointerEvents = 'auto';
                        card.onclick = () => addItemToOrder(productName, product.price);
                        
                        // Remove request badge if exists
                        const badge = card.querySelector('.request-stock-badge');
                        if (badge) {
                            badge.remove();
                        }
                    }
                    
                    stockElement.textContent = stockStatus;
                    stockElement.className = `compact-product-stock ${stockClass}`;
                }
            }
        });
    }
    
    // Update order list
    updateOrderStockDisplay(productName, newStock);
}

// Update stock in order list
function updateOrderStockDisplay(productName, newStock) {
    const orderItems = document.querySelectorAll('.order-item-info');
    orderItems.forEach(item => {
        const nameElement = item.querySelector('.order-item-name');
        if (nameElement && nameElement.textContent === productName) {
            const stockElement = item.querySelector('.order-item-stock');
            if (stockElement) {
                const product = productCatalog.find(p => p.name === productName);
                if (product) {
                    stockElement.textContent = `Available: ${newStock} ${product.unit}`;
                }
            }
        }
    });
}

async function updateStockAfterPayment() {
    console.log('📦 Updating stock permanently after payment...');
    
    try {
        // Update stock on server for each sold item
        for (const orderItem of currentOrder) {
            const product = productCatalog.find(p => p.name === orderItem.name);
            
            if (!product || !product._id) {
                console.log(`Product not found or no ID: ${orderItem.name}`);
                continue;
            }
            
            // Update inventory stock on backend
            try {
                const response = await fetch(`${BACKEND_URL}/api/inventory/update-stock`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        productName: product.name,
                        quantitySold: orderItem.quantity,
                        action: 'subtract'
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        console.log(`✅ Stock updated for "${product.name}": Sold ${orderItem.quantity}`);
                    }
                } else {
                    console.warn(`⚠️ Failed to update stock for ${product.name}`);
                }
            } catch (syncError) {
                console.error(`Error updating stock for ${product.name}:`, syncError);
            }
        }
        
        console.log('✅ Stock updates completed');
        
    } catch (error) {
        console.error('Error updating stock:', error);
    }
}

function setDineIn() {
    orderType = "Dine In";
    
    const display = document.getElementById("orderTypeDisplay");
    if (display) display.textContent = orderType;
    
    const dineInBtn = document.querySelector('.dineinandtakeout-btn:nth-child(1)');
    const takeoutBtn = document.querySelector('.dineinandtakeout-btn:nth-child(2)');
    
    if (dineInBtn) dineInBtn.classList.add('active');
    if (takeoutBtn) takeoutBtn.classList.remove('active');
    
    const tableInput = document.getElementById('tableNumber');
    if (tableInput) {
        tableInput.placeholder = "Enter Table:";
        tableInput.value = '';
        tableInput.disabled = false;
    }
    
    updatePayButtonState();
}

function setTakeout() {
    orderType = "Take Out";
    
    const display = document.getElementById("orderTypeDisplay");
    if (display) display.textContent = orderType;
    
    const dineInBtn = document.querySelector('.dineinandtakeout-btn:nth-child(1)');
    const takeoutBtn = document.querySelector('.dineinandtakeout-btn:nth-child(2)');
    
    if (dineInBtn) dineInBtn.classList.remove('active');
    if (takeoutBtn) takeoutBtn.classList.add('active');
    
    const tableInput = document.getElementById('tableNumber');
    if (tableInput) {
        tableInput.value = 'Takeout';
        tableInput.disabled = true;
    }
    
    updatePayButtonState();
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method.toLowerCase();
    
    const buttons = document.querySelectorAll('.payment-method-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.backgroundColor = '';
        btn.style.color = '';
    });
    
    const clickedButton = event.currentTarget;
    
    if (clickedButton) {
        clickedButton.classList.add('active');
        clickedButton.style.backgroundColor = '#28a745';
        clickedButton.style.color = 'white';
    }
    
    updatePaymentMethodDisplay();
    updateInputPaymentField();
}

function updatePaymentMethodDisplay() {
    const displayElement = document.getElementById("paymentMethodDisplay");
    
    if (displayElement) {
        let displayText = "None";
        
        switch(selectedPaymentMethod) {
            case 'cash':
                displayText = 'Cash';
                break;
            case 'gcash':
                displayText = 'GCash';
                break;
            default:
                if (selectedPaymentMethod) {
                    displayText = selectedPaymentMethod.charAt(0).toUpperCase() + selectedPaymentMethod.slice(1);
                }
        }
        
        displayElement.textContent = displayText;
    }
}

function updateInputPaymentField() {
    const inputPayment = document.getElementById('inputPayment');
    const changeSection = document.getElementById('changeSection');
    
    if (!inputPayment) return;
    
    if (selectedPaymentMethod === 'cash' && currentOrder.length > 0) {
        inputPayment.disabled = false;
        inputPayment.placeholder = "Enter Cash Amount";
        inputPayment.value = '';
        inputPayment.oninput = calculateChange;
        
        setTimeout(() => {
            inputPayment.focus();
        }, 100);
    } else {
        inputPayment.disabled = true;
        inputPayment.placeholder = "Select Payment Method First";
        inputPayment.value = '';
        if (changeSection) changeSection.style.display = 'none';
    }
    
    updatePayButtonState();
}

function calculateChange() {
    const inputPayment = document.getElementById('inputPayment');
    const changeSection = document.getElementById('changeSection');
    const changeAmount = document.getElementById('changeAmount');
    const totalEl = document.getElementById('totals');
    
    if (!inputPayment || !changeSection || !changeAmount || !totalEl) return;
    
    const total = parseFloat(totalEl.textContent.replace('₱', '')) || 0;
    const paid = parseFloat(inputPayment.value) || 0;
    
    if (paid >= total && paid > 0) {
        const change = paid - total;
        changeAmount.textContent = change.toFixed(2);
        changeSection.style.display = 'block';
    } else {
        changeSection.style.display = 'none';
    }
    
    updatePayButtonState();
}

// Save order to MongoDB - REAL BACKEND
async function saveOrderToMongoDB(orderData) {
    try {
        console.log('💾 Saving order to real database...');
        
        const response = await fetch(`${BACKEND_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Order saved to real database:', result);
            return {
                success: true,
                orderId: result.orderId,
                orderNumber: result.orderNumber,
                customerId: result.customerId
            };
        } else {
            throw new Error(result.message || 'Failed to save order');
        }
    } catch (error) {
        console.error('❌ Error saving order to database:', error.message);
        throw error;
    }
}

async function completePayment(paymentMethod, total, paid, change, tableNumber) {
    console.log('💰 Processing payment with real backend...');
    
    // Calculate subtotal
    const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Prepare order data
    const orderData = {
        items: currentOrder.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: "Regular",
            image: item.image || 'default_food.jpg',
            id: item._id || null,
            vatable: item.vatable !== undefined ? item.vatable : true
        })),
        subtotal: subtotal,
        tax: 0,
        total: total,
        type: orderType || "Dine In",
        notes: "",
        payment: {
            method: paymentMethod,
            amountPaid: paid,
            change: change
        },
        tableNumber: tableNumber
    };
    
    console.log('📦 Order data:', orderData);
    
    try {
        // 1. Save to real database
        const saved = await saveOrderToMongoDB(orderData);
        
        if (saved.success) {
            // 2. PERMANENTLY update stock on server
            await updateStockAfterPayment();
            
            // 3. Print receipt
            await printReceipt({
                ...orderData,
                orderNumber: saved.orderNumber,
                tableNumber: tableNumber,
                paymentMethod: paymentMethod,
                amountPaid: paid,
                change: change,
                vatAmount: 0,
                vatableAmount: subtotal,
                customerId: saved.customerId
            });
            
            // 4. Show success message
            showSuccessMessage(saved.orderNumber, total);
            
            // 5. Reset UI
            resetOrderUI();
            
        } else {
            throw new Error('Failed to save order');
        }
    } catch (error) {
        console.error('❌ Error in completePayment:', error.message);
        alert(`❌ Payment failed: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. You are logged in\n3. Database connection is working`);
    }
}

// Show success message
function showSuccessMessage(orderNumber, total) {
    const successHTML = `
    <div id="successMessage" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    ">
        <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: fadeIn 0.5s;
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: #28a745;
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <i class="fas fa-check" style="color: white; font-size: 40px;"></i>
            </div>
            
            <h2 style="color: #28a745; margin-bottom: 10px;">Payment Successful!</h2>
            <p style="color: #666; margin-bottom: 20px;">Order has been completed successfully.</p>
            
            <div style="
                background: #f8f9fa;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 25px;
            ">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #666;">Order #:</span>
                    <span style="font-weight: bold; color: #333;">${orderNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #666;">Total Amount:</span>
                    <span style="font-weight: bold; color: #333; font-size: 18px;">₱${total.toFixed(2)}</span>
                </div>
            </div>
            
            <button onclick="closeSuccessMessage()" style="
                width: 100%;
                padding: 12px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.3s;
            " onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">
                OK
            </button>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
}

function closeSuccessMessage() {
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
        successMsg.remove();
    }
}

// MAIN PAYMENT FUNCTION
function Payment() {
    console.log('=== PAYMENT PROCESS STARTED ===');
    
    if (!Array.isArray(currentOrder) || currentOrder.length === 0) {
        alert("Please Add Product First");
        return;
    }
    
    if (!orderType || orderType.trim() === '' || orderType === "None") {
        alert("Please Choose if Dine or Take Out");
        return;
    }
    
    if (!selectedPaymentMethod || selectedPaymentMethod.trim() === '') {
        alert("Please Select a payment method");
        return;
    }
    
    if (orderType === "Dine In") {
        const tableInput = document.getElementById('tableNumber');
        if (!tableInput || !tableInput.value.trim()) {
            alert("Please Enter table number");
            tableInput?.focus();
            return;
        }
    }
    
    // Show confirmation modal
    showOrderConfirmation();
}

function resetOrderUI() {
    // Clear current order
    currentOrder = [];
    
    renderOrder();
    
    // Refresh menu to get fresh stock data from server
    loadAllMenuItems();
    
    // Set order type back to "None"
    setOrderTypeNone();
    
    const paymentMethodDisplayEl = document.getElementById("paymentMethodDisplay");
    if (paymentMethodDisplayEl) {
        paymentMethodDisplayEl.textContent = "None";
    }
    
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.backgroundColor = '';
        btn.style.color = '';
    });
    
    const tableInput = document.getElementById('tableNumber');
    if (tableInput) {
        tableInput.value = '';
        tableInput.disabled = false;
        tableInput.placeholder = "Enter table #";
    }
    
    const inputPayment = document.getElementById('inputPayment');
    if (inputPayment) {
        inputPayment.value = '';
        inputPayment.disabled = true;
        inputPayment.placeholder = "Select payment method first";
    }
    
    const changeSection = document.getElementById('changeSection');
    if (changeSection) changeSection.style.display = 'none';
    
    selectedPaymentMethod = null;
    
    updatePayButtonState();
    
    console.log('UI reset successfully');
}

function printReceipt(orderData) {
    return new Promise((resolve) => {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const timeString = now.toLocaleTimeString('en-PH', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const companyName = "GRAY COUNTRYSIDE CAFE";
        const storeLocation = "JD Building, Crossing, Norzagaray, Bulacan, Norzagaray, Philippines, 3013";
        const tinNumber = "XXX-XXX-XXX-XXX";
        const posSerial = "POS001";
        const minNumber = now.getTime().toString().slice(-15);
        const cashier = "CASHIER001";
        
        const invoiceNumber = `SI-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`;
        const transactionNumber = `TRX-${now.getTime().toString().slice(-8)}`;
        
        const totalQuantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = orderData.subtotal;
        const totalDue = orderData.total;
        
        let itemsHTML = '';
        currentOrder.forEach(item => {
            const itemTotal = item.price * item.quantity;
            itemsHTML += `
                <div class="item-row">
                    <div class="item-left">
                        <span class="item-name">${item.name}</span>
                    </div>
                    <div class="item-right">
                        <span class="item-price">${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
            `;
        });
        
        itemsHTML += `
            <div class="divider">---</div>
            
            <div class="subtotal-row">
                <span>SUB-TOTAL</span>
                <span>PHP ${subtotal.toFixed(2)}</span>
            </div>
            
            <div class="divider">---</div>
            
            <div class="total-due-row">
                <span>TOTAL DUE</span>
                <span>PHP ${totalDue.toFixed(2)}</span>
            </div>
        `;
        
        // Calculate VAT
        const vatableSales = orderData.vatableAmount || subtotal;
        const vatAmount = vatableSales > 0 ? vatableSales * 0.12 : 0.00;
        
        // VAT breakdown
        let vatHTML = '';
        if (vatableSales > 0) {
            vatHTML = `
                <div class="vat-breakdown">
                    <div class="vat-row">
                        <span>VATable Sales</span>
                        <span>${vatableSales.toFixed(2)}</span>
                    </div>
                    <div class="vat-row">
                        <span>VAT Amount (12%)</span>
                        <span>${vatAmount.toFixed(2)}</span>
                    </div>
                </div>
            `;
        } else {
            vatHTML = `
                <div class="vat-breakdown">
                    <div class="vat-row">
                        <span>VATable Sales</span>
                        <span>0.00</span>
                    </div>
                    <div class="vat-row">
                        <span>VAT Amount (12%)</span>
                        <span>0.00</span>
                    </div>
                </div>
            `;
        }

        const receiptContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>POS RECEIPT</title>
        <meta charset="UTF-8">
        <style>
            @media print {
                @page {
                    size: 80mm auto;
                    margin: 0;
                    padding: 0;
                }
                
                body {
                    width: 76mm;
                    margin: 0 auto;
                    padding: 1mm;
                    font-family: 'Courier New', monospace;
                    font-size: 9px;
                    line-height: 1.2;
                    background: white;
                    letter-spacing: -0.5px;
                }
                
                .no-print {
                    display: none !important;
                }
            }
            
            @media screen {
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 9px;
                    line-height: 1.2;
                    width: 76mm;
                    margin: 20px auto;
                    padding: 5mm;
                    border: 1px solid #ccc;
                    background: white;
                    letter-spacing: -0.5px;
                }
            }
            
            .receipt {
                width: 100%;
                max-width: 76mm;
            }
            
            .header {
                text-align: center;
                margin-bottom: 2px;
            }
            
            .company-name {
                font-weight: bold;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 1px;
            }
            
            .store-location {
                font-size: 8px;
                line-height: 1;
                margin: 1px 0;
            }
            
            .tin-info {
                font-size: 8px;
                margin: 2px 0;
                text-align: center;
                line-height: 1;
            }
            
            .receipt-title {
                text-align: center;
                font-size: 9px;
                font-weight: bold;
                margin: 3px 0;
            }
            
            .invoice-info {
                font-size: 8px;
                margin: 2px 0;
                text-align: center;
                line-height: 1;
            }
            
            .date-time {
                text-align: center;
                font-size: 8px;
                margin: 2px 0;
                line-height: 1;
            }
            
            .divider {
                text-align: center;
                margin: 2px 0;
                border-top: 1px dashed #000;
                border-bottom: 1px dashed #000;
                padding: 1px 0;
            }
            
            .order-type {
                text-align: center;
                font-size: 8px;
                margin: 2px 0;
                line-height: 1;
            }
            
            .items-list {
                margin: 3px 0;
            }
            
            .item-row {
                margin: 1px 0;
                line-height: 1.1;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            
            .item-left {
                flex: 1;
                display: flex;
                align-items: flex-start;
            }
            
            .item-right {
                flex-shrink: 0;
                text-align: right;
            }
            
            .item-name {
                display: inline-block;
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .item-price {
                display: inline-block;
                min-width: 25px;
                text-align: right;
            }
            
            .subtotal-row {
                margin-top: 3px;
                padding-top: 2px;
                font-size: 8px;
                line-height: 1.1;
                display: flex;
                justify-content: space-between;
            }
            
            .total-due-row {
                margin-top: 2px;
                font-size: 9px;
                font-weight: bold;
                line-height: 1.1;
                display: flex;
                justify-content: space-between;
            }
            
            .payment-method {
                font-size: 8px;
                margin: 2px 0;
                text-align: center;
                line-height: 1;
            }
            
            .vat-breakdown {
                font-size: 8px;
                margin: 3px 0;
                padding-top: 2px;
                border-top: 1px dashed #000;
            }
            
            .vat-row {
                margin: 1px 0;
                display: flex;
                justify-content: space-between;
            }
            
            .footer {
                text-align: center;
                font-size: 7px;
                margin-top: 5px;
                padding-top: 3px;
                border-top: 1px solid #000;
                line-height: 1;
            }
            
            .thank-you {
                text-align: center;
                font-size: 8px;
                font-weight: bold;
                margin: 3px 0;
                line-height: 1;
            }
            
            .print-btn {
                display: block;
                width: 100%;
                padding: 8px;
                margin-top: 10px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 11px;
            }
            
            .print-btn:hover {
                background: #0056b3;
            }
            
            .close-btn {
                display: block;
                width: 100%;
                padding: 8px;
                margin-top: 5px;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 11px;
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="header">
                <div class="company-name">${companyName}</div>
                <div class="store-location">${storeLocation}</div>
            </div>
            
            <div class="tin-info">
                TIN: ${tinNumber}<br>
                POS: ${posSerial}<br>
                MIN#: ${minNumber}
            </div>
            
            <div class="receipt-title">RECEIPT</div>
            
            <div class="invoice-info">
                Trans# ${transactionNumber}<br>
                Cashier: ${cashier}
            </div>
            
            <div class="date-time">
                ${dateString} ${timeString} #02
            </div>
            
            <div class="divider">
                ---
            </div>
            
            <div class="order-type">
                ${orderData.type || 'DINE-IN'} ${orderData.tableNumber ? `(Table: ${orderData.tableNumber})` : ''}
            </div>
            
            <div class="items-list">
                ${itemsHTML}
            </div>
            
            <div class="payment-method">
                ${orderData.paymentMethod.toUpperCase()} ${orderData.amountPaid.toFixed(2)}
            </div>
            
            ${orderData.change > 0 ? `
                <div class="subtotal-row">
                    <span>CHANGE</span>
                    <span>PHP ${orderData.change.toFixed(2)}</span>
                </div>
            ` : ''}
            
            ${vatHTML}
            
            <div class="thank-you">
                THANK YOU. PLEASE COME AGAIN.
            </div>
            
            <div class="footer">
                ${dateString.replace(/\//g, '').replace(/(\d{2})(\d{2})(\d{4})/, '$3$1$2')}-${timeString}-00000<br>
            </div>
            
            <button class="print-btn no-print" onclick="window.print()">Print Receipt</button>
            <button class="close-btn no-print" onclick="window.close()">Close Window</button>
        </div>
        
        <script>
            setTimeout(function() {
                try {
                    window.print();
                } catch(e) {
                    console.log('Print failed:', e);
                }
            }, 500);
        </script>
    </body>
    </html>
    `;
        
        try {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.name = 'receiptFrame';
            document.body.appendChild(iframe);
            
            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(receiptContent);
            iframeDoc.close();
            
            setTimeout(() => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (printError) {
                    console.log('Iframe print failed:', printError);
                }
                
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                    resolve();
                }, 1000);
            }, 500);
            
        } catch (error) {
            console.log('Print failed:', error);
            resolve();
        }
    });
}

function clearCurrentOrder() {
    if (currentOrder.length === 0) {
        alert("No items to clear");
        return;
    }
    
    if (confirm(`Clear current order with ${currentOrder.length} item(s)?`)) {
        // Restore stock for all items in the current order
        currentOrder.forEach(orderItem => {
            const product = productCatalog.find(p => p.name === orderItem.name);
            if (product) {
                product.stock += orderItem.quantity;
                updateStockDisplay(product.name, product.stock);
            }
        });
        
        currentOrder = [];
        renderOrder();
        
        const inputPayment = document.getElementById('inputPayment');
        if (inputPayment) {
            inputPayment.value = '';
        }
        
        const changeSection = document.getElementById('changeSection');
        if (changeSection) {
            changeSection.style.display = 'none';
        }
        
        alert("Order cleared successfully");
        updatePayButtonState();
    }
}

function filterCategory(category) {
    const categoryMapping = {
        'all': 'all',
        'Rice Bowl Meals': 'Rice Bowl Meals',
        'Hot Sizzlers': 'Hot Sizzlers',
        'Party Tray': 'Party Tray',
        'Drinks': 'Drinks',
        'Coffee': 'Coffee',
        'Milk Tea': 'Milk Tea',
        'Frappe': 'Frappe',
        'Snacks & Appetizer': 'Snacks & Appetizer',
        'Budget Meals Served with Rice': 'Budget Meals Served with Rice',
        'Specialties': 'Specialties'
    };
    
    const actualCategory = categoryMapping[category] || category;
    currentCategory = actualCategory;
    console.log(`Filtering category: ${category} -> ${actualCategory}`);
    renderMenu();
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        const btnCategory = btn.getAttribute('data-category');
        if (btnCategory === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function showOrderConfirmation() {
    const orderTypeText = document.getElementById('orderTypeDisplay').textContent;
    const paymentMethodText = document.getElementById('paymentMethodDisplay').textContent;
    const total = parseFloat(document.getElementById('totals').textContent) || 0;
    const tableInput = document.getElementById('tableNumber');
    const tableNumber = tableInput ? tableInput.value : 'N/A';
    
    const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Get payment amount if cash
    let cashAmount = 0;
    let change = 0;
    if (paymentMethodText === 'Cash') {
        const inputPayment = document.getElementById('inputPayment');
        cashAmount = inputPayment ? parseFloat(inputPayment.value) || 0 : 0;
        change = cashAmount - total;
    }
    
    // Generate a unique ID for this modal instance
    const modalId = 'simpleOrderPopup_' + Date.now();
    
    const popupHTML = `
    <div id="${modalId}" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    ">
        <div style="
            background: white;
            padding: 25px;
            border-radius: 10px;
            width: 90%;
            max-width: 450px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                border-bottom: 2px solid #374151;
                padding-bottom: 10px;
            ">
                <h2 style="margin: 0; color: #374151;">Order Confirmation</h2>
                <button onclick="closeSimplePopup('${modalId}')" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                ">×</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <small style="color: #666;">Order Type</small>
                        <div style="font-weight: bold;">${orderTypeText}</div>
                    </div>
                    <div>
                        <small style="color: #666;">Payment Method</small>
                        <div style="font-weight: bold;">${paymentMethodText}</div>
                    </div>
                </div>
                
                ${tableNumber !== 'N/A' && tableNumber !== '' && tableNumber !== 'Takeout' ? `
                <div style="margin-bottom: 10px;">
                    <small style="color: #666;">Table Number</small>
                    <div style="font-weight: bold;">${tableNumber}</div>
                </div>
                ` : ''}
                
                <div style="
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 15px 0;
                    max-height: 200px;
                    overflow-y: auto;
                ">
                    <h4 style="margin: 0 0 10px 0; color: #374151;">Order Items</h4>
                    ${currentOrder.map(item => `
                        <div style="display: flex; justify-content: space-between; margin: 5px 0; padding-bottom: 5px; border-bottom: 1px solid #eee;">
                            <span>${item.name} x${item.quantity}</span>
                            <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    
                    <div style="margin-top: 15px; padding-top: 10px; border-top: 2px solid #ddd;">
                        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                            <span>Subtotal:</span>
                            <span>₱${subtotal.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                            <span>Tax:</span>
                            <span>₱0.12</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                            <span>Total Amount:</span>
                            <span style="font-weight: bold; font-size: 18px;">₱${total.toFixed(2)}</span>
                        </div>
                        
                        ${paymentMethodText === 'Cash' ? `
                            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                <span>Amount Paid:</span>
                                <span>₱${cashAmount.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                <span>Change:</span>
                                <span style="font-weight: bold; color: #28a745;">₱${change.toFixed(2)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="closeSimplePopup('${modalId}')" style="
                    flex: 1;
                    padding: 12px;
                    background: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    color: #666;
                ">Cancel</button>
                <button onclick="processConfirmedOrder('${modalId}')" style="
                    flex: 1;
                    padding: 12px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Confirm & Process</button>
            </div>
            
            <div style="
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #eee;
                text-align: center;
                color: #888;
                font-size: 12px;
            ">
                © 2026 Complete Menu POS System - ALL PRODUCTS DISPLAYED
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
}

function closeSimplePopup(modalId) {
    const popup = document.getElementById(modalId);
    if (popup) {
        popup.remove();
    }
}

function processConfirmedOrder(modalId) {
    const orderTypeDisplay = document.getElementById('orderTypeDisplay').textContent;
    const paymentMethodDisplay = document.getElementById('paymentMethodDisplay').textContent;
    const total = parseFloat(document.getElementById('totals').textContent) || 0;
    const tableInput = document.getElementById('tableNumber');
    const tableNumber = tableInput ? tableInput.value : 'N/A';
    
    // Close popup first
    closeSimplePopup(modalId);
    
    if (paymentMethodDisplay === 'Cash') {
        const inputPayment = document.getElementById('inputPayment');
        const cashAmount = inputPayment ? parseFloat(inputPayment.value) || 0 : 0;
        
        if (cashAmount < total) {
            alert(`Insufficient payment. Total: ₱${total.toFixed(2)} | Paid: ₱${cashAmount.toFixed(2)}`);
            return;
        }
        
        const change = cashAmount - total;
        
        // Process cash payment
        completePayment('cash', total, cashAmount, change, tableNumber);
        
    } else if (paymentMethodDisplay === 'GCash') {
        // Process GCash payment
        completePayment('gcash', total, total, 0, tableNumber);
        
    } else {
        alert(`Unsupported payment method: ${paymentMethodDisplay}`);
    }
}

// Setup category button listeners
function setupCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            renderMenu();
        });
    });
}

// Add stock management buttons to the interface
function addStockManagementButtons() {
    // Check if buttons already exist
    if (document.getElementById('stockManagementButtons')) return;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'stockManagementButtons';
    buttonContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 1000;
    `;
    
    const viewStockBtn = document.createElement('button');
    viewStockBtn.innerHTML = `<i class="fas fa-boxes"></i> View Stock`;
    viewStockBtn.style.cssText = `
        padding: 12px 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        transition: all 0.3s ease;
    `;
    viewStockBtn.onmouseenter = () => {
        viewStockBtn.style.transform = 'translateY(-2px)';
        viewStockBtn.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
    };
    viewStockBtn.onmouseleave = () => {
        viewStockBtn.style.transform = 'translateY(0)';
        viewStockBtn.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
    };
    viewStockBtn.onclick = showViewStockModal;
    
    const viewRequestsBtn = document.createElement('button');
    viewRequestsBtn.innerHTML = `<i class="fas fa-clipboard-list"></i> My Requests`;
    viewRequestsBtn.style.cssText = `
        padding: 12px 20px;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        transition: all 0.3s ease;
    `;
    viewRequestsBtn.onmouseenter = () => {
        viewRequestsBtn.style.transform = 'translateY(-2px)';
        viewRequestsBtn.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
    };
    viewRequestsBtn.onmouseleave = () => {
        viewRequestsBtn.style.transform = 'translateY(0)';
        viewRequestsBtn.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
    };
    viewRequestsBtn.onclick = showMyStockRequests;
    
    buttonContainer.appendChild(viewStockBtn);
    buttonContainer.appendChild(viewRequestsBtn);
    document.body.appendChild(buttonContainer);
}

// Show View Stock Modal
function showViewStockModal() {
    // Calculate stock statistics
    const totalProducts = productCatalog.length;
    const outOfStockItems = productCatalog.filter(p => p.stock <= 0);
    const lowStockItems = productCatalog.filter(p => {
        const minStock = p.minStock || 10;
        return p.stock > 0 && p.stock <= minStock;
    });
    const goodStockItems = productCatalog.filter(p => p.stock > 10);
    
    const modalHTML = `
    <div id="viewStockModal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    ">
        <div style="
            background: white;
            padding: 25px;
            border-radius: 12px;
            width: 90%;
            max-width: 800px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #4f46e5;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-clipboard-list" style="font-size: 24px; color: #4f46e5;"></i>
                    <h2 style="margin: 0; color: #374151; font-size: 20px;">Current Stock Levels</h2>
                </div>
                <button onclick="closeViewStockModal()" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                    padding: 8px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div style="margin-bottom: 25px;">
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 25px;
                ">
                    <div style="
                        padding: 20px;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                        border-left: 4px solid #ef4444;
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    ">
                        <div style="
                            width: 50px;
                            height: 50px;
                            border-radius: 10px;
                            background: #fecaca;
                            color: #dc2626;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                        ">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div>
                            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Out of Stock</div>
                            <div style="font-size: 28px; font-weight: 700; color: #dc2626; margin-bottom: 2px;">${outOfStockItems.length}</div>
                            <div style="font-size: 12px; color: #9ca3af;">Items</div>
                        </div>
                    </div>
                    
                    <div style="
                        padding: 20px;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                        border-left: 4px solid #f59e0b;
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    ">
                        <div style="
                            width: 50px;
                            height: 50px;
                            border-radius: 10px;
                            background: #fde68a;
                            color: #d97706;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                        ">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Low Stock</div>
                            <div style="font-size: 28px; font-weight: 700; color: #d97706; margin-bottom: 2px;">${lowStockItems.length}</div>
                            <div style="font-size: 12px; color: #9ca3af;">Items</div>
                        </div>
                    </div>
                    
                    <div style="
                        padding: 20px;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                        border-left: 4px solid #10b981;
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    ">
                        <div style="
                            width: 50px;
                            height: 50px;
                            border-radius: 10px;
                            background: #bbf7d0;
                            color: #059669;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                        ">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div>
                            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Good Stock</div>
                            <div style="font-size: 28px; font-weight: 700; color: #059669; margin-bottom: 2px;">${goodStockItems.length}</div>
                            <div style="font-size: 12px; color: #9ca3af;">Items</div>
                        </div>
                    </div>
                    
                    <div style="
                        padding: 20px;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                        border-left: 4px solid #0ea5e9;
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    ">
                        <div style="
                            width: 50px;
                            height: 50px;
                            border-radius: 10px;
                            background: #bae6fd;
                            color: #0284c7;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                        ">
                            <i class="fas fa-box"></i>
                        </div>
                        <div>
                            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Total Products</div>
                            <div style="font-size: 28px; font-weight: 700; color: #0284c7; margin-bottom: 2px;">${totalProducts}</div>
                            <div style="font-size: 12px; color: #9ca3af;">Menu Items</div>
                        </div>
                    </div>
                </div>
                
                <div style="
                    margin-top: 20px;
                    max-height: 400px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                ">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead style="background: #f9fafb; position: sticky; top: 0;">
                            <tr>
                                <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Product</th>
                                <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Category</th>
                                <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Current Stock</th>
                                <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Status</th>
                                <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productCatalog.map(product => {
                                const minStock = product.minStock || 10;
                                let status = '';
                                let statusClass = '';
                                
                                if (product.stock <= 0) {
                                    status = 'OUT OF STOCK';
                                    statusClass = 'background: #fef2f2; color: #dc2626;';
                                } else if (product.stock <= minStock) {
                                    status = 'LOW STOCK';
                                    statusClass = 'background: #fffbeb; color: #d97706;';
                                } else {
                                    status = 'GOOD';
                                    statusClass = 'background: #f0fdf4; color: #059669;';
                                }
                                
                                const actionButton = product.stock <= 0 
                                    ? `<button onclick="showStockRequestModal(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                                         style="
                                            padding: 6px 12px;
                                            background: #dc2626;
                                            color: white;
                                            border: none;
                                            border-radius: 6px;
                                            font-size: 12px;
                                            font-weight: 600;
                                            cursor: pointer;
                                            display: flex;
                                            align-items: center;
                                            gap: 4px;
                                         ">
                                          <i class="fas fa-paper-plane"></i> Request
                                        </button>`
                                    : '<span style="color: #6b7280;">-</span>';
                                
                                return `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding: 16px 12px; vertical-align: top;">
                                        <div style="font-weight: 500; color: #374151; margin-bottom: 4px;">${product.name}</div>
                                        <div style="font-size: 12px; color: #6b7280;">Unit: ${product.unit}</div>
                                    </td>
                                    <td style="padding: 16px 12px; color: #4b5563;">${product.category}</td>
                                    <td style="padding: 16px 12px;">
                                        <div style="display: flex; align-items: baseline; gap: 4px;">
                                            <span style="font-weight: 700; color: #1f2937; font-size: 16px;">${product.stock}</span>
                                            <span style="color: #6b7280; font-size: 12px;">${product.unit}</span>
                                        </div>
                                    </td>
                                    <td style="padding: 16px 12px;">
                                        <span style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; ${statusClass}">
                                            ${status}
                                        </span>
                                    </td>
                                    <td style="padding: 16px 12px;">
                                        ${actionButton}
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="
                display: flex;
                justify-content: space-between;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
            ">
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px;">
                    <i class="fas fa-sync-alt" style="color: #9ca3af;"></i>
                    Last updated: ${new Date().toLocaleTimeString()}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="closeViewStockModal()" style="
                        padding: 12px 24px;
                        background: #f3f4f6;
                        color: #374151;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                    ">
                        Close
                    </button>
                    <button onclick="loadAllMenuItems(); closeViewStockModal();" style="
                        padding: 12px 24px;
                        background: #4f46e5;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-redo"></i> Refresh
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeViewStockModal() {
    const modal = document.getElementById('viewStockModal');
    if (modal) {
        modal.remove();
    }
}

// Show my stock requests
async function showMyStockRequests() {
    try {
        // Fetch stock requests from backend
        const response = await fetch(`${BACKEND_URL}/api/stock-requests/my-requests`, {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        let requests = [];
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                requests = result.data;
            }
        }
        
        // Create modal
        const modalHTML = `
        <div id="myRequestsModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 25px;
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #8b5cf6;
                ">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-clipboard-check" style="font-size: 24px; color: #8b5cf6;"></i>
                        <h2 style="margin: 0; color: #374151; font-size: 20px;">My Stock Requests</h2>
                    </div>
                    <button onclick="closeMyRequestsModal()" style="
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        color: #666;
                        padding: 8px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="margin-bottom: 25px;">
                    ${requests.length === 0 ? `
                        <div style="
                            text-align: center;
                            padding: 40px 20px;
                            color: #6b7280;
                        ">
                            <i class="fas fa-inbox" style="font-size: 48px; color: #d1d5db; margin-bottom: 20px;"></i>
                            <h3 style="margin: 0 0 10px 0; color: #374151;">No Requests Yet</h3>
                            <p style="margin: 0; color: #6b7280;">You haven't made any stock requests.</p>
                            <p style="margin: 10px 0 0 0; color: #6b7280;">Click on out-of-stock items to request stock.</p>
                        </div>
                    ` : `
                        <div style="
                            margin-top: 20px;
                            max-height: 400px;
                            overflow-y: auto;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                        ">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <thead style="background: #f9fafb; position: sticky; top: 0;">
                                    <tr>
                                        <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Product</th>
                                        <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                                        <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Priority</th>
                                        <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Date</th>
                                        <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${requests.map(request => {
                                        let statusClass = '';
                                        let statusIcon = '';
                                        let priorityClass = '';
                                        
                                        switch(request.status) {
                                            case 'pending':
                                                statusClass = 'background: #fffbeb; color: #d97706;';
                                                statusIcon = 'fas fa-clock';
                                                break;
                                            case 'approved':
                                                statusClass = 'background: #f0fdf4; color: #059669;';
                                                statusIcon = 'fas fa-check-circle';
                                                break;
                                            case 'rejected':
                                                statusClass = 'background: #fef2f2; color: #dc2626;';
                                                statusIcon = 'fas fa-times-circle';
                                                break;
                                            case 'fulfilled':
                                                statusClass = 'background: #e0f2fe; color: #0284c7;';
                                                statusIcon = 'fas fa-check-double';
                                                break;
                                            default:
                                                statusClass = 'background: #f3f4f6; color: #6b7280;';
                                                statusIcon = 'fas fa-question-circle';
                                        }
                                        
                                        switch(request.priority) {
                                            case 'low':
                                                priorityClass = 'background: #f0fdf4; color: #059669;';
                                                break;
                                            case 'medium':
                                                priorityClass = 'background: #fffbeb; color: #d97706;';
                                                break;
                                            case 'high':
                                                priorityClass = 'background: #fef2f2; color: #dc2626;';
                                                break;
                                            default:
                                                priorityClass = 'background: #f3f4f6; color: #6b7280;';
                                        }
                                        
                                        const date = new Date(request.requestDate).toLocaleDateString('en-PH', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                        
                                        return `
                                        <tr style="border-bottom: 1px solid #f3f4f6;">
                                            <td style="padding: 16px 12px; vertical-align: top;">
                                                <div style="font-weight: 500; color: #374151; margin-bottom: 4px;">${request.productName}</div>
                                            </td>
                                            <td style="padding: 16px 12px; color: #4b5563;">
                                                <span style="font-weight: 700; color: #1f2937;">${request.requestedQuantity}</span>
                                            </td>
                                            <td style="padding: 16px 12px;">
                                                <span style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; ${priorityClass}">
                                                    ${request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                                                </span>
                                            </td>
                                            <td style="padding: 16px 12px; color: #4b5563;">
                                                ${date}
                                            </td>
                                            <td style="padding: 16px 12px;">
                                                <span style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; ${statusClass}">
                                                    <i class="${statusIcon}" style="margin-right: 4px;"></i>
                                                    ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                ">
                    <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px;">
                        <i class="fas fa-history" style="color: #9ca3af;"></i>
                        Showing ${requests.length} request(s)
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="closeMyRequestsModal()" style="
                            padding: 12px 24px;
                            background: #f3f4f6;
                            color: #374151;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                        ">
                            Close
                        </button>
                        <button onclick="showMyStockRequests()" style="
                            padding: 12px 24px;
                            background: #8b5cf6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <i class="fas fa-redo"></i> Refresh
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error('Error loading stock requests:', error);
        
        // Show error modal
        const errorModalHTML = `
        <div id="myRequestsModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 25px;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                text-align: center;
            ">
                <div style="margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f59e0b; margin-bottom: 20px;"></i>
                    <h2 style="margin: 0 0 10px 0; color: #374151;">Error Loading Requests</h2>
                    <p style="color: #6b7280;">Unable to load your stock requests. Please try again later.</p>
                </div>
                <button onclick="closeMyRequestsModal()" style="
                    padding: 12px 24px;
                    background: #f3f4f6;
                    color: #374151;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                ">
                    Close
                </button>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorModalHTML);
    }
}

function closeMyRequestsModal() {
    const modal = document.getElementById('myRequestsModal');
    if (modal) {
        modal.remove();
    }
}

// Add CSS for stock request feature
document.head.insertAdjacentHTML('beforeend', `
<style>
    .compact-product-stock {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 3px;
        display: inline-block;
        margin-top: 5px;
    }
    
    .high-stock {
        color: #28a745;
        background-color: rgba(40, 167, 69, 0.1);
    }
    
    .medium-stock {
        color: #ffc107;
        background-color: rgba(255, 193, 7, 0.1);
    }
    
    .low-stock {
        color: #fd7e14;
        background-color: rgba(253, 126, 20, 0.1);
    }
    
    .out-stock {
        color: #dc3545;
        background-color: rgba(220, 53, 69, 0.1);
    }
    
    .out-of-stock {
        position: relative;
        opacity: 0.8;
        filter: grayscale(30%);
    }
    
    .out-of-stock img {
        filter: grayscale(30%);
    }
    
    .request-stock-badge {
        position: absolute;
        top: 5px;
        right: 5px;
        background: #dc2626;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 9px;
        font-weight: bold;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
        }
        70% {
            box-shadow: 0 0 0 5px rgba(220, 38, 38, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
        }
    }
    
    .out-of-stock:hover {
        transform: translateY(-2px);
        transition: transform 0.2s ease;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
    }
</style>
`);

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key closes modals
    if (event.key === 'Escape') {
        closeViewStockModal();
        const simplePopup = document.querySelector('[id^="simpleOrderPopup_"]');
        if (simplePopup) simplePopup.remove();
        closeSuccessMessage();
        closeStockRequestModal();
        closeStockRequestSuccess();
        closeMyRequestsModal();
    }
    
    // F5 to refresh data
    if (event.key === 'F5') {
        event.preventDefault();
        loadAllMenuItems();
    }
});

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const viewModal = document.getElementById('viewStockModal');
    const orderPopup = document.querySelector('[id^="simpleOrderPopup_"]');
    const successMsg = document.getElementById('successMessage');
    const stockRequestModal = document.getElementById('stockRequestModal');
    const stockRequestSuccess = document.getElementById('stockRequestSuccess');
    const myRequestsModal = document.getElementById('myRequestsModal');
    
    if (viewModal && event.target === viewModal) {
        closeViewStockModal();
    }
    
    if (orderPopup && event.target === orderPopup) {
        orderPopup.remove();
    }
    
    if (successMsg && event.target === successMsg) {
        closeSuccessMessage();
    }
    
    if (stockRequestModal && event.target === stockRequestModal) {
        closeStockRequestModal();
    }
    
    if (stockRequestSuccess && event.target === stockRequestSuccess) {
        closeStockRequestSuccess();
    }
    
    if (myRequestsModal && event.target === myRequestsModal) {
        closeMyRequestsModal();
    }
});