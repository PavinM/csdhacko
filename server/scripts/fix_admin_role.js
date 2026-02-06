import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const fixAdminRole = async () => {
    await connectDB();

    try {
        const email = 'admin@kongu.edu';
        const user = await User.findOne({ email });

        if (user) {
            user.role = 'admin';
            user.department = 'Administration';
            user.password = 'admin123'; // Force reset password to known value
            await user.save(); // This triggers the pre-save hook to hash it
            console.log(`User ${email} updated: role=admin, password=admin123`);
        } else {
            console.log(`User ${email} not found. Creating...`);
            // Fallback create if missing
            await User.create({
                name: 'KEC Admin',
                email: email,
                password: 'admin123',
                role: 'admin',
                department: 'Administration'
            });
            console.log(`User ${email} created as admin`);
        }
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

fixAdminRole();
