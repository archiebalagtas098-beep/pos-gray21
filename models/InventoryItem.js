import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    itemType: {
        type: String,
        required: true,
        enum: ['raw', 'finished', 'poultry'],
        default: 'finished',
        index: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    unit: {
        type: String, 
        required: false,
        default: 'pieces'
    },
    currentStock: {
        type: Number,
        default: 0,
        min: 0
    },
    minStock: {
        type: Number,
        default: 10,
        min: 0
    },
    maxStock: {
        type: Number,
        default: 100,
        min: 0
    },
    message: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true
});

// Index for common queries
inventorySchema.index({ itemType: 1, currentStock: 1 });
inventorySchema.index({ category: 1 });

const InventoryItem = mongoose.model('InventoryItem', inventorySchema);

export default InventoryItem;