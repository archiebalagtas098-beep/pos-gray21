import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productName: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: Boolean, 
    default: true 
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
  },
  brand: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand' 
  }
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;