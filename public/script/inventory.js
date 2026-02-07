// ==================== UI ELEMENTS ====================
const elements = {
    // Modal elements
    itemModal: document.getElementById('itemModal'),
    modalTitle: document.getElementById('modalTitle'),
    itemForm: document.getElementById('itemForm'),
    closeModal: document.getElementById('closeModal'),
    
    // Form fields
    itemId: document.getElementById('itemId'),
    itemName: document.getElementById('itemName'),
    itemType: document.getElementById('itemTypes'),
    itemCategory: document.getElementById('itemCategories'),
    itemUnit: document.getElementById('itemUnit'),
    currentStock: document.getElementById('currentStock'),
    minStock: document.getElementById('minStock'),
    maxStock: document.getElementById('maxStock'),
    description: document.getElementById('description'),
    
    // Buttons
    addNewItem: document.getElementById('addNewItem'),
    saveItemBtn: document.getElementById('saveItemBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    refreshDashboard: document.getElementById('refreshDashboard'),
    markAllRestocked: document.getElementById('markAllRestocked'),
    bulkOrder: document.getElementById('bulkOrder'),
    syncAllBtn: document.getElementById('syncAllBtn'),
    showMappingsBtn: document.getElementById('showMappingsBtn'),
    clearAllDataBtn: document.getElementById('clearAllDataBtn'),
    
    // Grid containers
    inventoryGrid: document.getElementById('inventoryGrid'),
    dashboardGrid: document.getElementById('dashboardGrid'),
    restockGrid: document.getElementById('restockGrid'),
    
    // Dashboard stats
    totalItems: document.getElementById('totalItems'),
    lowStock: document.getElementById('lowStock'),
    outOfStock: document.getElementById('outOfStock'),
    totalProducts: document.getElementById('totalProducts'),
    inventoryValue: document.getElementById('inventoryValue'),
    
    // Navigation
    navLinks: document.querySelectorAll('.nav-link[data-section]'),
    categoryItems: document.querySelectorAll('.category-item[data-category]'),
    
    // Info displays
    rawIngredientsList: document.getElementById('rawIngredientsList'),
    mappingStatus: document.getElementById('mappingStatus'),
    recipeInfo: document.getElementById('recipeInfo'),
    
    // Search
    searchInput: document.getElementById('searchInventory')
};

// ==================== INVENTORY DATA CONFIGURATION ====================
const validRawIngredients = {
    'Pork slices': 'meat',
    'Pork belly': 'meat',
    'Chicken': 'meat',
    'Ground pork': 'meat',
    'Cream dory fillet': 'seafood',
    'Shrimp': 'seafood',
    'Beef shanks and marrow': 'meat',
    'Pork face & ears': 'meat',
    'Liver': 'meat',
    'Pork chop': 'meat',
    'Bagnet': 'meat',
    'Pork ribs': 'meat',
    'Hotdogs': 'meat',
    'Bacon': 'meat',
    'Ham': 'meat',
    'Smoked fish (tinapa)': 'seafood',
    'Dried fish (tuyo)': 'seafood',
    
    'Butter': 'dairy',
    'Eggs': 'dairy',
    'Milk': 'dairy',
    'Cheese': 'dairy',
    'Grated cheese': 'dairy',
    'Mayonnaise': 'dairy',
    'Whipped cream': 'dairy',
    'Cream cheese': 'dairy',
    'Non-dairy creamer': 'dairy',
    'Sour cream': 'dairy',
    
    'Garlic': 'produce',
    'Onion': 'produce',
    'Green onions': 'produce',
    'Carrots': 'produce',
    'Cabbage': 'produce',
    'Tomato': 'produce',
    'Eggplant': 'produce',
    'Cucumber': 'produce',
    'Lettuce': 'produce',
    'Celery': 'produce',
    'Green beans': 'produce',
    'Spring onions': 'produce',
    'Chili peppers': 'produce',
    'Long green chili (siling haba)': 'produce',
    'Jalapeños': 'produce',
    'Potato strips': 'produce',
    'Corn on the cob': 'produce',
    'Ginger': 'produce',
    'Calamansi': 'produce',
    'Lemon': 'produce',
    'Mint': 'produce',
    'Kangkong (water spinach)': 'produce',
    'Radish': 'produce',
    'Sitaw (long beans)': 'produce',
    'Okra': 'produce',
    'Bitter melon (ampalaya)': 'produce',
    'Squash': 'produce',
    'Pechay (bok choy)': 'produce',
    'Basil or malunggay leaves': 'produce',
    'Mixed vegetables (peas, carrots)': 'produce',
    
    'Soy sauce': 'dry',
    'Brown sugar': 'dry',
    'Gochujang (Korean chili paste)': 'dry',
    'Sesame oil': 'dry',
    'Sesame seeds': 'dry',
    'Salt': 'dry',
    'Black pepper': 'dry',
    'Whole peppercorns': 'dry',
    'Cornstarch': 'dry',
    'Cooking oil': 'dry',
    'Flour': 'dry',
    'Breadcrumbs': 'dry',
    'Honey': 'dry',
    'Chili flakes or hot sauce': 'dry',
    'Vinegar': 'dry',
    'Lumpia wrapper': 'dry',
    'Bihon/canton noodles': 'dry',
    'Spaghetti noodles': 'dry',
    'Oyster sauce': 'dry',
    'Banana ketchup': 'dry',
    'Tomato sauce': 'dry',
    'Sugar': 'dry',
    'Blue curaçao syrup': 'dry',
    'Raspberry/red fruit tea powder': 'dry',
    'Espresso': 'dry',
    'Vanilla syrup': 'dry',
    'Caramel drizzle': 'dry',
    'Black tea leaves/powder': 'dry',
    'Matcha powder': 'dry',
    'Tapioca pearls (sago)': 'dry',
    'Sugar syrup': 'dry',
    'Chocolate cookies (Oreo)': 'dry',
    'Strawberry syrup': 'dry',
    'Mango syrup/puree': 'dry',
    'Graham crumbs': 'dry',
    'Tortilla chips': 'dry',
    'Cheese sauce': 'dry',
    'Salsa': 'dry',
    'Tartar sauce': 'dry',
    'Bread': 'dry',
    'Nuts (pili or cashew)': 'dry',
    'Olive oil': 'dry',
    'Jasmine rice': 'dry',
    'Tamarind (sampaloc)': 'dry',
    'Bagoong (fermented shrimp paste)': 'dry',
    'Fish sauce (patis)': 'dry',
    'Bay leaves': 'dry',
    'Ice': 'dry',
    'Water': 'dry',
    
    'Sprite/7-Up': 'beverage',
    'Branded soda (Coke, Sprite, Royal)': 'beverage',
    
    'Paper cups': 'packaging',
    'Straws': 'packaging',
    'Food containers': 'packaging',
    'Plastic utensils': 'packaging',
    'Napkins': 'packaging'
};

const recipeMapping = {
    // Meat & Poultry (meat category)
    'Chicken': [
        'Buttered Honey Chicken', 
        'Buttered Spicy Chicken', 
        'Chicken Adobo', 
        'Fried Chicken', 
        'Sizzling Fried Chicken',
        'Budget Meal: Fried Chicken',
        'Budget Meal: Buttered Honey Chicken',
        'Budget Meal: Buttered Spicy Chicken'
    ],
    'Pork slices': [
        'Korean Spicy Bulgogi (Pork)', 
        'Korean Salt and Pepper (Pork)', 
        'Crispy Pork Lechon Kawali',
        'Sizzling Pork Sisig', 
        'Sizzling Liempo', 
        'Sizzling Porkchop',
        'Sinigang (PORK)',
        'Pork Shanghai',
        'Pork Adobo'
    ],
    'Pork belly': [
        'Crispy Pork Lechon Kawali',
        'Sizzling Pork Sisig',
        'Sizzling Liempo',
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Ground pork': [
        'Pork Shanghai',
        'Sizzling Pork Sisig',
        'Lumpiang Shanghai'
    ],
    'Bagnet': [
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Pork ribs': [
        'Sinigang (PORK)'
    ],
    'Pork face & ears': [
        'Sizzling Pork Sisig'
    ],
    'Liver': [
        'Sizzling Pork Sisig'
    ],
    'Pork chop': [
        'Sizzling Porkchop'
    ],
    'Hotdogs': [
        'Spaghetti (S/M/L)'
    ],
    'Bacon': [
        'Clubhouse Sandwich'
    ],
    'Ham': [
        'Clubhouse Sandwich'
    ],
    'Beef shanks and marrow': [
        'Special Bulalo (good for 2-3 Persons)',
        'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)'
    ],
    
    // Seafood (seafood category)
    'Cream dory fillet': [
        'Cream Dory Fish Fillet',
        'Fish and Fries'
    ],
    'Shrimp': [
        'Buttered Shrimp',
        'Sinigang (Shrimp)'
    ],
    'Smoked fish (tinapa)': [
        'Tinapa Rice'
    ],
    'Dried fish (tuyo)': [
        'Tuyo Pesto'
    ],
    
    // Dairy & Eggs (dairy category)
    'Butter': [
        'Buttered Honey Chicken',
        'Buttered Spicy Chicken',
        'Buttered Shrimp',
        'French fries'
    ],
    'Eggs': [
        'Clubhouse Sandwich',
        'Lumpiang Shanghai',
        'Pork Shanghai'
    ],
    'Cheese': [
        'Cheesy Nachos',
        'Nachos Supreme',
        'Cheesy Dynamite Lumpia',
        'Clubhouse Sandwich'
    ],
    'Grated cheese': [
        'Cheesy Nachos',
        'Nachos Supreme',
        'Cheesy Dynamite Lumpia'
    ],
    'Mayonnaise': [
        'Clubhouse Sandwich'
    ],
    'Whipped cream': [
        'Cookies & Cream HC/MC',
        'Strawberry & Cream HC',
        'Mango cheese cake HC'
    ],
    'Cream cheese': [
        'Mango cheese cake HC'
    ],
    'Sour cream': [
        'Nachos Supreme'
    ],
    'Non-dairy creamer': [
        'Milk Tea Regular HC/MC',
        'Cafe Latte Tall/Grande',
        'Caramel Macchiato Tall/Grande',
        'Matcha Green Tea HC/MC'
    ],
    'Milk': [
        'Milk Tea Regular HC/MC',
        'Cafe Latte Tall/Grande',
        'Caramel Macchiato Tall/Grande',
        'Matcha Green Tea HC/MC'
    ],
    
    // Vegetables & Fruits (produce category)
    'Garlic': [
        'Chicken Adobo',
        'Pork Adobo',
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Buttered Shrimp',
        'Sinigang (PORK)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Onion': [
        'Chicken Adobo',
        'Pork Adobo',
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Sinigang (PORK)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)',
        'Clubhouse Sandwich'
    ],
    'Green onions': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)'
    ],
    'Carrots': [
        'Pancit Bihon (S/M/L)',
        'Pancit Canton (S/M/L)',
        'Sinigang (PORK)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Cabbage': [
        'Pancit Bihon (S/M/L)',
        'Pancit Canton (S/M/L)',
        'Sinigang (PORK)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Tomato': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)',
        'Clubhouse Sandwich'
    ],
    'Eggplant': [
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Cucumber': [
        'Cucumber Lemonade (Glass/Pitcher)',
        'Clubhouse Sandwich'
    ],
    'Lettuce': [
        'Clubhouse Sandwich'
    ],
    'Celery': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)'
    ],
    'Green beans': [
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Spring onions': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)'
    ],
    'Chili peppers': [
        'Buttered Spicy Chicken',
        'Budget Meal: Buttered Spicy Chicken'
    ],
    'Long green chili (siling haba)': [
        'Cheesy Dynamite Lumpia'
    ],
    'Jalapeños': [
        'Nachos Supreme'
    ],
    'Potato strips': [
        'Fish and Fries',
        'French fries'
    ],
    'Corn on the cob': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)'
    ],
    'Ginger': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)'
    ],
    'Calamansi': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)',
        'Various Filipino dishes'
    ],
    'Lemon': [
        'Cucumber Lemonade (Glass/Pitcher)',
        'Blue Lemonade (Glass/Pitcher)'
    ],
    'Mint': [
        'Cucumber Lemonade (Glass/Pitcher)',
        'Blue Lemonade (Glass/Pitcher)'
    ],
    'Kangkong (water spinach)': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)'
    ],
    'Radish': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)'
    ],
    'Sitaw (long beans)': [
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Okra': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)'
    ],
    'Bitter melon (ampalaya)': [
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Squash': [
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Pechay (bok choy)': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)'
    ],
    'Basil or malunggay leaves': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)'
    ],
    'Mixed vegetables (peas, carrots)': [
        'Paknet (Pakbet w/ Bagnet)'
    ],
    
    // Dry Goods (dry category)
    'Soy sauce': [
        'Chicken Adobo',
        'Pork Adobo',
        'Korean Spicy Bulgogi (Pork)'
    ],
    'Brown sugar': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)'
    ],
    'Gochujang (Korean chili paste)': [
        'Korean Spicy Bulgogi (Pork)'
    ],
    'Sesame oil': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)'
    ],
    'Sesame seeds': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)'
    ],
    'Salt': [
        'All dishes'
    ],
    'Black pepper': [
        'All savory dishes'
    ],
    'Whole peppercorns': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)',
        'Special Bulalo'
    ],
    'Cornstarch': [
        'Crispy Pork Lechon Kawali',
        'Fried Chicken',
        'Cream Dory Fish Fillet'
    ],
    'Cooking oil': [
        'Fried Chicken',
        'Crispy Pork Lechon Kawali',
        'Sizzling Fried Chicken',
        'Sizzling Pork Sisig',
        'Sizzling Liempo',
        'Sizzling Porkchop',
        'Cream Dory Fish Fillet',
        'Fish and Fries',
        'French fries',
        'Lumpiang Shanghai',
        'Pork Shanghai'
    ],
    'Flour': [
        'Crispy Pork Lechon Kawali',
        'Fried Chicken',
        'Cream Dory Fish Fillet'
    ],
    'Breadcrumbs': [
        'Crispy Pork Lechon Kawali',
        'Fried Chicken'
    ],
    'Honey': [
        'Buttered Honey Chicken',
        'Budget Meal: Buttered Honey Chicken'
    ],
    'Chili flakes or hot sauce': [
        'Buttered Spicy Chicken',
        'Budget Meal: Buttered Spicy Chicken',
        'Nachos Supreme'
    ],
    'Vinegar': [
        'Chicken Adobo',
        'Pork Adobo',
        'Sizzling Pork Sisig'
    ],
    'Lumpia wrapper': [
        'Lumpiang Shanghai',
        'Cheesy Dynamite Lumpia'
    ],
    'Bihon/canton noodles': [
        'Pancit Bihon (S/M/L)',
        'Pancit Canton (S/M/L)'
    ],
    'Spaghetti noodles': [
        'Spaghetti (S/M/L)'
    ],
    'Oyster sauce': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)'
    ],
    'Banana ketchup': [
        'Spaghetti (S/M/L)'
    ],
    'Tomato sauce': [
        'Spaghetti (S/M/L)'
    ],
    'Sugar': [
        'All beverages',
        'Various dishes'
    ],
    'Blue curaçao syrup': [
        'Blue Lemonade (Glass/Pitcher)'
    ],
    'Raspberry/red fruit tea powder': [
        'Red Tea (Glass)'
    ],
    'Espresso': [
        'Cafe Americano Tall/Grande',
        'Cafe Latte Tall/Grande',
        'Caramel Macchiato Tall/Grande'
    ],
    'Vanilla syrup': [
        'Caramel Macchiato Tall/Grande'
    ],
    'Caramel drizzle': [
        'Caramel Macchiato Tall/Grande'
    ],
    'Black tea leaves/powder': [
        'Milk Tea Regular HC/MC'
    ],
    'Matcha powder': [
        'Matcha Green Tea HC/MC',
        'Matcha Green Tea HC/MC Frappe'
    ],
    'Tapioca pearls (sago)': [
        'Milk Tea Regular HC/MC'
    ],
    'Sugar syrup': [
        'All Beverages'
    ],
    'Chocolate cookies (Oreo)': [
        'Cookies & Cream HC/MC'
    ],
    'Strawberry syrup': [
        'Strawberry & Cream HC'
    ],
    'Mango syrup/puree': [
        'Mango cheese cake HC'
    ],
    'Graham crumbs': [
        'Mango cheese cake HC'
    ],
    'Tortilla chips': [
        'Cheesy Nachos',
        'Nachos Supreme'
    ],
    'Cheese sauce': [
        'Cheesy Nachos',
        'Nachos Supreme'
    ],
    'Salsa': [
        'Nachos Supreme'
    ],
    'Tartar sauce': [
        'Fish and Fries'
    ],
    'Bread': [
        'Clubhouse Sandwich'
    ],
    'Nuts (pili or cashew)': [
        'Special Bulalo (good for 2-3 Persons)',
        'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)'
    ],
    'Olive oil': [
        'Clubhouse Sandwich'
    ],
    'Jasmine rice': [
        'All Rice-based dishes',
        'Fried Rice',
        'Plain Rice',
        'Tinapa Rice',
        'Tuyo Pesto'
    ],
    'Tamarind (sampaloc)': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)'
    ],
    'Bagoong (fermented shrimp paste)': [
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Fish sauce (patis)': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Bay leaves': [
        'Sinigang (PORK)',
        'Sinigang (Shrimp)',
        'Special Bulalo'
    ],
    'Ice': [
        'All cold beverages',
        'Frappe drinks'
    ],
    'Water': [
        'All dishes and beverages'
    ],
    
    // Beverages (beverage category)
    'Sprite/7-Up': [
        'Soda (Mismo)',
        'Soda 1.5L'
    ],
    'Branded soda (Coke, Sprite, Royal)': [
        'Soda (Mismo)',
        'Soda 1.5L'
    ],
    
    // Packaging (packaging category)
    'Paper cups': [
        'All beverage servings',
        'Milk Tea',
        'Coffee drinks',
        'Frappe'
    ],
    'Straws': [
        'All beverage servings',
        'Milk Tea',
        'Coffee drinks',
        'Frappe'
    ],
    'Food containers': [
        'All takeout orders',
        'Budget meals packaging',
        'Party trays'
    ],
    'Plastic utensils': [
        'All food orders',
        'Takeout packaging'
    ],
    'Napkins': [
        'All orders',
        'Customer service'
    ]
};

const unitMapping = {
    'meat': 'kg',
    'seafood': 'kg',
    'produce': 'kg',
    'dairy': 'pieces',
    'dry': 'pieces',
    'beverage': 'liters',
    'packaging': 'packs'
};

const categoryUnitsMapping = {
    'meat': ['kg', 'g', 'lbs', 'oz', 'mg'],
    'seafood': ['kg', 'g', 'lbs', 'oz', 'mg'],
    'produce': ['kg', 'g', 'lbs', 'oz', 'pc'],
    'dairy': ['kg', 'g', 'ml', 'liters', 'pieces'],
    'dry': ['kg', 'g', 'lbs', 'oz', 'ml', 'pack', 'bottle', 'can', 'jar'],
    'beverage': ['liters', 'ml', 'bottles', 'cans'],
    'packaging': ['packs', 'box', 'bag', 'pc', 'roll']
};

const categoryToPOSMapping = {
    'meat': 'Raw Ingredients',
    'seafood': 'Raw Ingredients',
    'produce': 'Raw Ingredients',
    'dairy': 'Raw Ingredients',
    'dry': 'Raw Ingredients',
    'beverage': 'Raw Ingredients',
    'packaging': 'Raw Ingredients'
};

// ==================== GLOBAL VARIABLES ====================
let allInventoryItems = []; // Empty array - no sample data
let currentSection = 'dashboard';
let currentCategory = 'all';
let isModalOpen = false;

// ==================== UTILITY FUNCTIONS ====================
function getItemTypeFromName(itemName) {
    return 'raw'; // Always raw since we only have raw ingredients
}

function getCategoryFromName(itemName) {
    return validRawIngredients[itemName] || 'dry';
}

function getUnitFromItem(itemName, category) {
    return unitMapping[category] || 'pieces';
}

function getCategoryLabel(category) {
    const labels = {
        'meat': 'Meat & Poultry',
        'seafood': 'Seafood',
        'produce': 'Vegetables & Fruits',
        'dairy': 'Dairy & Eggs',
        'dry': 'Dry Goods',
        'beverage': 'Beverages',
        'packaging': 'Packaging',
        'all': 'All Raw Ingredients'
    };
    return labels[category] || category;
}

// ==================== LOW STOCK CALCULATION FUNCTIONS ====================
function isLowStock(item) {
    if (!item) return false;
    
    const currentStock = parseFloat(item.currentStock) || 0;
    const minStock = parseFloat(item.minStock) || 10;
    
    // Item is low stock if current stock is greater than 0 but less than or equal to min stock
    return currentStock > 0 && currentStock <= minStock;
}

function isOutOfStock(item) {
    if (!item) return false;
    
    const currentStock = parseFloat(item.currentStock) || 0;
    return currentStock === 0;
}

function getStockStatus(item) {
    if (isOutOfStock(item)) return 'Out of Stock';
    if (isLowStock(item)) return 'Low Stock';
    return 'In Stock';
}

function getStockStatusClass(item) {
    if (isOutOfStock(item)) return 'out-of-stock';
    if (isLowStock(item)) return 'low-stock';
    return 'in-stock';
}

// ==================== DATA CLEANUP FUNCTIONS ====================
async function clearAllInventoryData() {
    try {
        const confirmation = confirm('⚠️ WARNING: This will PERMANENTLY DELETE ALL inventory data and start fresh from 0. This action cannot be undone. Are you absolutely sure?');
        if (!confirmation) return;

        showLoading('Clearing all inventory data...');

        // Fetch all current inventory items
        const response = await fetch('/api/inventory', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch inventory items');
        }

        if (data.success && data.data.length > 0) {
            // Delete each item one by one
            for (const item of data.data) {
                try {
                    const deleteResponse = await fetch(`/api/inventory/${item._id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    });

                    const deleteData = await deleteResponse.json();
                    
                    if (!deleteResponse.ok) {
                        console.warn(`Failed to delete item ${item.itemName}:`, deleteData.message);
                    }
                } catch (error) {
                    console.warn(`Error deleting item ${item.itemName}:`, error);
                }
            }

            // Clear local data
            allInventoryItems = [];
            
            // Update UI
            renderInventoryGrid();
            renderDashboardGrid();
            renderRestockGrid();
            updateDashboardStats();
            updateCategoryCounts();
            
            showToast('✅ All inventory data has been cleared! System is now empty.', 'success');
        } else {
            showToast('Inventory is already empty.', 'info');
        }
    } catch (error) {
        console.error('Error clearing inventory data:', error);
        showToast('Failed to clear inventory data: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ==================== LOADING FUNCTIONS ====================
function showLoading(message = 'Loading...') {
    hideLoading();
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
        font-size: 18px;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 5px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 20px;
    `;
    
    const loadingText = document.createElement('div');
    loadingText.textContent = message;
    loadingText.style.cssText = `margin-top: 10px; font-size: 16px;`;
    
    if (!document.getElementById('loadingSpinnerStyles')) {
        const style = document.createElement('style');
        style.id = 'loadingSpinnerStyles';
        style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }
    
    loadingOverlay.appendChild(spinner);
    loadingOverlay.appendChild(loadingText);
    document.body.appendChild(loadingOverlay);
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            if (loadingOverlay.parentNode) loadingOverlay.parentNode.removeChild(loadingOverlay);
            document.body.style.overflow = '';
        }, 300);
    }
}

// ==================== NOTIFICATION FUNCTIONS ====================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
}

// ==================== FORM HANDLING FUNCTIONS ====================
function updateFromItemName() {
    const itemName = elements.itemName.value;
    if (!itemName) return;
    
    const itemType = getItemTypeFromName(itemName);
    const category = getCategoryFromName(itemName);
    const unit = getUnitFromItem(itemName, category);
    
    if (elements.itemType) elements.itemType.value = itemType;
    if (elements.itemCategory) elements.itemCategory.value = category;
    if (elements.itemUnit) {
        elements.itemUnit.value = unit;
        updateUnitOptions(category);
    }
    
    showRecipeInfo(itemName);
}

function showRecipeInfo(itemName) {
    if (!elements.recipeInfo) return;
    
    if (recipeMapping[itemName]) {
        const dishes = recipeMapping[itemName];
        elements.recipeInfo.innerHTML = `
            <div class="recipe-info">
                <strong>📝 This ingredient can make:</strong>
                <ul>${dishes.map(dish => `<li>${dish}</li>`).join('')}</ul>
                <p class="small">When you restock this, related dishes may become available in POS.</p>
            </div>
        `;
        elements.recipeInfo.style.display = 'block';
    } else {
        elements.recipeInfo.style.display = 'none';
    }
}

function updateFromCategory() {
    const category = elements.itemCategory.value;
    
    if (!category) return;
    
    // Update item name options
    if (elements.itemName) {
        elements.itemName.innerHTML = '<option value="">Select Product</option>';
        
        Object.keys(validRawIngredients).forEach(item => {
            if (validRawIngredients[item] === category) {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                elements.itemName.appendChild(option);
            }
        });
    }
    
    updateUnitOptions(category);
}

function updateUnitOptions(category) {
    const unitSelect = elements.itemUnit;
    if (!unitSelect) return;
    
    const availableUnits = categoryUnitsMapping[category] || ['kg', 'pc', 'liter', 'box'];
    const currentUnit = unitSelect.value;
    
    unitSelect.innerHTML = '<option value="">Select Unit</option>';
    
    availableUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        const labels = {
            'kg': 'Kilogram (kg)', 'g': 'Gram (g)', 'mg': 'Milligram (mg)', 'lbs': 'Pounds (lbs)',
            'oz': 'Ounces (oz)', 'liter': 'Liter (L)', 'liters': 'Liters (L)', 'ml': 'Milliliter (ml)',
            'pc': 'Piece (pc)', 'pieces': 'Pieces', 'box': 'Box', 'pack': 'Pack', 'packs': 'Packs',
            'bottle': 'Bottle', 'bottles': 'Bottles', 'can': 'Can', 'bag': 'Bag', 'jar': 'Jar',
            'roll': 'Roll'
        };
        option.textContent = labels[unit] || unit.charAt(0).toUpperCase() + unit.slice(1);
        unitSelect.appendChild(option);
    });
    
    if (currentUnit && availableUnits.includes(currentUnit)) {
        unitSelect.value = currentUnit;
    } else if (availableUnits.length > 0) {
        unitSelect.value = availableUnits[0];
    }
}

function updateItemNameOptions() {
    const itemNameSelect = elements.itemName;
    
    if (!itemNameSelect) return;
    
    itemNameSelect.innerHTML = '<option value="">Select Product</option>';
    
    Object.keys(validRawIngredients).forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        itemNameSelect.appendChild(option);
    });
}

function updateFromItemType() {
    const itemType = elements.itemType.value;
    
    updateItemNameOptions();
    updateCategoryOptions();
    
    if (elements.itemCategory) elements.itemCategory.value = '';
    if (elements.itemName) elements.itemName.value = '';
    if (elements.itemUnit) elements.itemUnit.value = '';
    
    toggleFieldsByItemType();
}

function updateCategoryOptions() {
    const categorySelect = elements.itemCategory;
    
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    const rawCategories = [
        { value: 'meat', label: 'Meat & Poultry' },
        { value: 'seafood', label: 'Seafood' },
        { value: 'produce', label: 'Vegetables & Fruits' },
        { value: 'dairy', label: 'Dairy & Eggs' },
        { value: 'dry', label: 'Dry Goods' },
        { value: 'beverage', label: 'Beverages' },
        { value: 'packaging', label: 'Packaging' }
    ];
    
    rawCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.value;
        option.textContent = category.label;
        categorySelect.appendChild(option);
    });
}

function toggleFieldsByItemType() {
    const itemType = elements.itemType ? elements.itemType.value : 'raw';
    
    if (itemType === 'raw') {
        if (elements.description && elements.description.parentElement) {
            elements.description.parentElement.style.display = 'none';
        }
        
        if (elements.rawIngredientsList) {
            const groupedIngredients = {};
            Object.keys(validRawIngredients).forEach(ingredient => {
                const category = validRawIngredients[ingredient];
                if (!groupedIngredients[category]) groupedIngredients[category] = [];
                groupedIngredients[category].push(ingredient);
            });

            let listHTML = '<div class="raw-ingredients-list"><h4>Available Raw Ingredients by Category:</h4>';
            for (const category in groupedIngredients) {
                const displayCategory = getCategoryLabel(category);
                listHTML += `<strong>${displayCategory}:</strong> ${groupedIngredients[category].join(', ')}<br>`;
            }
            listHTML += '</div>';
            elements.rawIngredientsList.innerHTML = listHTML;
            elements.rawIngredientsList.style.display = 'block';
        }
    } else {
        if (elements.description && elements.description.parentElement) {
            elements.description.parentElement.style.display = 'block';
        }
        if (elements.rawIngredientsList) elements.rawIngredientsList.style.display = 'none';
    }
}

// ==================== MODAL FUNCTIONS ====================
function openAddModal() {
    if (isModalOpen) return;
    
    isModalOpen = true;
    const modal = elements.itemModal;
    const form = elements.itemForm;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Add New Raw Ingredient';
    if (form) form.reset();
    if (elements.itemId) elements.itemId.value = '';
    
    if (elements.itemType) elements.itemType.value = 'raw';
    if (elements.currentStock) elements.currentStock.value = '0';
    if (elements.minStock) elements.minStock.value = '10';
    if (elements.maxStock) elements.maxStock.value = '50';
    
    updateItemNameOptions();
    updateCategoryOptions();
    toggleFieldsByItemType();
    
    if (elements.itemCategory) elements.itemCategory.value = '';
    if (elements.itemUnit) elements.itemUnit.value = '';
    if (elements.recipeInfo) elements.recipeInfo.style.display = 'none';
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemName) elements.itemName.focus();
    }, 10);
}

function openEditModal(itemId) {
    if (isModalOpen) return;
    
    const item = allInventoryItems.find(i => i._id === itemId);
    if (!item) return;
    
    isModalOpen = true;
    const modal = elements.itemModal;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Edit Inventory Item';
    if (elements.itemId) elements.itemId.value = item._id;
    if (elements.itemType) elements.itemType.value = item.itemType;
    
    updateItemNameOptions();
    updateCategoryOptions();
    
    if (elements.itemName) elements.itemName.value = item.itemName;
    if (elements.itemCategory) elements.itemCategory.value = item.category;
    if (elements.currentStock) elements.currentStock.value = item.currentStock || 0;
    if (elements.minStock) elements.minStock.value = item.minStock || 10;
    if (elements.maxStock) elements.maxStock.value = item.maxStock || 50;
    
    if (elements.itemUnit) {
        updateUnitOptions(item.category);
        elements.itemUnit.value = item.unit || getUnitFromItem(item.itemName, item.category);
    }
    
    showRecipeInfo(item.itemName);
    
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
        }, 300);
    }
}

// ==================== API FUNCTIONS ====================
async function saveInventoryItem(itemData, isEdit = false) {
    try {
        showLoading();
        
        if (!itemData.itemName || !itemData.itemType || !itemData.category) {
            throw new Error('Please select Item Name, Type, and Category');
        }
        
        const currentStock = parseFloat(itemData.currentStock) || 0;
        const unit = itemData.unit || 'pieces';
        const minStock = parseFloat(itemData.minStock) || 10;
        const maxStock = parseFloat(itemData.maxStock) || 50;
        
        const itemId = itemData._id || itemData.itemId;
        const url = itemId ? `/api/inventory/${itemId}` : '/api/inventory';
        const method = itemId ? 'PUT' : 'POST';
        
        const payload = {
            itemName: itemData.itemName.trim(),
            itemType: itemData.itemType,
            category: itemData.category,
            unit: unit,
            currentStock: currentStock,
            minStock: minStock,
            maxStock: maxStock
        };
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'save'} item. Status: ${response.status}`);
        }
        
        if (data.success) {
            const action = isEdit ? 'updated' : 'added';
            showToast(`Item ${action} successfully!`);
            await fetchInventoryItems();
            updateDashboardStats();
            return { success: true, data: data.data };
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    } finally {
        hideLoading();
    }
}

async function handleSaveItem() {
    const itemId = elements.itemId ? elements.itemId.value : '';
    const isEdit = itemId && itemId.trim() !== '';
    
    const itemData = {
        _id: isEdit ? itemId : undefined,
        itemId: itemId,
        itemName: elements.itemName ? elements.itemName.value : '',
        itemType: elements.itemType ? elements.itemType.value : '',
        category: elements.itemCategory ? elements.itemCategory.value : '',
        unit: elements.itemUnit ? elements.itemUnit.value : '',
        currentStock: elements.currentStock ? parseFloat(elements.currentStock.value) || 0 : 0,
        minStock: elements.minStock ? parseFloat(elements.minStock.value) || 10 : 10,
        maxStock: elements.maxStock ? parseFloat(elements.maxStock.value) || 50 : 50
    };
    
    if (!itemData.itemName || !itemData.itemType || !itemData.category) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    const result = await saveInventoryItem(itemData, isEdit);
    if (result.success) closeModal();
}

// ==================== DATA FETCHING FUNCTIONS ====================
async function fetchInventoryItems() {
    try {
        showLoading('Loading inventory...');
        
        const response = await fetch('/api/inventory', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Failed to fetch inventory items');
        
        if (data.success) {
            // Filter out any items that are not valid raw ingredients
            allInventoryItems = data.data
                .filter(item => {
                    // Only keep valid raw ingredients
                    return item.itemType === 'raw' && 
                           validRawIngredients.hasOwnProperty(item.itemName);
                })
                .map(item => ({
                    ...item,
                    maxStock: parseFloat(item.maxStock) || 50,
                    minStock: parseFloat(item.minStock) || 10,
                    currentStock: parseFloat(item.currentStock) || 0,
                    unit: item.unit || 'pieces',
                    category: item.category || getCategoryFromName(item.itemName),
                    itemType: item.itemType || 'raw'
                }));
            
            await fetchMappingStatus();
            renderInventoryGrid();
            renderDashboardGrid();
            renderRestockGrid();
            updateCategoryCounts();
            updateDashboardStats();
            
            // Show message if empty
            if (allInventoryItems.length === 0) {
                showToast('Inventory is empty. Start by adding your first ingredient!', 'info');
            } else {
                showToast('Inventory data loaded successfully');
            }
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        showToast('Failed to load inventory items', 'error');
        allInventoryItems = []; // Empty array
        renderInventoryGrid();
        renderDashboardGrid();
        renderRestockGrid();
        updateCategoryCounts();
        updateDashboardStats();
    } finally {
        hideLoading();
    }
}

async function fetchMappingStatus() {
    try {
        const response = await fetch('/api/inventory/mappings', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && elements.mappingStatus) {
            const stats = data.data;
            elements.mappingStatus.innerHTML = `
                <div class="mapping-stats">
                    <span class="stat-item">Total Mappings: ${stats.totalMappings}</span>
                    <span class="stat-item success">Synced: ${stats.synced}</span>
                    <span class="stat-item warning">Out of Sync: ${stats.outOfSync}</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching mapping status:', error);
    }
}

async function syncAllItems() {
    try {
        showLoading('Syncing all items...');
        
        const response = await fetch('/api/inventory/sync-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ forceSource: 'inventory' }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message);
            await fetchInventoryItems();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error syncing items:', error);
        showToast('Failed to sync items', 'error');
    } finally {
        hideLoading();
    }
}

async function showMappings() {
    try {
        showLoading('Loading mappings...');
        
        const response = await fetch('/api/inventory/mappings', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.5); display: flex; justify-content: center; 
                align-items: center; z-index: 10000;
            `;
            
            const content = document.createElement('div');
            content.className = 'modal-content';
            content.style.cssText = `
                background: white; padding: 20px; border-radius: 8px; 
                max-width: 800px; max-height: 80vh; overflow-y: auto; width: 90%;
            `;
            
            let html = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Item Mapping Status</h3>
                    <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                </div>
                <div class="stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${data.data.totalMappings}</div>
                        <div>Total Mappings</div>
                    </div>
                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${data.data.synced}</div>
                        <div>Synced</div>
                    </div>
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${data.data.outOfSync}</div>
                        <div>Out of Sync</div>
                    </div>
                </div>
            `;
            
            if (data.data.mappings && data.data.mappings.length > 0) {
                html += `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f5f5f5;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Inventory Item</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Inv Stock</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Prod Stock</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                data.data.mappings.forEach(mapping => {
                    const isSynced = mapping.syncStatus === 'synced';
                    html += `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${mapping.inventoryItemName}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${mapping.productName}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${mapping.inventoryStock}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${mapping.productStock}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; ${isSynced ? 'background: #d4edda; color: #155724;' : 'background: #fff3cd; color: #856404;'}">
                                    ${isSynced ? 'Synced' : 'Out of Sync'}
                                </span>
                            </td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                <button onclick="syncSingleItem('${mapping.inventoryItemName}')" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                    Sync
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                html += `</tbody></table>`;
            } else {
                html += `<p style="text-align: center; padding: 20px; color: #666;">No item mappings found.</p>`;
            }
            
            content.innerHTML = html;
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        }
    } catch (error) {
        console.error('Error showing mappings:', error);
        showToast('Failed to load mappings', 'error');
    } finally {
        hideLoading();
    }
}

async function syncSingleItem(itemName) {
    try {
        showLoading(`Syncing ${itemName}...`);
        
        const encodedName = encodeURIComponent(itemName);
        const response = await fetch(`/api/inventory/sync-item/${encodedName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ forceSource: 'inventory' }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Synced ${itemName}: Inventory=${data.data.inventoryStock}, Product=${data.data.productStock}`);
            await fetchInventoryItems();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error syncing single item:', error);
        showToast('Failed to sync item', 'error');
    } finally {
        hideLoading();
    }
}

// ==================== DASHBOARD FUNCTIONS ====================
function updateDashboardStats() {
    const rawItems = allInventoryItems.filter(item => item.itemType === 'raw');
    const totalItems = rawItems.length;
    
    // Count low stock items (current > 0 AND current <= min)
    const lowStockItems = rawItems.filter(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        return currentStock > 0 && currentStock <= minStock;
    }).length;
    
    // Count out of stock items (current === 0)
    const outOfStockItems = rawItems.filter(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        return currentStock === 0;
    }).length;
    
    if (elements.totalItems) elements.totalItems.textContent = totalItems;
    if (elements.lowStock) elements.lowStock.textContent = lowStockItems;
    if (elements.outOfStock) elements.outOfStock.textContent = outOfStockItems;
    
    if (elements.totalProducts) elements.totalProducts.textContent = totalItems;
    if (elements.inventoryValue) elements.inventoryValue.textContent = 'N/A';
}

// ==================== UI RENDERING FUNCTIONS ====================
function renderInventoryGrid() {
    if (!elements.inventoryGrid) return;
    
    let filteredItems = allInventoryItems.filter(item => item.itemType === 'raw');
    
    if (currentCategory !== 'all') {
        filteredItems = filteredItems.filter(item => normalizeCategory(item.category) === currentCategory);
    }
    
    if (filteredItems.length === 0) {
        elements.inventoryGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No inventory items found</h3>
                <p>${currentCategory !== 'all' ? `No items in ${getCategoryLabel(currentCategory)} category` : 'Your inventory is empty. Start by adding your first ingredient!'}</p>
                <button onclick="openAddModal()" class="btn btn-primary mt-3">➕ Add New Item</button>
            </div>
        `;
        return;
    }
    
    const gridHTML = filteredItems.map(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const maxStock = parseFloat(item.maxStock) || 50;
        const minStock = parseFloat(item.minStock) || 10;
        const unit = item.unit || 'pieces';
        const isOutOfStock = currentStock === 0;
        const isLowStock = currentStock > 0 && currentStock <= minStock;
        
        const mappingInfo = item.mappedProduct || {};
        const syncStatus = mappingInfo.syncStatus || 'not_mapped';
        const hasMapping = mappingInfo.exists;
        
        let mappingBadge = '';
        if (hasMapping) {
            const badgeColor = syncStatus === 'synced' ? 'success' : 'warning';
            const badgeText = syncStatus === 'synced' ? '✓ Synced' : '⚠ Out of Sync';
            mappingBadge = `<span class="badge badge-${badgeColor}" style="margin-left: 5px; font-size: 10px;">${badgeText}</span>`;
        }
        
        let recipeInfo = '';
        if (recipeMapping[item.itemName]) {
            const dishes = recipeMapping[item.itemName];
            recipeInfo = `
                <div class="recipe-tooltip">
                    <small><strong>Can make:</strong> ${dishes.slice(0, 2).join(', ')}${dishes.length > 2 ? '...' : ''}</small>
                </div>
            `;
        }
        
        return `
        <div class="inventory-card ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''}">
            <div class="card-header">
                <h4>${item.itemName} ${mappingBadge}</h4>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openEditModal('${item._id}')">Edit</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Category:</span> ${getCategoryLabel(item.category)}
                </div>
                <div class="card-info">
                    <span class="label">Current Stock:</span> ${currentStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Min Stock:</span> ${minStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Max Stock:</span> ${maxStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span> 
                    <span class="status ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}">
                        ${isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                </div>
                ${hasMapping ? `
                <div class="card-info">
                    <span class="label">Product Sync:</span> 
                    <span class="status ${syncStatus === 'synced' ? 'in-stock' : 'low-stock'}">
                        ${syncStatus === 'synced' ? 'Synced' : 'Out of Sync'}
                    </span>
                </div>
                ` : ''}
                ${recipeInfo}
            </div>
        </div>
        `;
    }).join('');
    
    elements.inventoryGrid.innerHTML = gridHTML;
}

function renderDashboardGrid() {
    if (!elements.dashboardGrid) return;
    
    const rawItems = allInventoryItems.filter(item => item.itemType === 'raw');
    
    if (rawItems.length === 0) {
        elements.dashboardGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>Dashboard is Empty</h3>
                <p>Start by adding your first inventory item to see dashboard statistics</p>
                <button onclick="openAddModal()" class="btn btn-primary mt-3">➕ Add First Item</button>
            </div>
        `;
        return;
    }
    
    // Get items that are critical (out of stock or low stock)
    const criticalItems = rawItems.filter(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        return currentStock === 0 || currentStock <= minStock;
    });
    
    let displayItems = [...criticalItems]; // Start with critical items
    
    // If we have less than 12 items, add some regular items
    if (displayItems.length < 12) {
        const regularItems = rawItems
            .filter(item => !criticalItems.includes(item))
            .slice(0, 12 - displayItems.length);
        displayItems = [...displayItems, ...regularItems];
    }
    
    displayItems = displayItems.slice(0, 12);
    
    const gridHTML = displayItems.map(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const maxStock = parseFloat(item.maxStock) || 50;
        const minStock = parseFloat(item.minStock) || 10;
        const unit = item.unit || 'pieces';
        const isOutOfStock = currentStock === 0;
        const isLowStock = currentStock > 0 && currentStock <= minStock;
        
        return `
        <div class="inventory-card ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''}">
            <div class="card-header">
                <h4>${item.itemName}</h4>
                <span class="badge badge-secondary">
                    ${getCategoryLabel(item.category)}
                </span>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Current:</span> ${currentStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Min:</span> ${minStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Max:</span> ${maxStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span> 
                    <span class="status ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}">
                        ${isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    elements.dashboardGrid.innerHTML = gridHTML;
}

function renderRestockGrid() {
    if (!elements.restockGrid) return;
    
    // Get items that need restocking (out of stock OR low stock)
    const itemsNeedingRestock = allInventoryItems.filter(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        return currentStock <= minStock; // This includes both out of stock (0) and low stock
    });
    
    if (itemsNeedingRestock.length === 0) {
        elements.restockGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <h3>No items need restocking</h3>
                <p>${allInventoryItems.length === 0 ? 'Inventory is empty. Add items first.' : 'All items are well stocked!'}</p>
                ${allInventoryItems.length === 0 ? '<button onclick="openAddModal()" class="btn btn-primary mt-3">➕ Add Items</button>' : ''}
            </div>
        `;
        return;
    }
    
    const gridHTML = itemsNeedingRestock.map(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        const maxStock = parseFloat(item.maxStock) || 50;
        const unit = item.unit || 'pieces';
        const neededQuantity = Math.max(0, minStock - currentStock);
        const isOutOfStock = currentStock === 0;
        
        return `
        <div class="inventory-card ${isOutOfStock ? 'out-of-stock' : 'low-stock'}">
            <div class="card-header">
                <h4>${item.itemName}</h4>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="openRestockModal('${item._id}')">Restock</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Category:</span> ${getCategoryLabel(item.category)}
                </div>
                <div class="card-info">
                    <span class="label">Current Stock:</span> ${currentStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Minimum Required:</span> ${minStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Needed to Reach Minimum:</span> ${neededQuantity} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span> 
                    <span class="status ${isOutOfStock ? 'out-of-stock' : 'low-stock'}">
                        ${isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                    </span>
                </div>
                ${recipeMapping[item.itemName] ? `
                <div class="card-info">
                    <span class="label">Affected Dishes:</span> 
                    <small>${recipeMapping[item.itemName].slice(0, 3).join(', ')}${recipeMapping[item.itemName].length > 3 ? '...' : ''}</small>
                </div>
                ` : ''}
            </div>
        </div>
        `;
    }).join('');
    
    elements.restockGrid.innerHTML = gridHTML;
}

// Helper function to normalize category names
function normalizeCategory(category) {
    if (!category) return 'dry';
    
    const lowerCategory = category.toLowerCase().trim();
    
    // Map variations to standard category names
    if (lowerCategory === 'meat' || lowerCategory === 'meat & poultry' || lowerCategory.includes('meat')) {
        return 'meat';
    }
    if (lowerCategory === 'seafood' || lowerCategory.includes('fish') || lowerCategory.includes('seafood')) {
        return 'seafood';
    }
    if (lowerCategory === 'dairy' || lowerCategory === 'dairy & eggs' || lowerCategory.includes('dairy') || lowerCategory.includes('milk') || lowerCategory.includes('egg')) {
        return 'dairy';
    }
    if (lowerCategory === 'produce' || lowerCategory === 'vegetables & fruits' || lowerCategory.includes('vegetable') || lowerCategory.includes('fruit') || lowerCategory.includes('produce')) {
        return 'produce';
    }
    if (lowerCategory === 'dry' || lowerCategory === 'dry goods' || lowerCategory.includes('dry')) {
        return 'dry';
    }
    if (lowerCategory === 'beverage' || lowerCategory.includes('beverage') || lowerCategory.includes('drink')) {
        return 'beverage';
    }
    if (lowerCategory === 'packaging' || lowerCategory.includes('packaging')) {
        return 'packaging';
    }
    
    return lowerCategory;
}

function updateCategoryCounts() {
    const rawItems = allInventoryItems.filter(item => item.itemType === 'raw');
    
    // Count totals using normalized categories
    const categoryCounts = {
        all: rawItems.length,
        meat: 0,
        seafood: 0,
        produce: 0,
        dairy: 0,
        dry: 0,
        beverage: 0,
        packaging: 0
    };
    
    // Count items by normalized category
    rawItems.forEach(item => {
        const normalizedCat = normalizeCategory(item.category);
        
        if (normalizedCat === 'meat') categoryCounts.meat++;
        else if (normalizedCat === 'seafood') categoryCounts.seafood++;
        else if (normalizedCat === 'produce') categoryCounts.produce++;
        else if (normalizedCat === 'dairy') categoryCounts.dairy++;
        else if (normalizedCat === 'dry') categoryCounts.dry++;
        else if (normalizedCat === 'beverage') categoryCounts.beverage++;
        else if (normalizedCat === 'packaging') categoryCounts.packaging++;
    });
    
    // Update all category counts
    elements.categoryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        const countElement = item.querySelector('.category-count');
        if (countElement && categoryCounts[category] !== undefined) {
            countElement.textContent = categoryCounts[category];
        }
    });
}

// ==================== SECTION NAVIGATION ====================
function showSection(section) {
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.classList.remove('active-section');
    });
    
    const targetSection = document.getElementById(section);
    if (targetSection) targetSection.classList.add('active-section');
    
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) link.classList.add('active');
    });
    
    currentSection = section;
  
    if (section === 'dashboard') {
        updateDashboardStats();
        renderDashboardGrid();
    } else if (section === 'restock') {
        renderRestockGrid();
    } else if (section === 'inventory') {
        renderInventoryGrid();
    }
}

function filterByCategory(category) {
    currentCategory = category;
    
    elements.categoryItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-category') === category) item.classList.add('active');
    });

    if (currentSection === 'inventory') renderInventoryGrid();
    else if (currentSection === 'dashboard') renderDashboardGrid();
    else if (currentSection === 'restock') renderRestockGrid();
}

// ==================== ITEM MANAGEMENT FUNCTIONS ====================
function openRestockModal(itemId) {
    const item = allInventoryItems.find(i => i._id === itemId);
    if (!item) {
        showToast('Item not found', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); display: flex; justify-content: center; 
        align-items: center; z-index: 10000;
    `;
    
    const currentStock = parseFloat(item.currentStock) || 0;
    const minStock = parseFloat(item.minStock) || 10;
    const maxStock = parseFloat(item.maxStock) || 50;
    const unit = item.unit || 'pieces';
    const neededQuantity = Math.max(0, minStock - currentStock);
    const recommendedQuantity = Math.min(neededQuantity * 2, maxStock - currentStock);
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = `
        background: white; padding: 20px; border-radius: 8px; 
        max-width: 500px; width: 90%;
    `;
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>Restock ${item.itemName}</h3>
            <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
        </div>
        <div style="margin-bottom: 20px;">
            <p><strong>Current Stock:</strong> ${currentStock} ${unit}</p>
            <p><strong>Minimum Required:</strong> ${minStock} ${unit}</p>
            <p><strong>Maximum Capacity:</strong> ${maxStock} ${unit}</p>
            <p><strong>Minimum to Add:</strong> ${neededQuantity} ${unit} (to reach minimum)</p>
            <p><strong>Recommended:</strong> ${recommendedQuantity} ${unit} (suggested order)</p>
        </div>
        <form id="restockForm">
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">Quantity to Add:</label>
                <input type="number" id="restockQuantity" value="${recommendedQuantity}" 
                       min="${neededQuantity}" 
                       max="${maxStock - currentStock}" 
                       step="0.1"
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <small style="color: #666;">Enter amount between ${neededQuantity} and ${maxStock - currentStock} ${unit}</small>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">Notes (optional):</label>
                <textarea id="restockNotes" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" 
                          placeholder="Supplier, purchase date, etc..."></textarea>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button type="button" onclick="this.closest('.modal').remove()" 
                        style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Cancel
                </button>
                <button type="button" onclick="submitRestock('${item._id}')" 
                        style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Submit Restock
                </button>
            </div>
        </form>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

async function submitRestock(itemId) {
    const quantityInput = document.getElementById('restockQuantity');
    const notesInput = document.getElementById('restockNotes');
    
    if (!quantityInput || !quantityInput.value || parseFloat(quantityInput.value) <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }
    
    try {
        showLoading('Processing restock...');
        
        const response = await fetch(`/api/inventory/${itemId}/restock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quantity: parseFloat(quantityInput.value),
                notes: notesInput.value || 'Manual restock',
                action: 'add'
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Restocked ${parseFloat(quantityInput.value)} units successfully!`);
            
            // Close modal
            const modal = document.querySelector('.modal');
            if (modal) modal.remove();
            
            // Refresh all data
            await fetchInventoryItems();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error submitting restock:', error);
        showToast('Failed to submit restock: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function markAllRestocked() {
    try {
        showLoading('Processing bulk restock...');
        
        const itemsNeedingRestock = allInventoryItems.filter(item => {
            const currentStock = parseFloat(item.currentStock) || 0;
            const minStock = parseFloat(item.minStock) || 10;
            return currentStock <= minStock;
        });
        
        if (itemsNeedingRestock.length === 0) {
            showToast('No items need restocking', 'info');
            return;
        }
        
        // Create restock data for all items
        const restockData = itemsNeedingRestock.map(item => {
            const currentStock = parseFloat(item.currentStock) || 0;
            const minStock = parseFloat(item.minStock) || 10;
            const maxStock = parseFloat(item.maxStock) || 50;
            const needed = Math.max(0, minStock - currentStock);
            const recommended = Math.min(needed * 2, maxStock - currentStock);
            
            return {
                itemId: item._id,
                quantity: recommended > 0 ? recommended : minStock,
                notes: 'Bulk restock from dashboard'
            };
        });
        
        const response = await fetch('/api/inventory/bulk-restock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: restockData }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Successfully restocked ${data.restockedCount} items!`);
            await fetchInventoryItems();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error marking all restocked:', error);
        showToast('Failed to process bulk restock', 'error');
    } finally {
        hideLoading();
    }
}

function createBulkOrder() {
    const itemsNeedingRestock = allInventoryItems.filter(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        return currentStock <= minStock;
    });
    
    if (itemsNeedingRestock.length === 0) {
        showToast('No items need restocking for bulk order', 'info');
        return;
    }
    
    let orderText = '📋 BULK ORDER LIST\n';
    orderText += '===================\n\n';
    orderText += `Generated: ${new Date().toLocaleDateString()}\n`;
    orderText += `Total Items: ${itemsNeedingRestock.length}\n\n`;
    
    itemsNeedingRestock.forEach((item, index) => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        const maxStock = parseFloat(item.maxStock) || 50;
        const needed = Math.max(0, minStock - currentStock);
        const recommended = Math.min(needed * 2, maxStock - currentStock);
        
        orderText += `${index + 1}. ${item.itemName}\n`;
        orderText += `   Current: ${currentStock} ${item.unit || 'pieces'}\n`;
        orderText += `   Minimum: ${minStock} ${item.unit || 'pieces'}\n`;
        orderText += `   Needed: ${needed} ${item.unit || 'pieces'}\n`;
        orderText += `   Order: ${recommended} ${item.unit || 'pieces'}\n`;
        orderText += `   Status: ${currentStock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}\n\n`;
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); display: flex; justify-content: center; 
        align-items: center; z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = `
        background: white; padding: 20px; border-radius: 8px; 
        max-width: 600px; max-height: 80vh; overflow-y: auto; width: 90%;
    `;
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>📋 Bulk Order List (${itemsNeedingRestock.length} items)</h3>
            <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
        </div>
        <div style="margin-bottom: 20px;">
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; white-space: pre-wrap; font-family: monospace; font-size: 14px; line-height: 1.4;">${orderText}</pre>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
            <button onclick="this.closest('.modal').remove()" 
                    style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Close
            </button>
            <button onclick="downloadBulkOrder()" 
                    style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                📥 Download
            </button>
            <button onclick="printBulkOrder()" 
                    style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                🖨️ Print
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    window.downloadBulkOrder = function() {
        const blob = new Blob([orderText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulk-order-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Order list downloaded!');
    };
    
    window.printBulkOrder = function() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Bulk Order List</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        pre { background: #f5f5f5; padding: 20px; border-radius: 4px; font-size: 14px; line-height: 1.6; }
                        .print-footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h1>📋 Bulk Order List</h1>
                    <pre>${orderText}</pre>
                    <div class="print-footer">
                        Generated on ${new Date().toLocaleString()}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };
}

// ==================== SEARCH FUNCTIONALITY ====================
function debounceSearch(query) {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => performSearch(query), 300);
}

function performSearch(query) {
    if (!query.trim()) {
        if (currentSection === 'inventory') renderInventoryGrid();
        else if (currentSection === 'dashboard') renderDashboardGrid();
        else if (currentSection === 'restock') renderRestockGrid();
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    const rawItems = allInventoryItems.filter(item => item.itemType === 'raw');
    const filteredItems = rawItems.filter(item => 
        item.itemName.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        (recipeMapping[item.itemName] && 
         recipeMapping[item.itemName].some(dish => dish.toLowerCase().includes(searchTerm)))
    );

    if (currentSection === 'inventory') {
        const tempItems = [...allInventoryItems];
        allInventoryItems = filteredItems;
        renderInventoryGrid();
        allInventoryItems = tempItems;
    } else if (currentSection === 'dashboard') {
        const tempItems = [...allInventoryItems];
        allInventoryItems = filteredItems;
        renderDashboardGrid();
        allInventoryItems = tempItems;
    } else if (currentSection === 'restock') {
        const tempItems = [...allInventoryItems];
        allInventoryItems = filteredItems;
        renderRestockGrid();
        allInventoryItems = tempItems;
    }
}

// ==================== AUTH FUNCTIONS ====================
function handleLogout() {
    showLoading("Logging out...");
    
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    .then(() => {
        setTimeout(() => {
            hideLoading();
            window.location.href = '/login';
        }, 500);
    })
    .catch(error => {
        console.error('Logout error:', error);
        hideLoading();
        showToast('Logout failed', 'error');
        
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    });
}

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    // Button event listeners
    if (elements.addNewItem) elements.addNewItem.addEventListener('click', openAddModal);
    if (elements.saveItemBtn) elements.saveItemBtn.addEventListener('click', handleSaveItem);
    if (elements.cancelBtn) elements.cancelBtn.addEventListener('click', closeModal);
    if (elements.closeModal) elements.closeModal.addEventListener('click', closeModal);
    if (elements.refreshDashboard) elements.refreshDashboard.addEventListener('click', () => {
        fetchInventoryItems();
        updateDashboardStats();
    });
    if (elements.markAllRestocked) elements.markAllRestocked.addEventListener('click', markAllRestocked);
    if (elements.bulkOrder) elements.bulkOrder.addEventListener('click', createBulkOrder);
    if (elements.syncAllBtn) elements.syncAllBtn.addEventListener('click', syncAllItems);
    if (elements.showMappingsBtn) elements.showMappingsBtn.addEventListener('click', showMappings);
    if (elements.clearAllDataBtn) elements.clearAllDataBtn.addEventListener('click', clearAllInventoryData);
    
    // Form field event listeners
    if (elements.itemName) {
        elements.itemName.addEventListener('change', updateFromItemName);
    }
    
    if (elements.itemType) elements.itemType.addEventListener('change', updateFromItemType);
    if (elements.itemCategory) elements.itemCategory.addEventListener('change', updateFromCategory);
    
    // Navigation event listeners
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });
    
    elements.categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const category = item.getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    // Form submission
    if (elements.itemForm) {
        elements.itemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSaveItem();
        });
    }
    
    // Modal close on outside click
    if (elements.itemModal) {
        elements.itemModal.addEventListener('click', (e) => {
            if (e.target === elements.itemModal) closeModal();
        });
    }
    
    // Search input
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => debounceSearch(e.target.value));
    }
    
    // Window event listeners
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application with empty state
    allInventoryItems = []; // Start with empty array
    
    initializeEventListeners();
    
    // Load data from server
    fetchInventoryItems();
    updateDashboardStats();
});

// ==================== GLOBAL FUNCTION EXPORTS ====================
window.handleLogout = handleLogout;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.openRestockModal = openRestockModal;
window.debounceSearch = debounceSearch;
window.syncAllItems = syncAllItems;
window.showMappings = showMappings;
window.syncSingleItem = syncSingleItem;
window.filterByCategory = filterByCategory;
window.showSection = showSection;
window.submitRestock = submitRestock;
window.clearAllInventoryData = clearAllInventoryData;