import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  catName: {
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

// Indexes for better performance
categorySchema.index({ catName: 1 }, { unique: true });
categorySchema.index({ status: 1 });

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;