import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['student', 'coordinator', 'admin'] },
    department: { type: String, required: true }, // e.g., 'CSE', 'ECE'

    // Student specific fields
    rollNo: { type: String },
    dob: { type: String }, // Stored as string YYYY-MM-DD for simplicity
    section: { type: String },
    year: { type: String }, // '1', '2', '3', '4'

    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Match user-entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
