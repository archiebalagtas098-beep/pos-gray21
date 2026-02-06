import express from 'express';
import mongoose from 'mongoose';
import { StockRequest, Product, InventoryItem } from '../config/database.js';

const router = express.Router();

// Create a new stock request (staff)
router.post('/', async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log('Incoming stock request:', { body: req.body, user: req.user });

    let { productName, productId, requestedQuantity, priority = 'medium', notes = '' } = req.body;

    // Coerce and validate quantity
    requestedQuantity = Number(requestedQuantity);
    if (!productName || !requestedQuantity || Number.isNaN(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({ success: false, message: 'productName and a valid requestedQuantity (>=1) are required' });
    }

    const requestedBy = req.user && (req.user._id || req.user.id) ? (req.user._id || req.user.id) : null;
    if (!requestedBy) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let inventoryItem = null;
    if (productId && mongoose.isValidObjectId(productId)) {
      const prod = await Product.findById(productId).select('inventoryItemId').lean();
      inventoryItem = prod ? prod.inventoryItemId : null;
    }

    const stockRequest = new StockRequest({
      productName,
      productId: productId || null,
      inventoryItemId: inventoryItem || null,
      requestedQuantity,
      priority,
      notes,
      requestedBy
    });

    await stockRequest.save();

    res.json({ success: true, message: 'Stock request submitted', data: stockRequest });
  } catch (error) {
    console.error('Error creating stock request:', error && error.stack ? error.stack : error);
    res.status(500).json({ success: false, message: (error && error.message) ? error.message : 'Failed to create stock request' });
  }
});

// Get current user's stock requests
router.get('/my-requests', async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id) ? (req.user._id || req.user.id) : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const requests = await StockRequest.find({ requestedBy: userId }).sort({ createdAt: -1 }).lean();

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching user stock requests:', error && error.stack ? error.stack : error);
    res.status(500).json({ success: false, message: (error && error.message) ? error.message : 'Failed to load stock requests' });
  }
});

export default router;
