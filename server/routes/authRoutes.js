import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
}));

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin only? For now Public to let initial setup happen easily)
router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password, role, department, rollNo, section, year, dob } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        department,
        rollNo,
        section,
        year,
        dob
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
}));

// @desc    Bulk register students
// @route   POST /api/auth/bulk-register
// @access  Private/Admin
router.post('/bulk-register', protect, admin, asyncHandler(async (req, res) => {
    const { students } = req.body; // Expecting array of objects

    if (!students || !Array.isArray(students)) {
        res.status(400);
        throw new Error('Invalid data format. Expected array of students.');
    }

    let createdCount = 0;
    let skippedCount = 0;
    const usersToInsert = [];

    // optimize: fetch existing emails
    const existingUsers = await User.find({}, 'email');
    const existingEmails = new Set(existingUsers.map(u => u.email));

    // Pre-generate salt for performance (or generate per user if bcrypt requires, usually salt is part of hash, so genSalt(10) per user is safer but slower. 
    // For bulk default passwords, we can reuse salt? No, security risk. 
    // We will generate hash for each.

    for (const student of students) {
        // Map keys loosely
        const name = student['Name'] || student['name'] || student['Student Name'];
        const email = student['Email'] || student['email'];
        // Default password logic: RollNo -> DOB -> 'password123'
        const rollNo = student['RollNo'] || student['rollNo'] || student['Register Number'] || '';
        const dob = student['DOB'] || student['dob'] || '';
        const department = student['Department'] || student['department'] || 'General';

        if (!email || !name) continue; // Skip invalid

        if (existingEmails.has(email)) {
            skippedCount++;
            continue;
        }

        // Create user object
        // Hash password manually as insertMany bypasses pre-save hooks
        const plainPassword = rollNo ? rollNo.toString() : (dob ? dob.toString() : 'password123');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        usersToInsert.push({
            name,
            email,
            password: hashedPassword,
            role: 'student',
            department,
            rollNo,
            dob,
            section: student['Section'] || student['section'],
            year: student['Year'] || student['year']
        });

        // Add to existingEmails set to prevent duplicates within the upload file itself
        existingEmails.add(email);
    }

    if (usersToInsert.length > 0) {
        await User.insertMany(usersToInsert);
        createdCount = usersToInsert.length;
    }

    res.status(201).json({
        message: 'Bulk registration processed',
        count: createdCount,
        skipped: skippedCount
    });
}));

export default router;
