import mongoose from 'mongoose';

// Brand Schema
const brandSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

brandSchema.index({ brandName: 1 }, { unique: true });
brandSchema.index({ status: 1 });

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

const getDataControllerFn = async (req, res) => {
    try {
        const brands = await Brand.find({});
        res.json(brands);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createbrandControllerFn = async (req, res) => {
    try {
        const newBrand = new Brand(req.body);
        const savedBrand = await newBrand.save();
        res.status(201).json(savedBrand);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { getDataControllerFn, createbrandControllerFn };
