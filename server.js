import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import { connectDB, User, Category, InventoryItem, Product, Order, Stats, MenuItem, StockNotification, Customer } from "./config/database.js";
import categoryRoutes from "./routes/categoryroute.js";
import productRoutes from "./routes/productroute.js";
import stockRequestRoutes from "./routes/stockrequestroute.js";

dotenv.config();

const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`ERROR: ${varName} not defined in .env file`);
    process.exit(1);
  }
});

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOW_STOCK_THRESHOLD = 5;

await connectDB();

// Comprehensive Recipe Mapping
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
        'Spaghetti (S)',
        'Spaghetti (M)',
        'Spaghetti (L)'
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
        'Cookies & Cream HC',
        'Cookies & Cream MC',
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
        'Milk Tea Regular HC',
        'Milk Tea Regular MC',
        'Cafe Latte Tall',
        'Cafe Latte Grande',
        'Caramel Macchiato Tall',
        'Caramel Macchiato Grande',
        'Matcha Green Tea HC',
        'Matcha Green Tea MC'
    ],
    'Milk': [
        'Milk Tea Regular HC',
        'Milk Tea Regular MC',
        'Cafe Latte Tall',
        'Cafe Latte Grande',
        'Caramel Macchiato Tall',
        'Caramel Macchiato Grande',
        'Matcha Green Tea HC',
        'Matcha Green Tea MC'
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
        'Pancit Bihon (S)',
        'Pancit Bihon (M)',
        'Pancit Bihon (L)',
        'Pancit Canton (S)',
        'Pancit Canton (M)',
        'Pancit Canton (L)',
        'Sinigang (PORK)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Cabbage': [
        'Pancit Bihon (S)',
        'Pancit Bihon (M)',
        'Pancit Bihon (L)',
        'Pancit Canton (S)',
        'Pancit Canton (M)',
        'Pancit Canton (L)',
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
        'Cucumber Lemonade (Glass)',
        'Cucumber Lemonade (Pitcher)',
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
        'Cucumber Lemonade (Glass)',
        'Cucumber Lemonade (Pitcher)',
        'Blue Lemonade (Glass)',
        'Blue Lemonade (Pitcher)'
    ],
    'Mint': [
        'Cucumber Lemonade (Glass)',
        'Cucumber Lemonade (Pitcher)',
        'Blue Lemonade (Glass)',
        'Blue Lemonade (Pitcher)'
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
        'Special Bulalo (good for 2-3 Persons)',
        'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)'
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
        'Pancit Bihon (S)',
        'Pancit Bihon (M)',
        'Pancit Bihon (L)',
        'Pancit Canton (S)',
        'Pancit Canton (M)',
        'Pancit Canton (L)'
    ],
    'Spaghetti noodles': [
        'Spaghetti (S)',
        'Spaghetti (M)',
        'Spaghetti (L)'
    ],
    'Oyster sauce': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)'
    ],
    'Banana ketchup': [
        'Spaghetti (S)',
        'Spaghetti (M)',
        'Spaghetti (L)'
    ],
    'Tomato sauce': [
        'Spaghetti (S)',
        'Spaghetti (M)',
        'Spaghetti (L)'
    ],
    'Sugar': [
        'All beverages',
        'Various dishes'
    ],
    'Blue curaçao syrup': [
        'Blue Lemonade (Glass)',
        'Blue Lemonade (Pitcher)'
    ],
    'Raspberry/red fruit tea powder': [
        'Red Tea (Glass)'
    ],
    'Espresso': [
        'Cafe Americano Tall',
        'Cafe Americano Grande',
        'Cafe Latte Tall',
        'Cafe Latte Grande',
        'Caramel Macchiato Tall',
        'Caramel Macchiato Grande'
    ],
    'Vanilla syrup': [
        'Caramel Macchiato Tall',
        'Caramel Macchiato Grande'
    ],
    'Caramel drizzle': [
        'Caramel Macchiato Tall',
        'Caramel Macchiato Grande'
    ],
    'Black tea leaves/powder': [
        'Milk Tea Regular HC',
        'Milk Tea Regular MC'
    ],
    'Matcha powder': [
        'Matcha Green Tea HC',
        'Matcha Green Tea MC',
        'Matcha Green Tea HC Frappe',
        'Matcha Green Tea MC Frappe'
    ],
    'Tapioca pearls (sago)': [
        'Milk Tea Regular HC',
        'Milk Tea Regular MC'
    ],
    'Sugar syrup': [
        'All Beverages'
    ],
    'Chocolate cookies (Oreo)': [
        'Cookies & Cream HC',
        'Cookies & Cream MC'
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
        'Special Bulalo (good for 2-3 Persons)',
        'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)'
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

// Reverse mapping
const reverseRecipeMapping = {};
for (const [ingredient, dishes] of Object.entries(recipeMapping)) {
    for (const dish of dishes) {
        if (!reverseRecipeMapping[dish]) {
            reverseRecipeMapping[dish] = [];
        }
        if (!reverseRecipeMapping[dish].includes(ingredient)) {
            reverseRecipeMapping[dish].push(ingredient);
        }
    }
}

// ==================== CORE FUNCTIONS ====================

// Check if a finished product can be made from available raw ingredients
const checkProductAvailability = async (productName) => {
    try {
        const requiredIngredients = reverseRecipeMapping[productName];
        if (!requiredIngredients || requiredIngredients.length === 0) {
            return { 
                available: true, 
                reason: 'No recipe constraints',
                requiredIngredients: [] 
            };
        }
        
        let allAvailable = true;
        const missingIngredients = [];
        const availableIngredients = [];
        
        for (const ingredient of requiredIngredients) {
            const inventoryItem = await InventoryItem.findOne({
                itemName: { $regex: new RegExp(`^${ingredient}$`, 'i') },
                itemType: 'raw',
                isActive: true
            });
            
            if (!inventoryItem) {
                allAvailable = false;
                missingIngredients.push(`${ingredient} (not found in inventory)`);
            } else if (inventoryItem.currentStock <= 0) {
                allAvailable = false;
                missingIngredients.push(`${ingredient} (out of stock)`);
            } else {
                availableIngredients.push({
                    ingredient,
                    currentStock: inventoryItem.currentStock,
                    minStock: inventoryItem.minStock
                });
                
                if (inventoryItem.currentStock < (inventoryItem.minStock || 10)) {
                    // Just log warning, don't block availability
                }
            }
        }
        
        return {
            available: allAvailable,
            missingIngredients,
            requiredIngredients,
            availableIngredients
        };
    } catch (error) {
        console.error('Error checking product availability:', error);
        return { 
            available: false, 
            error: error.message,
            requiredIngredients: [] 
        };
    }
};

// When raw ingredient is restocked, update related menu items availability
const updateRelatedMenuItems = async (rawIngredientName) => {
    try {
        const possibleDishes = recipeMapping[rawIngredientName];
        if (!possibleDishes || possibleDishes.length === 0) return;
        
        for (const dish of possibleDishes) {
            // Update menu item availability
            const menuItem = await MenuItem.findOne({
                itemName: { $regex: new RegExp(`^${dish}$`, 'i') }
            });
            
            if (menuItem) {
                // Check if all ingredients are now available
                const availability = await checkProductAvailability(dish);
                
                if (availability.available && menuItem.status === 'out_of_stock') {
                    menuItem.status = 'available';
                    menuItem.updatedAt = new Date();
                    menuItem.requiredIngredients = availability.requiredIngredients || [];
                    await menuItem.save();
                    
                    // Also update Product if exists
                    const product = await Product.findOne({
                        itemName: { $regex: new RegExp(`^${dish}$`, 'i') }
                    });
                    
                    if (product) {
                        product.status = 'available';
                        await product.save();
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error updating related menu items:', error);
    }
};

// When raw ingredient is used, check if it affects menu items
const checkAffectedMenuItems = async (rawIngredientName) => {
    try {
        const possibleDishes = recipeMapping[rawIngredientName];
        if (!possibleDishes || possibleDishes.length === 0) return;
        
        const inventoryItem = await InventoryItem.findOne({
            itemName: { $regex: new RegExp(`^${rawIngredientName}$`, 'i') },
            itemType: 'raw'
        });
        
        if (!inventoryItem || inventoryItem.currentStock <= 0) {
            // This ingredient is now out of stock, check all dishes that use it
            for (const dish of possibleDishes) {
                const availability = await checkProductAvailability(dish);
                
                if (!availability.available) {
                    // Mark menu item as out of stock
                    await MenuItem.findOneAndUpdate(
                        { itemName: { $regex: new RegExp(`^${dish}$`, 'i') } },
                        { 
                            status: 'out_of_stock',
                            updatedAt: new Date()
                        }
                    );
                    
                    // Also update Product if exists
                    await Product.findOneAndUpdate(
                        { itemName: { $regex: new RegExp(`^${dish}$`, 'i') } },
                        { status: 'out_of_stock' }
                    );
                }
            }
        }
    } catch (error) {
        console.error('Error checking affected menu items:', error);
    }
};

// Get recipe details for a specific dish
const getRecipeDetails = async (dishName) => {
    try {
        const requiredIngredients = reverseRecipeMapping[dishName] || [];
        const ingredientDetails = [];
        
        for (const ingredient of requiredIngredients) {
            const inventoryItem = await InventoryItem.findOne({
                itemName: { $regex: new RegExp(`^${ingredient}$`, 'i') },
                itemType: 'raw'
            });
            
            ingredientDetails.push({
                ingredient,
                available: inventoryItem ? inventoryItem.currentStock > 0 : false,
                currentStock: inventoryItem ? inventoryItem.currentStock : 0,
                minStock: inventoryItem ? inventoryItem.minStock : 0,
                unit: inventoryItem ? inventoryItem.unit : 'unit'
            });
        }
        
        return {
            dishName,
            requiredIngredients: ingredientDetails,
            totalIngredients: requiredIngredients.length,
            availableIngredients: ingredientDetails.filter(i => i.available).length
        };
    } catch (error) {
        console.error('Error getting recipe details:', error);
        return {
            dishName,
            requiredIngredients: [],
            totalIngredients: 0,
            availableIngredients: 0,
            error: error.message
        };
    }
};

// Initialize database with proper separation
const initializeDatabase = async () => {
    try {
        
        
        // Check and create admin user
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                status: 'active'
            });
           
        }
        
        // Check and create default categories
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            const defaultCategories = [
                { name: 'Rice Bowl Meals' },
                { name: 'Hot Sizzlers' },
                { name: 'Party Tray' },
                { name: 'Drinks' },
                { name: 'Coffee' },
                { name: 'Milk Tea' },
                { name: 'Frappe' },
                { name: 'Snacks & Appetizer' },
                { name: 'Budget Meals Served with Rice' },
                { name: 'Specialties' }
            ];
            await Category.insertMany(defaultCategories);
           
        }
        
        // Clean up any existing invalid MenuItem documents
        await MenuItem.deleteMany({
            $or: [
                { itemName: null },
                { itemName: '' },
                { itemName: undefined },
                { name: null },
                { name: '' },
                { name: undefined }
            ]
        });
        
        // Create all raw ingredients from recipe mapping
        const allIngredients = Object.keys(recipeMapping);
        
        // Define default categories for ingredients
        const ingredientCategories = {
            'Meat': ['Chicken', 'Pork slices', 'Pork belly', 'Ground pork', 'Bagnet', 'Pork ribs', 'Pork face & ears', 'Liver', 'Pork chop', 'Hotdogs', 'Bacon', 'Ham', 'Beef shanks and marrow'],
            'Seafood': ['Cream dory fillet', 'Shrimp', 'Smoked fish (tinapa)', 'Dried fish (tuyo)'],
            'Dairy': ['Butter', 'Eggs', 'Cheese', 'Grated cheese', 'Mayonnaise', 'Whipped cream', 'Cream cheese', 'Sour cream', 'Non-dairy creamer', 'Milk'],
            'Produce': ['Garlic', 'Onion', 'Green onions', 'Carrots', 'Cabbage', 'Tomato', 'Eggplant', 'Cucumber', 'Lettuce', 'Celery', 'Green beans', 'Spring onions', 'Chili peppers', 'Long green chili (siling haba)', 'Jalapeños', 'Potato strips', 'Corn on the cob', 'Ginger', 'Calamansi', 'Lemon', 'Mint', 'Kangkong (water spinach)', 'Radish', 'Sitaw (long beans)', 'Okra', 'Bitter melon (ampalaya)', 'Squash', 'Pechay (bok choy)', 'Basil or malunggay leaves', 'Mixed vegetables (peas, carrots)'],
            'Dry Goods': ['Soy sauce', 'Brown sugar', 'Gochujang (Korean chili paste)', 'Sesame oil', 'Sesame seeds', 'Salt', 'Black pepper', 'Whole peppercorns', 'Cornstarch', 'Cooking oil', 'Flour', 'Breadcrumbs', 'Honey', 'Chili flakes or hot sauce', 'Vinegar', 'Lumpia wrapper', 'Bihon/canton noodles', 'Spaghetti noodles', 'Oyster sauce', 'Banana ketchup', 'Tomato sauce', 'Sugar', 'Blue curaçao syrup', 'Raspberry/red fruit tea powder', 'Espresso', 'Vanilla syrup', 'Caramel drizzle', 'Black tea leaves/powder', 'Matcha powder', 'Tapioca pearls (sago)', 'Sugar syrup', 'Chocolate cookies (Oreo)', 'Strawberry syrup', 'Mango syrup/puree', 'Graham crumbs', 'Tortilla chips', 'Cheese sauce', 'Salsa', 'Tartar sauce', 'Bread', 'Nuts (pili or cashew)', 'Olive oil', 'Jasmine rice', 'Tamarind (sampaloc)', 'Bagoong (fermented shrimp paste)', 'Fish sauce (patis)', 'Bay leaves'],
            'Beverages': ['Sprite/7-Up', 'Branded soda (Coke, Sprite, Royal)', 'Ice', 'Water'],
            'Packaging': ['Paper cups', 'Straws', 'Food containers', 'Plastic utensils', 'Napkins']
        };
        
        // Default prices for ingredients (for demo purposes)
        const defaultPrices = {
            'Chicken': 200, 'Pork slices': 180, 'Pork belly': 220, 'Ground pork': 190,
            'Beef shanks and marrow': 250, 'Cream dory fillet': 180, 'Shrimp': 300,
            'Butter': 150, 'Eggs': 10, 'Cheese': 200, 'Garlic': 80, 'Onion': 60,
            'Cooking oil': 120, 'Jasmine rice': 50, 'Sugar': 40, 'Salt': 20
        };
        
        for (const ingredient of allIngredients) {
            // Determine category
            let category = 'Dry Goods';
            for (const [cat, items] of Object.entries(ingredientCategories)) {
                if (items.includes(ingredient)) {
                    category = cat;
                    break;
                }
            }
            
            // Determine unit
            let unit = 'kg';
            if (ingredient.includes('sauce') || ingredient.includes('oil') || ingredient.includes('syrup')) {
                unit = 'liter';
            } else if (ingredient.includes('eggs') || ingredient.includes('cups') || ingredient.includes('straws') || ingredient.includes('napkins')) {
                unit = 'pcs';
            } else if (ingredient.includes('leaves') || ingredient.includes('herbs')) {
                unit = 'bunch';
            } else if (ingredient.includes('ice') || ingredient.includes('water')) {
                unit = 'liter';
            }
            
            const exists = await InventoryItem.findOne({ 
                itemName: { $regex: new RegExp(`^${ingredient}$`, 'i') },
                itemType: 'raw'
            });
            
            if (!exists) {
                await InventoryItem.create({
                    itemName: ingredient,
                    itemType: 'raw',
                    category: category,
                    unit: unit,
                    minStock: 10,
                    currentStock: 20,
                    price: defaultPrices[ingredient] || 100,
                    isActive: true,
                    description: `Raw ingredient for various dishes`
                });
            
            }
        }
        
        // Seed menu items (finished products)
        const seedMenu = [
            // Rice Bowl Meals
            { itemName: 'Korean Spicy Bulgogi (Pork)', price: 180, category: 'Rice Bowl Meals' },
            { itemName: 'Korean Salt and Pepper (Pork)', price: 175, category: 'Rice Bowl Meals' },
            { itemName: 'Crispy Pork Lechon Kawali', price: 165, category: 'Rice Bowl Meals' },
            { itemName: 'Cream Dory Fish Fillet', price: 160, category: 'Rice Bowl Meals' },
            { itemName: 'Buttered Honey Chicken', price: 155, category: 'Rice Bowl Meals' },
            { itemName: 'Buttered Spicy Chicken', price: 155, category: 'Rice Bowl Meals' },
            { itemName: 'Chicken Adobo', price: 145, category: 'Rice Bowl Meals' },
            { itemName: 'Pork Shanghai', price: 140, category: 'Rice Bowl Meals' },
            
            // Hot Sizzlers
            { itemName: 'Sizzling Pork Sisig', price: 220, category: 'Hot Sizzlers' },
            { itemName: 'Sizzling Liempo', price: 210, category: 'Hot Sizzlers' },
            { itemName: 'Sizzling Porkchop', price: 195, category: 'Hot Sizzlers' },
            { itemName: 'Sizzling Fried Chicken', price: 185, category: 'Hot Sizzlers' },
            
            // Party Tray
            { itemName: 'Pancit Bihon (S)', price: 350, category: 'Party Tray' },
            { itemName: 'Pancit Bihon (M)', price: 550, category: 'Party Tray' },
            { itemName: 'Pancit Bihon (L)', price: 750, category: 'Party Tray' },
            { itemName: 'Pancit Canton (S)', price: 380, category: 'Party Tray' },
            { itemName: 'Pancit Canton (M)', price: 580, category: 'Party Tray' },
            { itemName: 'Pancit Canton (L)', price: 780, category: 'Party Tray' },
            { itemName: 'Spaghetti (S)', price: 400, category: 'Party Tray' },
            { itemName: 'Spaghetti (M)', price: 600, category: 'Party Tray' },
            { itemName: 'Spaghetti (L)', price: 800, category: 'Party Tray' },
            
            // Drinks
            { itemName: 'Cucumber Lemonade (Glass)', price: 60, category: 'Drinks' },
            { itemName: 'Cucumber Lemonade (Pitcher)', price: 180, category: 'Drinks' },
            { itemName: 'Blue Lemonade (Glass)', price: 65, category: 'Drinks' },
            { itemName: 'Blue Lemonade (Pitcher)', price: 190, category: 'Drinks' },
            { itemName: 'Red Tea (Glass)', price: 55, category: 'Drinks' },
            { itemName: 'Soda (Mismo)', price: 25, category: 'Drinks' },
            { itemName: 'Soda 1.5L', price: 65, category: 'Drinks' },
            
            // Coffee
            { itemName: 'Cafe Americano Tall', price: 80, category: 'Coffee' },
            { itemName: 'Cafe Americano Grande', price: 95, category: 'Coffee' },
            { itemName: 'Cafe Latte Tall', price: 90, category: 'Coffee' },
            { itemName: 'Cafe Latte Grande', price: 105, category: 'Coffee' },
            { itemName: 'Caramel Macchiato Tall', price: 100, category: 'Coffee' },
            { itemName: 'Caramel Macchiato Grande', price: 115, category: 'Coffee' },
            
            // Milk Tea
            { itemName: 'Milk Tea Regular HC', price: 85, category: 'Milk Tea' },
            { itemName: 'Milk Tea Regular MC', price: 95, category: 'Milk Tea' },
            { itemName: 'Matcha Green Tea HC', price: 90, category: 'Milk Tea' },
            { itemName: 'Matcha Green Tea MC', price: 100, category: 'Milk Tea' },
            
            // Frappe
            { itemName: 'Matcha Green Tea HC Frappe', price: 120, category: 'Frappe' },
            { itemName: 'Matcha Green Tea MC Frappe', price: 135, category: 'Frappe' },
            { itemName: 'Cookies & Cream HC Frappe', price: 125, category: 'Frappe' },
            { itemName: 'Cookies & Cream MC Frappe', price: 140, category: 'Frappe' },
            { itemName: 'Strawberry & Cream HC Frappe', price: 130, category: 'Frappe' },
            { itemName: 'Mango cheese cake HC Frappe', price: 135, category: 'Frappe' },
            
            // Snacks & Appetizer
            { itemName: 'Cheesy Nachos', price: 150, category: 'Snacks & Appetizer' },
            { itemName: 'Nachos Supreme', price: 180, category: 'Snacks & Appetizer' },
            { itemName: 'French fries', price: 90, category: 'Snacks & Appetizer' },
            { itemName: 'Clubhouse Sandwich', price: 120, category: 'Snacks & Appetizer' },
            { itemName: 'Fish and Fries', price: 160, category: 'Snacks & Appetizer' },
            { itemName: 'Cheesy Dynamite Lumpia', price: 25, category: 'Snacks & Appetizer' },
            { itemName: 'Lumpiang Shanghai', price: 20, category: 'Snacks & Appetizer' },
            
            // Budget Meals Served with Rice
            { itemName: 'Budget Meal: Fried Chicken', price: 95, category: 'Budget Meals Served with Rice' },
            { itemName: 'Budget Meal: Buttered Honey Chicken', price: 105, category: 'Budget Meals Served with Rice' },
            { itemName: 'Budget Meal: Buttered Spicy Chicken', price: 105, category: 'Budget Meals Served with Rice' },
            { itemName: 'Tinapa Rice', price: 85, category: 'Budget Meals Served with Rice' },
            { itemName: 'Tuyo Pesto', price: 80, category: 'Budget Meals Served with Rice' },
            { itemName: 'Fried Rice', price: 50, category: 'Budget Meals Served with Rice' },
            { itemName: 'Plain Rice', price: 25, category: 'Budget Meals Served with Rice' },
            
            // Specialties
            { itemName: 'Sinigang (PORK)', price: 280, category: 'Specialties' },
            { itemName: 'Sinigang (Shrimp)', price: 320, category: 'Specialties' },
            { itemName: 'Paknet (Pakbet w/ Bagnet)', price: 260, category: 'Specialties' },
            { itemName: 'Buttered Shrimp', price: 300, category: 'Specialties' },
            { itemName: 'Special Bulalo (good for 2-3 Persons)', price: 450, category: 'Specialties' },
            { itemName: 'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)', price: 850, category: 'Specialties' },
            
            // Additional items from recipe mapping that might be missing
            { itemName: 'Pork Adobo', price: 150, category: 'Rice Bowl Meals' }
        ];

        let successfulCount = 0;
        let failedCount = 0;

        for (const item of seedMenu) {
            try {
                // Check if menu item exists
                const existingMenuItem = await MenuItem.findOne({ 
                    itemName: { $regex: new RegExp(`^${item.itemName}$`, 'i') }
                });
                
                // Check if product exists
                const existingProduct = await Product.findOne({ 
                    itemName: { $regex: new RegExp(`^${item.itemName}$`, 'i') } 
                });
                
                if (!existingMenuItem) {
                    // Check availability based on raw ingredients
                    const availability = await checkProductAvailability(item.itemName);
                    
                    const menuItemData = {
                        itemName: item.itemName,
                        name: item.itemName,
                        price: item.price || 100,
                        category: item.category || 'Uncategorized',
                        description: item.description || '',
                        status: availability.available ? 'available' : 'out_of_stock',
                        isActive: true,
                        stockType: 'unlimited',
                        requiredIngredients: availability.requiredIngredients || []
                    };
                    
                    await MenuItem.create(menuItemData);
                    successfulCount++;
                }
                
                if (!existingProduct) {
                    const availability = await checkProductAvailability(item.itemName);
                    
                    const productData = {
                        itemName: item.itemName,
                        price: item.price || 100,
                        category: item.category || 'Uncategorized',
                        stock: 999,
                        image: 'default_food.jpg',
                        status: availability.available ? 'available' : 'out_of_stock',
                        description: item.description || ''
                    };
                    
                    await Product.create(productData);
                }
            } catch (err) {
                failedCount++;
                console.error(`   ❌ Error seeding ${item.itemName}:`, err.message);
            }
        }
        
       
    
        
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

await initializeDatabase();

// WebSocket-like functionality for admin notifications
const adminClients = new Set();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));
// Serve default_food.png when code requests default_food.jpg
app.get('/images/default_food.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'images', 'default_food.png'));
});
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// Middleware
const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            const wantsJson = req.path.startsWith('/api/') || req.xhr || (req.get && req.get('Accept') && req.get('Accept').includes('application/json'));
            if (wantsJson) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            return res.redirect("/login");
        }

        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.clearCookie("token");
        const wantsJson = req.path.startsWith('/api/') || req.xhr || (req.get && req.get('Accept') && req.get('Accept').includes('application/json'));
        if (wantsJson) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
        res.redirect("/login");
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.redirect("/staffdashboard");
    }
    next();
};

// Real-time updates for admin dashboard
app.get('/api/admin/events', verifyToken, verifyAdmin, (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
    });

    res.write('data: {"type": "connected", "message": "Connected to real-time updates"}\n\n');

    const clientId = Date.now();
    const client = {
        id: clientId,
        res: res
    };
    
    adminClients.add(client);

    req.on('close', () => {
        adminClients.delete(client);
    });
});

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

const sendOrderNotification = (order) => {
    broadcastToAdmins({
        type: 'new_order',
        data: {
            id: order._id.toString(),
            orderNumber: order.orderNumber || `ORD-${Date.now()}`,
            total: order.total || 0,
            type: order.type || 'Dine In',
            paymentMethod: order.payment?.method || 'cash',
            timestamp: new Date().toLocaleTimeString(),
            items: order.items?.length || 0,
            createdAt: order.createdAt || new Date(),
            customerId: order.customerId || null
        },
        message: `New order #${order.orderNumber} received!`
    });
};

const sendLowStockAlert = async (inventoryItem) => {
    const lowStockCount = await InventoryItem.countDocuments({
        currentStock: { $lt: LOW_STOCK_THRESHOLD, $gte: 1 },
        isActive: true
    });

    broadcastToAdmins({
        type: 'low_stock_alert',
        data: {
            inventoryItemId: inventoryItem._id,
            itemName: inventoryItem.itemName,
            currentStock: inventoryItem.currentStock,
            minStock: inventoryItem.minStock,
            lowStockCount: lowStockCount
        },
        message: `Low stock alert: ${inventoryItem.itemName} has only ${inventoryItem.currentStock} left!`
    });
};

// Helper function to generate customer ID
const generateCustomerId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock-requests", verifyToken, stockRequestRoutes);

// ==================== INVENTORY ROUTES (RAW INGREDIENTS ONLY) ====================

// Get inventory items (raw ingredients only)
app.get("/api/inventory", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const items = await InventoryItem.find({ itemType: 'raw' }).sort({ createdAt: -1 });
        
        // Add recipe info to each item
        const itemsWithRecipeInfo = items.map(item => {
            const itemObj = item.toObject();
            const possibleDishes = recipeMapping[item.itemName];
            
            if (possibleDishes && possibleDishes.length > 0) {
                itemObj.canMake = possibleDishes;
            }
            
            return itemObj;
        });
        
        res.json({ success: true, data: itemsWithRecipeInfo });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

app.get("/api/inventory/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const item = await InventoryItem.findOne({ 
            _id: req.params.id, 
            itemType: 'raw' 
        });
        
        if (!item) {
            return res.status(404).json({ 
                success: false, 
                message: 'Raw ingredient not found' 
            });
        }

        const itemObj = item.toObject();
        const possibleDishes = recipeMapping[item.itemName];
        
        if (possibleDishes && possibleDishes.length > 0) {
            itemObj.canMake = possibleDishes;
        }

        res.json({ success: true, data: itemObj });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Create inventory item (raw ingredient only)
app.post("/api/inventory", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { 
            itemName, 
            category, 
            description,
            currentStock,
            minStock,
            unit,
            price,
            isActive
        } = req.body;

        if (!itemName || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'Item name and category are required' 
            });
        }

        const newItem = new InventoryItem({
            itemName,
            itemType: "raw",
            category,
            description: description || '',
            currentStock: currentStock || 0,
            minStock: minStock || 10,
            unit: unit || 1,
            isActive: isActive !== undefined ? isActive : true,
            price: price || 0
        });

        await newItem.save();

        // Check related menu items availability
        await updateRelatedMenuItems(itemName);

        res.status(201).json({ 
            success: true, 
            message: 'Raw ingredient added successfully',
            data: newItem
        });
    } catch (error) {
        console.error('Error creating inventory item:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Update inventory item (raw ingredient only)
app.put("/api/inventory/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { 
            itemName, 
            category, 
            description,
            currentStock,
            minStock,
            unit,
            price,
            isActive
        } = req.body;

        const updatedItem = await InventoryItem.findOneAndUpdate(
            { _id: req.params.id, itemType: 'raw' },
            { 
                itemName, 
                category,
                description,
                currentStock,
                minStock,
                unit,
                isActive,
                price: price || 0,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Raw ingredient not found' 
            });
        }

        // Check related menu items availability
        await updateRelatedMenuItems(itemName);

        res.json({ 
            success: true, 
            message: 'Raw ingredient updated successfully',
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating inventory item:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Delete inventory item (raw ingredient only)
app.delete("/api/inventory/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const deletedItem = await InventoryItem.findOneAndDelete({ 
            _id: req.params.id, 
            itemType: 'raw' 
        });

        if (!deletedItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Raw ingredient not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Raw ingredient deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Restock inventory (raw ingredient only)
app.post("/api/inventory/:id/restock", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { quantity, notes, price } = req.body;
        const itemId = req.params.id;
        
        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid quantity greater than 0'
            });
        }
        
        const item = await InventoryItem.findOne({ 
            _id: itemId, 
            itemType: 'raw' 
        });
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Raw ingredient not found'
            });
        }
        
        const oldStock = item.currentStock;
        item.currentStock += parseFloat(quantity);
        
        item.restockHistory.push({
            quantity: parseFloat(quantity),
            price: parseFloat(price || 0),
            notes: notes || '',
            addedBy: req.user.id
        });
        
        await item.save();
        
        // Check low stock alert
        if (item.currentStock > 0 && item.currentStock < (item.minStock || 10)) {
            sendLowStockAlert(item);
        }
        
        // Update related menu items availability
        await updateRelatedMenuItems(item.itemName);
        
        res.json({
            success: true,
            message: 'Raw ingredient restocked successfully',
            data: item
        });
    } catch (error) {
        console.error('Restock error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Use inventory item (raw ingredient only)
app.post("/api/inventory/:id/use", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { quantity, notes } = req.body;
        const itemId = req.params.id;
        
        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid quantity greater than 0'
            });
        }
        
        const item = await InventoryItem.findOne({ 
            _id: itemId, 
            itemType: 'raw' 
        });
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Raw ingredient not found'
            });
        }
        
        if (item.currentStock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${item.currentStock}, Requested: ${quantity}`
            });
        }
        
        const oldStock = item.currentStock;
        item.currentStock -= parseFloat(quantity);
        
        item.usageHistory.push({
            quantity: parseFloat(quantity),
            notes: notes || '',
            usedBy: req.user.id
        });
        
        await item.save();
        
        // Check if stock is now low
        if (item.currentStock > 0 && item.currentStock < (item.minStock || 10)) {
            sendLowStockAlert(item);
        }
        
        // Check affected menu items
        await checkAffectedMenuItems(item.itemName);
        
        res.json({
            success: true,
            message: 'Raw ingredient used successfully',
            data: item
        });
    } catch (error) {
        console.error('Use inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Filter and search inventory (raw ingredients only)
app.get("/api/inventory/filter/search", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { itemType: 'raw' };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.itemName = { $regex: search, $options: 'i' };
        }

        const items = await InventoryItem.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get inventory categories (for raw ingredients)
app.get("/api/inventory/categories", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const categories = await InventoryItem.distinct("category", { itemType: 'raw' });
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get inventory stats (raw ingredients only)
app.get("/api/inventory/stats", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const totalItems = await InventoryItem.countDocuments({ itemType: 'raw' });
        
        const allItems = await InventoryItem.find({ itemType: 'raw' }).lean();
        
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalValue = 0;
        
        for (const item of allItems) {
            const minStockValue = item.minStock || 10;
            const currentStockValue = item.currentStock || 0;
            const price = item.price || 0;
            
            totalValue += currentStockValue * price;
            
            if (currentStockValue === 0) {
                outOfStockCount++;
            } else if (currentStockValue > 0 && currentStockValue <= minStockValue) {
                lowStockCount++;
            }
        }
        
        res.json({
            success: true,
            data: {
                totalItems,
                lowStock: lowStockCount,
                outOfStock: outOfStockCount,
                totalValue
            }
        });
    } catch (error) {
        console.error('Inventory stats error:', error);
        res.json({
            success: true,
            data: {
                totalItems: 0,
                lowStock: 0,
                outOfStock: 0,
                totalValue: 0
            }
        });
    }
});

// Get items needing restock (raw ingredients only)
app.get("/api/inventory/needs-restock", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const items = await InventoryItem.find({
            itemType: 'raw',
            $or: [
                { currentStock: 0 },
                { 
                    $expr: { 
                        $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }]
                    }
                }
            ],
            isActive: true
        }).sort({ currentStock: 1 });
        
        res.json({
            success: true,
            data: items
        });
    } catch (error) {
        console.error('Error fetching items needing restock:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get recipe details for an inventory item
app.get("/api/inventory/:id/recipe-details", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const item = await InventoryItem.findOne({ 
            _id: req.params.id, 
            itemType: 'raw' 
        });
        
        if (!item) {
            return res.status(404).json({ 
                success: false, 
                message: 'Raw ingredient not found' 
            });
        }

        const possibleDishes = recipeMapping[item.itemName] || [];
        const dishDetails = [];
        
        for (const dish of possibleDishes) {
            const recipeDetails = await getRecipeDetails(dish);
            dishDetails.push(recipeDetails);
        }
        
        res.json({
            success: true,
            data: {
                ingredient: item.itemName,
                possibleDishes,
                dishDetails
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ==================== MENU MANAGEMENT ROUTES (FINISHED PRODUCTS ONLY) ====================

// Get all menu items (finished products)
app.get("/api/menu", verifyToken, async (req, res) => {
    try {
        const { category, search, status } = req.query;
        let query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (status && status !== 'all') {
            if (status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            } else if (status === 'available') {
                query.status = 'available';
                query.isActive = true;
            } else if (status === 'out_of_stock') {
                query.status = 'out_of_stock';
                query.isActive = true;
            }
        }

        if (search) {
            query.itemName = { $regex: search, $options: 'i' };
        }

        const items = await MenuItem.find(query).sort({ itemName: 1 });
        
        // Add availability info
        const itemsWithAvailability = await Promise.all(items.map(async (item) => {
            const itemObj = item.toObject();
            const availability = await checkProductAvailability(item.itemName);
            const recipeDetails = await getRecipeDetails(item.itemName);
            
            itemObj.availability = availability;
            itemObj.canBeMade = availability.available;
            itemObj.missingIngredients = availability.missingIngredients;
            itemObj.recipeDetails = recipeDetails;
            
            return itemObj;
        }));
        
        res.json({ success: true, data: itemsWithAvailability });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get single menu item
app.get("/api/menu/:id", verifyToken, async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ 
                success: false, 
                message: 'Menu item not found' 
            });
        }

        const itemObj = item.toObject();
        const availability = await checkProductAvailability(item.itemName);
        const recipeDetails = await getRecipeDetails(item.itemName);
        
        itemObj.availability = availability;
        itemObj.canBeMade = availability.available;
        itemObj.missingIngredients = availability.missingIngredients;
        itemObj.requiredIngredients = availability.requiredIngredients || [];
        itemObj.recipeDetails = recipeDetails;

        res.json({ success: true, data: itemObj });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Create menu item (finished product)
app.post("/api/menu", verifyToken, verifyAdmin, async (req, res) => {
    try {
        console.log('📥 Received menu item creation request:', req.body);
        
        const { 
            name,
            itemName,
            price, 
            category, 
            description,
            stockType,
            requiredIngredients,
            isActive
        } = req.body;

        const finalItemName = name || itemName;
        
        console.log('🔍 Validating fields:', { finalItemName, price, category });
        
        if (!finalItemName || !price || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, price and category are required' 
            });
        }

        // Check availability based on raw ingredients
        const availability = await checkProductAvailability(finalItemName);

        const menuItemData = {
            itemName: finalItemName,
            name: finalItemName,
            price,
            category,
            description: description || '',
            stockType: stockType || 'unlimited',
            status: availability.available ? 'available' : 'out_of_stock',
            isActive: isActive !== undefined ? isActive : true,
            requiredIngredients: requiredIngredients || availability.requiredIngredients || []
        };

        

        const newItem = new MenuItem(menuItemData);
        await newItem.save();

        

        // Also create Product record for POS system
        const existingProduct = await Product.findOne({
            itemName: { $regex: new RegExp(`^${finalItemName}$`, 'i') }
        });

        if (!existingProduct) {
            const product = new Product({
                itemName: finalItemName,
                price,
                category,
                stock: 999,
                image: 'default_food.jpg',
                status: availability.available ? 'available' : 'out_of_stock',
                description: description || '',
                menuItemId: newItem._id
            });

            await product.save();
        }

        res.status(201).json({ 
            success: true, 
            message: 'Menu item added successfully',
            data: newItem
        });
    } catch (error) {
        console.error('❌ Error creating menu item:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
});

// Update menu item (finished product)
app.put("/api/menu/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { 
            name,
            itemName,
            price, 
            category, 
            description,
            stockType,
            requiredIngredients,
            isActive
        } = req.body;

        const finalItemName = name || itemName;

        const updatedItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { 
                itemName: finalItemName,
                name: finalItemName,
                price, 
                category,
                description,
                stockType,
                isActive,
                requiredIngredients,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Menu item not found' 
            });
        }

        // Update corresponding Product
        await Product.findOneAndUpdate(
            { menuItemId: updatedItem._id },
            {
                itemName: finalItemName,
                price,
                category,
                status: updatedItem.status,
                description,
                updatedAt: new Date()
            }
        );

        res.json({ 
            success: true, 
            message: 'Menu item updated successfully',
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Delete menu item (finished product)
app.delete("/api/menu/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Menu item not found' 
            });
        }

        // Also delete corresponding Product
        await Product.findOneAndDelete({ menuItemId: deletedItem._id });

        res.json({ 
            success: true, 
            message: 'Menu item deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Check menu item availability
app.get("/api/menu/:id/availability", verifyToken, async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        
        if (!menuItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Menu item not found' 
            });
        }

        const availability = await checkProductAvailability(menuItem.itemName);
        const recipeDetails = await getRecipeDetails(menuItem.itemName);
        
        // Update menu item status if changed
        if (menuItem.status !== (availability.available ? 'available' : 'out_of_stock')) {
            menuItem.status = availability.available ? 'available' : 'out_of_stock';
            menuItem.requiredIngredients = availability.requiredIngredients || [];
            await menuItem.save();
            
            // Update Product status
            await Product.findOneAndUpdate(
                { menuItemId: menuItem._id },
                { status: menuItem.status }
            );
        }

        res.json({
            success: true,
            data: {
                menuItem: menuItem.itemName,
                available: availability.available,
                missingIngredients: availability.missingIngredients,
                requiredIngredients: availability.requiredIngredients,
                recipeDetails,
                status: menuItem.status
            }
        });
    } catch (error) {
        console.error('Error checking menu item availability:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get recipe details for a menu item
app.get("/api/menu/:id/recipe", verifyToken, async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        
        if (!menuItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Menu item not found' 
            });
        }

        const recipeDetails = await getRecipeDetails(menuItem.itemName);
        
        res.json({
            success: true,
            data: recipeDetails
        });
    } catch (error) {
        console.error('Error getting recipe details:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Bulk check menu items availability
app.post("/api/menu/check-availability", verifyToken, async (req, res) => {
    try {
        const { menuItemIds } = req.body;
        
        if (!menuItemIds || !Array.isArray(menuItemIds)) {
            return res.status(400).json({
                success: false,
                message: 'Menu item IDs array is required'
            });
        }
        
        const results = [];
        
        for (const menuItemId of menuItemIds) {
            try {
                const menuItem = await MenuItem.findById(menuItemId);
                
                if (menuItem) {
                    const availability = await checkProductAvailability(menuItem.itemName);
                    
                    results.push({
                        menuItemId: menuItem._id,
                        itemName: menuItem.itemName,
                        available: availability.available,
                        missingIngredients: availability.missingIngredients,
                        currentStatus: menuItem.status
                    });
                }
            } catch (err) {
                console.error(`Error checking menu item ${menuItemId}:`, err.message);
                results.push({
                    menuItemId,
                    error: err.message
                });
            }
        }
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error in bulk availability check:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get menu categories
app.get("/api/menu/categories", verifyToken, async (req, res) => {
    try {
        const categories = await MenuItem.distinct("category", { isActive: true });
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get menu stats
app.get("/api/menu/stats", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const totalItems = await MenuItem.countDocuments({ isActive: true });
        const availableItems = await MenuItem.countDocuments({ 
            status: 'available', 
            isActive: true 
        });
        const outOfStockItems = await MenuItem.countDocuments({ 
            status: 'out_of_stock', 
            isActive: true 
        });
        
        // Get categories count
        const categories = await MenuItem.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        res.json({
            success: true,
            data: {
                totalItems,
                availableItems,
                outOfStockItems,
                categories
            }
        });
    } catch (error) {
        console.error('Menu stats error:', error);
        res.json({
            success: true,
            data: {
                totalItems: 0,
                availableItems: 0,
                outOfStockItems: 0,
                categories: []
            }
        });
    }
});

// ==================== PRODUCT AVAILABILITY ENDPOINTS ====================

// Check product availability based on raw ingredients
app.get("/api/products/:itemName/availability", verifyToken, async (req, res) => {
    try {
        const productName = decodeURIComponent(req.params.itemName);
        const availability = await checkProductAvailability(productName);
        const recipeDetails = await getRecipeDetails(productName);
        
        res.json({
            success: true,
            data: {
                ...availability,
                recipeDetails
            }
        });
    } catch (error) {
        console.error('Error checking product availability:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get all recipe mappings
app.get("/api/recipes/mappings", verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Return a summary instead of the entire mapping
        const ingredientCount = Object.keys(recipeMapping).length;
        const dishCount = Object.keys(reverseRecipeMapping).length;
        
        res.json({
            success: true,
            data: {
                ingredientCount,
                dishCount,
                sampleIngredients: Object.keys(recipeMapping).slice(0, 20),
                sampleDishes: Object.keys(reverseRecipeMapping).slice(0, 20)
            }
        });
    } catch (error) {
        console.error('Error getting recipe mappings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get recipe for specific dish
app.get("/api/recipes/dish/:dishName", verifyToken, async (req, res) => {
    try {
        const dishName = decodeURIComponent(req.params.dishName);
        const recipeDetails = await getRecipeDetails(dishName);
        
        res.json({
            success: true,
            data: recipeDetails
        });
    } catch (error) {
        console.error('Error getting recipe:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get dishes that use specific ingredient
app.get("/api/recipes/ingredient/:ingredientName", verifyToken, async (req, res) => {
    try {
        const ingredientName = decodeURIComponent(req.params.ingredientName);
        const dishes = recipeMapping[ingredientName] || [];
        
        const dishDetails = [];
        for (const dish of dishes) {
            const details = await getRecipeDetails(dish);
            dishDetails.push(details);
        }
        
        res.json({
            success: true,
            data: {
                ingredient: ingredientName,
                dishes,
                dishDetails
            }
        });
    } catch (error) {
        console.error('Error getting ingredient usage:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create recipe mapping
app.post("/api/recipes/mapping", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { rawIngredient, finishedProduct } = req.body;
        
        if (!rawIngredient || !finishedProduct) {
            return res.status(400).json({
                success: false,
                message: 'Raw ingredient and finished product are required'
            });
        }
        
        // Add to recipe mapping
        if (!recipeMapping[rawIngredient]) {
            recipeMapping[rawIngredient] = [];
        }
        
        if (!recipeMapping[rawIngredient].includes(finishedProduct)) {
            recipeMapping[rawIngredient].push(finishedProduct);
        }
        
        // Update reverse mapping
        if (!reverseRecipeMapping[finishedProduct]) {
            reverseRecipeMapping[finishedProduct] = [];
        }
        
        if (!reverseRecipeMapping[finishedProduct].includes(rawIngredient)) {
            reverseRecipeMapping[finishedProduct].push(rawIngredient);
        }
        
        // Update affected menu item
        const menuItem = await MenuItem.findOne({
            itemName: { $regex: new RegExp(`^${finishedProduct}$`, 'i') }
        });
        
        if (menuItem) {
            // Update required ingredients
            if (!menuItem.requiredIngredients.includes(rawIngredient)) {
                menuItem.requiredIngredients.push(rawIngredient);
                await menuItem.save();
            }
            
            // Check availability
            const availability = await checkProductAvailability(finishedProduct);
            if (menuItem.status !== (availability.available ? 'available' : 'out_of_stock')) {
                menuItem.status = availability.available ? 'available' : 'out_of_stock';
                await menuItem.save();
                
                // Update Product
                await Product.findOneAndUpdate(
                    { menuItemId: menuItem._id },
                    { status: menuItem.status }
                );
            }
        }
        
        res.json({
            success: true,
            message: 'Recipe mapping added successfully',
            data: {
                rawIngredient,
                finishedProduct
            }
        });
    } catch (error) {
        console.error('Error creating recipe mapping:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== DASHBOARD AND OTHER ROUTES ====================

// Dashboard stats
app.get("/api/dashboard/stats", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        
        // Get today's orders
        const today = new Date();
        const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59));
        
        const todaysOrders = await Order.countDocuments({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });
        
        const totalMenuItems = await MenuItem.countDocuments({ isActive: true });
        const availableMenuItems = await MenuItem.countDocuments({ 
            status: 'available', 
            isActive: true 
        });
        
        const totalCustomers = await Customer.countDocuments();
        const totalProducts = await totalProducts.countDocuments({ itemType: 'raw' });
        const totalRevenueResult = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;
        
        // Today's revenue
        const todaysRevenueResult = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const todaysRevenue = todaysRevenueResult[0]?.total || 0;

        const inventoryLowStock = await InventoryItem.countDocuments({
            itemType: 'raw',
            $expr: {
                $and: [
                    { $gt: ["$currentStock", 0] },
                    { $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }] }
                ]
            },
            isActive: true
        });
        
        const inventoryOutOfStock = await InventoryItem.countDocuments({
            itemType: 'raw',
            currentStock: 0,
            isActive: true
        });

        res.json({
            success: true,
            data: {
                totalOrders,
                todaysOrders,
                totalMenuItems,
                availableMenuItems,
                totalCustomers,
                totalRevenue,
                todaysRevenue,
                totalProducts,
                inventoryLowStock,
                inventoryOutOfStock
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
});

// ==================== ORDER PROCESSING ====================

app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        
        if (!orderData.items || !orderData.items.length) {
            return res.status(400).json({ 
                success: false, 
                message: "No items in order" 
            });
        }
        
        if (!orderData.total || orderData.total <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Total amount is required and must be greater than 0" 
            });
        }
        
        if (!orderData.payment || !orderData.payment.amountPaid) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment amount is required" 
            });
        }
        
        const amountPaid = orderData.payment.amountPaid || 0;
        const total = orderData.total || 0;
        const change = amountPaid - total;
        
        if (change < 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Insufficient payment amount" 
            });
        }
        
        if (!orderData.type) {
            orderData.type = "Dine In";
        }
        
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const startOfToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
        const endOfToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59));
        const orderCount = await Order.countDocuments({
            createdAt: {
                $gte: startOfToday,
                $lt: endOfToday
            }
        });
        const orderNumber = `ORD-${dateStr}-${(orderCount + 1).toString().padStart(3, '0')}`;
        
        // Customer handling
        let customerId = orderData.customerId;
        let customer = null;
        
        if (customerId) {
            // Try to find existing customer
            customer = await Customer.findOne({ customerId: customerId });
        }
        
        // If no customer found or no customerId provided, create a new one
        if (!customer) {
            customerId = generateCustomerId();
            
            customer = new Customer({
                customerId: customerId,
                totalOrders: 1,
                totalSpent: orderData.total,
                lastOrderDate: new Date()
            });
            
            // Save customer
            const savedCustomer = await customer.save();
        } else {
            // Update existing customer stats
            customer.totalOrders += 1;
            customer.totalSpent += orderData.total;
            customer.lastOrderDate = new Date();
            
            const updatedCustomer = await customer.save();
        }
        
        // VALIDATE that customerId is definitely set before creating order
        if (!customerId || customerId.length === 0) {
            console.error('🚨 CRITICAL ERROR: customerId is empty after customer creation!');
            throw new Error('Customer ID is missing - cannot create order');
        }
        
        const order = new Order({
            orderNumber,
            items: orderData.items.map(item => ({
                itemName: item.itemName || "Unknown Item",
                price: item.price || 0,
                quantity: item.quantity || 1,
                size: item.size || "Regular",
                image: item.image || 'default_food.jpg',
                productId: item.id || null,
                vatable: item.vatable !== undefined ? item.vatable : true
            })),
            subtotal: orderData.subtotal || 0,
            tax: orderData.tax || 0,
            total: orderData.total,
            payment: {
                method: orderData.payment?.method || "cash",
                amountPaid: amountPaid,
                change: change,
                status: "completed"
            },
            type: orderData.type,
            status: "completed",
            notes: orderData.notes || "",
            customerId: customerId
        });
        
        const savedOrder = await order.save();
        
        sendOrderNotification(savedOrder);
        
        // Broadcast stats update to refresh dashboard
        broadcastToAdmins({
            type: 'stats_update',
            data: {
                totalOrders: await Order.countDocuments(),
                totalCustomers: await Customer.countDocuments(),
                lastOrderTime: new Date().toLocaleTimeString()
            },
            message: 'Dashboard stats updated'
        });
        
        // ==================== USE RAW INGREDIENTS WHEN ORDER IS PLACED ====================
        try {
            for (const item of orderData.items) {
                // Find the menu item to get required ingredients
                const menuItem = await MenuItem.findOne({
                    itemName: { $regex: new RegExp(`^${item.itemName}$`, 'i') }
                });
                
                if (menuItem && menuItem.requiredIngredients && menuItem.requiredIngredients.length > 0) {
                    // Use raw ingredients based on recipe
                    for (const ingredient of menuItem.requiredIngredients) {
                        const inventoryItem = await InventoryItem.findOne({
                            itemName: { $regex: new RegExp(`^${ingredient}$`, 'i') },
                            itemType: 'raw'
                        });
                        
                        if (inventoryItem) {
                            // Calculate usage based on quantity ordered
                            // For simplicity, we'll assume 1 unit of raw ingredient per dish
                            const usageQuantity = item.quantity || 1;
                            
                            if (inventoryItem.currentStock >= usageQuantity) {
                                inventoryItem.currentStock -= usageQuantity;
                                inventoryItem.usageHistory.push({
                                    quantity: usageQuantity,
                                    notes: `Used for ${item.quantity}x ${item.itemName} (Order: ${savedOrder.orderNumber})`,
                                    usedBy: 'system'
                                });
                                
                                await inventoryItem.save();
                                
                                // Check if stock is now low
                                if (inventoryItem.currentStock > 0 && inventoryItem.currentStock < (inventoryItem.minStock || 10)) {
                                    sendLowStockAlert(inventoryItem);
                                }
                                
                                // Check affected menu items
                                await checkAffectedMenuItems(ingredient);
                            }
                        }
                    }
                }
            }
        } catch (stockError) {
            console.error('❌ Raw ingredient usage error:', stockError);
        }
        
        res.json({ 
            success: true, 
            orderId: savedOrder._id,
            orderNumber: savedOrder.orderNumber,
            customerId: customerId,
            message: "Payment and order processed successfully",
            change: change
        });
        
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to save order to database"
        });
    }
});

// ==================== CUSTOMER ROUTES ====================

app.get('/api/customers', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let query = {};
        if (search) {
            query.customerId = { $regex: search, $options: 'i' };
        }
        
        const customers = await Customer.find(query)
            .sort({ lastOrderDate: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await Customer.countDocuments(query);
        
        // Get order count and total spent for each customer
        for (const customer of customers) {
            const customerOrders = await Order.find({ customerId: customer.customerId });
            customer.orderCount = customerOrders.length;
            customer.totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        }
        
        res.json({
            success: true,
            data: customers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ==================== DASHBOARD ROUTES ====================

app.get("/admindashboard", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalMenuItems = await MenuItem.countDocuments({ isActive: true });
        const availableMenuItems = await MenuItem.countDocuments({ 
            status: 'available', 
            isActive: true 
        });
        const totalCustomers = await Customer.countDocuments();
        
        const totalProducts = await totalProducts.countDocuments({ itemType: 'raw' });
        const inventoryLowStock = await InventoryItem.countDocuments({
            itemType: 'raw',
            $expr: {
                $and: [
                    { $gt: ["$currentStock", 0] },
                    { $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }] }
                ]
            },
            isActive: true
        });
        
        const inventoryOutOfStock = await InventoryItem.countDocuments({
            itemType: 'raw',
            currentStock: 0,
            isActive: true
        });

        res.render("admindashboard", { 
            user: req.user, 
            stats: { 
                totalOrders, 
                totalMenuItems,
                availableMenuItems,
                totalCustomers,
                totalProducts,
                inventoryLowStock,
                inventoryOutOfStock
            } 
        });
    } catch (err) {
        console.error('Error in /admindashboard route:', err);
        res.render("admindashboard", { 
            user: req.user, 
            stats: { 
                totalOrders: 0, 
                totalMenuItems: 0,
                availableMenuItems: 0,
                totalCustomers: 0,
                totalProducts: 0,
                inventoryLowStock: 0,
                inventoryOutOfStock: 0
            } 
        });
    }
});

app.get("/admindashboard/dashboard", verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Get stats for dashboard
        const totalOrders = await Order.countDocuments();
        const totalMenuItems = await MenuItem.countDocuments({ isActive: true });
        const availableMenuItems = await MenuItem.countDocuments({ 
            status: 'available', 
            isActive: true 
        });
        const totalCustomers = await Customer.countDocuments();
        const totalRevenueResult = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        const inventoryLowStock = await InventoryItem.countDocuments({
            itemType: 'raw',
            $expr: {
                $and: [
                    { $gt: ["$currentStock", 0] },
                    { $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }] }
                ]
            },
            isActive: true
        });
        
        const inventoryOutOfStock = await InventoryItem.countDocuments({
            itemType: 'raw',
            currentStock: 0,
            isActive: true
        });

        res.render("dashboard", { 
            user: req.user,
            stats: {
                totalOrders,
                totalMenuItems,
                availableMenuItems,
                totalCustomers,
                totalProducts,
                totalRevenue,
                inventoryLowStock,
                inventoryOutOfStock
            }
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Render with default stats if there's an error
        res.render("dashboard", {
            user: req.user,
            stats: {
                totalOrders: 0,
                totalMenuItems: 0,
                availableMenuItems: 0,
                totalCustomers: 0,
                totalProducts: 0,
                totalRevenue: 0,
                inventoryLowStock: 0,
                inventoryOutOfStock: 0
            }
        });
    }
});

// Updated Inventory Page Route
app.get("/admindashboard/Inventory", verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Get inventory stats
        const totalItems = await InventoryItem.countDocuments({ itemType: 'raw' });
        
        // Get category counts
        const categoryCounts = {
            meat: await InventoryItem.countDocuments({ 
                itemType: 'raw', 
                category: 'Meat' 
            }),
            seafood: await InventoryItem.countDocuments({ 
                itemType: 'raw', 
                category: 'Seafood' 
            }),
            dairy: await InventoryItem.countDocuments({ 
                itemType: 'raw', 
                category: 'Dairy' 
            }),
            produce: await InventoryItem.countDocuments({ 
                itemType: 'raw', 
                category: 'Produce' 
            }),
            dry: await InventoryItem.countDocuments({ 
                itemType: 'raw', 
                category: 'Dry Goods' 
            }),
            beverage: await InventoryItem.countDocuments({ 
                itemType: 'raw', 
                category: 'Beverages' 
            }),
            packaging: await InventoryItem.countDocuments({ 
                itemType: 'raw', 
                category: 'Packaging' 
            })
        };
        
        // Get low stock and out of stock counts
        const lowStockCount = await InventoryItem.countDocuments({
            itemType: 'raw',
            currentStock: { $gt: 0, $lt: LOW_STOCK_THRESHOLD },
            isActive: true
        });
        
        const outOfStockCount = await InventoryItem.countDocuments({
            itemType: 'raw',
            currentStock: 0,
            isActive: true
        });
        
        // Get initial inventory items for display
        const initialItems = await InventoryItem.find({ itemType: 'raw' })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        
        // Get all categories for the dropdown
        const allCategories = [
            'Meat & Poultry', 'Seafood', 'Dairy & Eggs', 'Vegetables & Fruits',
            'Dry Goods', 'Beverages', 'Packaging'
        ];
        
        res.render("Inventory", {
            user: req.user,
            stats: {
                totalItems,
                lowStockCount,
                outOfStockCount,
                categoryCounts
            },
            initialItems: initialItems || [],
            allCategories,
            LOW_STOCK_THRESHOLD
        });
        
    } catch (error) {
        console.error('Error loading Inventory page:', error);
        res.render("Inventory", {
            user: req.user,
            stats: {
                totalItems: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                categoryCounts: {
                    meat: 0,
                    seafood: 0,
                    dairy: 0,
                    produce: 0,
                    dry: 0,
                    beverage: 0,
                    packaging: 0
                }
            },
            initialItems: [],
            allCategories: [],
            LOW_STOCK_THRESHOLD: 5
        });
    }
});

app.get("/admindashboard/addstaff", verifyToken, verifyAdmin, (req, res) => {
    res.render("addstaff");
});

app.get("/admindashboard/salesandreports", verifyToken, verifyAdmin, (req, res) => {
    res.render("salesandreports", {
        title: "Sales & Reports"
    });
});

app.get("/admindashboard/infosettings", verifyToken, verifyAdmin, (req, res) => {
    res.render("infosettings");
});

app.get("/admindashboard/orderhistory", verifyToken, verifyAdmin, (req, res) => {
    res.render("orderhistory");
});

// Menu Management page
app.get("/admindashboard/menumanagement", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const menuItems = await MenuItem.find().sort({ itemName: 1 }).limit(50);
        
        // Get categories
        const categories = await MenuItem.distinct("category", { isActive: true });
        
        res.render("menumanagement", {
            user: req.user,
            initialMenuItems: menuItems,
            categories: categories || []
        });
    } catch (error) {
        res.render("menumanagement", {
            user: req.user,
            initialMenuItems: [],
            categories: []
        });
    }
});

// Stock page - shows raw ingredients stock
app.get("/admindashboard/stock", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const lowStockItems = await InventoryItem.find({
            itemType: 'raw',
            currentStock: { $lt: LOW_STOCK_THRESHOLD, $gte: 1 },
            isActive: true
        })
        .sort({ currentStock: 1 })
        .lean();
        
        const outOfStockItems = await InventoryItem.find({
            itemType: 'raw',
            currentStock: 0,
            isActive: true
        })
        .sort({ itemName: 1 })
        .lean();
        
        // Add recipe info
        const itemsWithRecipeInfo = [...lowStockItems, ...outOfStockItems].map(item => {
            const itemObj = item;
            const possibleDishes = recipeMapping[item.itemName];
            
            if (possibleDishes && possibleDishes.length > 0) {
                itemObj.canMake = possibleDishes;
            }
            
            return itemObj;
        });
        
        const lowStockWithInfo = itemsWithRecipeInfo.filter(item => item.currentStock > 0);
        const outOfStockWithInfo = itemsWithRecipeInfo.filter(item => item.currentStock === 0);
        
        res.render("stock", {
            user: req.user,
            lowStockItems: lowStockWithInfo,
            outOfStockItems: outOfStockWithInfo,
            lowStockThreshold: LOW_STOCK_THRESHOLD
        });
    } catch (error) {
        res.render("stock", {
            user: req.user,
            lowStockItems: [],
            outOfStockItems: [],
            lowStockThreshold: LOW_STOCK_THRESHOLD
        });
    }
});

// Recipe Management page
app.get("/admindashboard/recipes", verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Get sample data for the recipes page
        const sampleIngredients = Object.keys(recipeMapping).slice(0, 20);
        const sampleDishes = Object.keys(reverseRecipeMapping).slice(0, 20);
        
        // Get some menu items with their recipe details
        const menuItems = await MenuItem.find({ isActive: true })
            .limit(10)
            .lean();
        
        const menuItemsWithRecipes = [];
        for (const item of menuItems) {
            const recipeDetails = await getRecipeDetails(item.itemName);
            menuItemsWithRecipes.push({
                ...item,
                recipeDetails
            });
        }
        
        res.render("recipes", {
            user: req.user,
            totalIngredients: Object.keys(recipeMapping).length,
            totalDishes: Object.keys(reverseRecipeMapping).length,
            sampleIngredients,
            sampleDishes,
            menuItemsWithRecipes
        });
    } catch (error) {
        console.error('Error loading recipes page:', error);
        res.render("recipes", {
            user: req.user,
            totalIngredients: 0,
            totalDishes: 0,
            sampleIngredients: [],
            sampleDishes: [],
            menuItemsWithRecipes: []
        });
    }
});

// Customer management page
app.get("/admindashboard/customers", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const customers = await Customer.find()
            .sort({ lastOrderDate: -1 })
            .limit(50)
            .lean();
        
        // Get order stats for each customer
        for (const customer of customers) {
            const customerOrders = await Order.find({ customerId: customer.customerId });
            customer.orderCount = customerOrders.length;
            customer.totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        }
        
        res.render("customers", {
            user: req.user,
            customers: customers
        });
    } catch (error) {
        console.error('Error loading customers page:', error);
        res.render("customers", {
            user: req.user,
            customers: []
        });
    }
});

// ==================== STAFF DASHBOARD ====================

app.get("/staffdashboard", verifyToken, async (req, res) => {
    try {
        // Quick check - if user is admin, redirect to admin dashboard
        if (req.user.role === "admin") {
            return res.redirect("/admindashboard");
        }

        // Get available menu items (finished products)
        const menuItems = await MenuItem.find({ 
            status: 'available',
            isActive: true 
        }).sort({ itemName: 1 }).lean();
        
        // Get categories
        const categories = await Category.find().lean();
        
        // Add availability info
        const menuItemsWithAvailability = await Promise.all(menuItems.map(async (item) => {
            const availability = await checkProductAvailability(item.itemName);
            
            return {
                ...item,
                isAvailable: availability.available,
                missingIngredients: availability.missingIngredients,
                canBeMade: availability.available
            };
        }));
        
        res.render("staffdashboard", {
            user: req.user,
            products: menuItemsWithAvailability,
            categories: categories
        });
    } catch (err) {
        console.error('❌ Staff dashboard error:', err);
        // Even if there's an error, render the page with empty data
        res.render("staffdashboard", {
            user: req.user,
            products: [],
            categories: [],
            error: "Failed to load menu items"
        });
    }
});

// ==================== AUTHENTICATION ROUTES ====================

// Static pages
const pages = ["login", "register", "order"];
pages.forEach(page => {
    app.get(`/${page.toLowerCase()}`, (req, res) => res.render(page));
});

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.post("/register", async (req, res) => {
    try {
        const referer = req.headers.referer || req.headers.referrer;
        const isFormSubmission = referer && referer.includes('/admindashboard/addstaff');
        
        if (!isFormSubmission && req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
            return res.status(403).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Access Denied</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .toast { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.5s ease;
                                display: flex; align-items: center; gap: 12px; }
                        .toast.error { background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
                        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="toast error">
                            <span>⚠️</span>
                            <span>Access denied. Use admin dashboard to register staff.</span>
                        </div>
                    </div>
                    <script>
                        setTimeout(() => window.location.href = '/admindashboard', 3000);
                    </script>
                </body>
                </html>
            `);
        }

        const { user, pass, role } = req.body;
        
        if (!user || !pass) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Validation Error</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .toast { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.5s ease;
                                display: flex; align-items: center; gap: 12px; }
                        .toast.error { background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
                        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="toast error">
                            <span>⚠️</span>
                            <span>Username and password are required</span>
                        </div>
                    </div>
                    <script>
                        setTimeout(() => history.back(), 3000);
                    </script>
                </body>
                </html>
            `);
        }

        const existingUser = await User.findOne({ username: user });
        if (existingUser) {
            return res.status(409).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>User Exists</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .toast { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.5s ease;
                                display: flex; align-items: center; gap: 12px; }
                        .toast.error { background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
                        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="toast error">
                            <span>⚠️</span>
                            <span>User already exists</span>
                        </div>
                    </div>
                    <script>
                        setTimeout(() => history.back(), 3000);
                    </script>
                </body>
                </html>
            `);
        }

        const hashedPassword = bcrypt.hashSync(pass, 10);
        const newUser = new User({ 
            username: user, 
            password: hashedPassword, 
            role: role || "staff",
            status: "active"
        });

        await newUser.save();
        
        res.status(201).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Staff Registration Success</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .toast { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.5s ease;
                            display: flex; align-items: center; gap: 12px; }
                    .toast.success { background-color: #d4edda; color: #155724; border-left: 4px solid #28a745; }
                    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="toast success">
                        <span>✅</span>
                        <span>Staff Successfully Registered!</span>
                    </div>
                </div>
                <script>
                    setTimeout(() => window.location.href = '/admindashboard/addstaff', 2500);
                </script>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Server Error</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .toast { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.5s ease;
                            display: flex; align-items: center; gap: 12px; }
                    .toast.error { background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
                    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="toast error">
                        <span>❌</span>
                        <span>Server error: ${err.message}</span>
                    </div>
                </div>
                <script>
                    setTimeout(() => history.back(), 3000);
                </script>
            </body>
            </html>
        `);
    }
});

app.post("/login", async (req, res) => {
    try {
        const { user, pass } = req.body;

        const existingUser = await User.findOne({ username: user });
        if (!existingUser) {
            return res.render("login", {
                error: "User not found"
            });
        }

        if (existingUser.status === "inactive") {
            return res.render("login", {
                error: "Account is deactivated"
            });
        }

        const isMatch = bcrypt.compareSync(pass, existingUser.password);
        if (!isMatch) {
            return res.render("login", {
                error: "Invalid password"
            });
        }

        const token = jwt.sign(
            { 
                id: existingUser._id, 
                username: existingUser.username, 
                role: existingUser.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: "365d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 365
        });

        if (existingUser.role === "admin") {
            return res.redirect("/admindashboard");
        } else {
            return res.redirect("/staffdashboard");
        }

    } catch (err) {
        res.render("login", {
            error: "Login error"
        });
    }
});

// ==================== HEALTH AND UTILITY ROUTES ====================

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const stats = {
            status: "online",
            timestamp: new Date().toISOString(),
            database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
            inventoryItems: await InventoryItem.countDocuments({ itemType: 'raw' }),
            menuItems: await MenuItem.countDocuments(),
            products: await Product.countDocuments(),
            orders: await Order.countDocuments(),
            customers: await Customer.countDocuments(),
            recipeMapping: {
                ingredients: Object.keys(recipeMapping).length,
                dishes: Object.keys(reverseRecipeMapping).length
            }
        };
        
        res.json({
            success: true,
            ...stats
        });
    } catch (error) {
        res.json({
            success: false,
            status: "error",
            message: error.message
        });
    }
});

// Reset recipe mappings (for development)
app.post("/api/recipes/reset", verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Note: In a real application, you would reload the recipe mapping
        // from a database or configuration file
        
        res.json({
            success: true,
            message: 'Recipe mappings are loaded from configuration',
            data: {
                ingredientCount: Object.keys(recipeMapping).length,
                dishCount: Object.keys(reverseRecipeMapping).length
            }
        });
    } catch (error) {
        console.error('Error resetting recipes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

// Render login page
app.get('/login', (req, res) => {
    res.render('login');
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});