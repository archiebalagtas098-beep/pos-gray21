/**
 * Seed Test Data for MongoDB Atlas
 * Run this to populate the database with sample data for testing the dashboard
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { 
    connectDB, 
    MenuItem, 
    InventoryItem, 
    Order, 
    Customer, 
    Category 
} from '../../config/database.js';

async function seedData() {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB Atlas');

        // Check existing data
        const existingMenuItems = await MenuItem.countDocuments();
        const existingOrders = await Order.countDocuments();
        const existingInventory = await InventoryItem.countDocuments();

        console.log(`📊 Current data counts:
            - Menu Items: ${existingMenuItems}
            - Orders: ${existingOrders}
            - Inventory: ${existingInventory}`);

        // Seed Menu Items
        if (existingMenuItems === 0) {
            console.log('🍽️  Seeding menu items...');
            const menuItems = [
                { itemName: 'Buttered Honey Chicken', category: 'Rice', price: 155, isActive: true },
                { itemName: 'Buttered Spicy Chicken', category: 'Rice', price: 155, isActive: true },
                { itemName: 'Chicken Adobo', category: 'Rice', price: 145, isActive: true },
                { itemName: 'Korean Spicy Bulgogi (Pork)', category: 'Rice', price: 180, isActive: true },
                { itemName: 'Sizzling Pork Sisig', category: 'Sizzling', price: 220, isActive: true },
                { itemName: 'Sizzling Liempo', category: 'Sizzling', price: 210, isActive: true },
                { itemName: 'Pancit Bihon (M)', category: 'Party', price: 550, isActive: true },
                { itemName: 'Spaghetti (M)', category: 'Party', price: 600, isActive: true },
                { itemName: 'Cucumber Lemonade (Glass)', category: 'Drinks', price: 60, isActive: true },
                { itemName: 'Cafe Latte Tall', category: 'Coffee', price: 90, isActive: true },
                { itemName: 'Milk Tea Regular HC', category: 'Milk Tea', price: 80, isActive: true },
                { itemName: 'Cheesy Nachos', category: 'Snacks', price: 120, isActive: true },
                { itemName: 'Pork Shanghai', category: 'Snacks', price: 140, isActive: true },
            ];
            await MenuItem.insertMany(menuItems);
            console.log(`✅ Seeded ${menuItems.length} menu items`);
        }

        // Seed Inventory Items
        if (existingInventory === 0) {
            console.log('📦 Seeding inventory items...');
            const inventoryItems = [
                { itemName: 'Chicken', category: 'Meat', currentStock: 50, minStock: 10, isActive: true, unit: 'pieces' },
                { itemName: 'Pork slices', category: 'Meat', currentStock: 30, minStock: 10, isActive: true, unit: 'kg' },
                { itemName: 'Cream dory fillet', category: 'Seafood', currentStock: 20, minStock: 8, isActive: true, unit: 'kg' },
                { itemName: 'Shrimp', category: 'Seafood', currentStock: 15, minStock: 5, isActive: true, unit: 'kg' },
                { itemName: 'Rice', category: 'Staple', currentStock: 100, minStock: 20, isActive: true, unit: 'kg' },
                { itemName: 'Butter', category: 'Dairy', currentStock: 25, minStock: 5, isActive: true, unit: 'kg' },
                { itemName: 'Milk', category: 'Dairy', currentStock: 40, minStock: 10, isActive: true, unit: 'L' },
                { itemName: 'Eggs', category: 'Dairy', currentStock: 100, minStock: 20, isActive: true, unit: 'pieces' },
                { itemName: 'Cheese', category: 'Dairy', currentStock: 10, minStock: 3, isActive: true, unit: 'kg' },
                { itemName: 'Garlic', category: 'Vegetables', currentStock: 5, minStock: 2, isActive: true, unit: 'kg' },
            ];
            await InventoryItem.insertMany(inventoryItems);
            console.log(`✅ Seeded ${inventoryItems.length} inventory items`);
        }

        // Seed Sample Orders
        if (existingOrders < 5) {
            console.log('📋 Seeding sample orders...');
            
            // Create a customer first
            let customer = await Customer.findOne({ customerId: 'CUST-001' });
            if (!customer) {
                customer = await Customer.create({
                    customerId: 'CUST-001',
                    name: 'Walk-in Customer',
                    totalOrders: 0,
                    totalSpent: 0
                });
            }

            const orders = [
                {
                    orderNumber: 'ORD-20260208-001',
                    items: [
                        { itemName: 'Buttered Honey Chicken', price: 155, quantity: 2 },
                        { itemName: 'Cucumber Lemonade (Glass)', price: 60, quantity: 2 }
                    ],
                    total: 430,
                    customerId: customer._id.toString(),
                    status: 'completed',
                    payment: { method: 'cash', amountPaid: 500, change: 70 },
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
                },
                {
                    orderNumber: 'ORD-20260208-002',
                    items: [
                        { itemName: 'Sizzling Pork Sisig', price: 220, quantity: 1 },
                        { itemName: 'Cafe Latte Tall', price: 90, quantity: 1 }
                    ],
                    total: 310,
                    customerId: customer._id.toString(),
                    status: 'completed',
                    payment: { method: 'cash', amountPaid: 350, change: 40 },
                    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
                },
                {
                    orderNumber: 'ORD-20260208-003',
                    items: [
                        { itemName: 'Pancit Bihon (M)', price: 550, quantity: 1 },
                        { itemName: 'Cheesy Nachos', price: 120, quantity: 2 }
                    ],
                    total: 790,
                    customerId: customer._id.toString(),
                    status: 'completed',
                    payment: { method: 'cash', amountPaid: 800, change: 10 },
                    createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
                }
            ];

            await Order.insertMany(orders);
            console.log(`✅ Seeded ${orders.length} sample orders`);
        }

        console.log('\n✨ Database seeding completed successfully!');
        console.log('📊 You can now refresh your dashboard to see the real data.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
