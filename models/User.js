import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    user: {
        type: String,
        sparse: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        sparse: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        sparse: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        sparse: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Staff'], 
        default: 'Staff'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Simple method to check if user is admin
userSchema.methods.isAdmin = function() {
    return this.role === 'Admin';
};

// Don't return password when serializing
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;