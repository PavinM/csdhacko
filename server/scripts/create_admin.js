import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const createAdmin = async () => {
    await connectDB();

    try {
        const adminExists = await User.findOne({ email: 'admin@kongu.edu' });

        if (adminExists) {
            console.log('Admin user already exists. Updating password...');
            adminExists.password = 'admin123';
            await adminExists.save();
            console.log('Admin password updated successfully');
            process.exit(0);
        }

        const admin = new User({
            name: 'KEC Admin',
            email: 'admin@kongu.edu',
            password: 'admin123', // Will be hashed by pre-save hook
            role: 'admin',
            department: 'Administration'
        });

        await admin.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
