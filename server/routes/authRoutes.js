import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { parseStudentDetails } from '../utils/studentParser.js';
import bcrypt from 'bcryptjs';
import { protect, admin } from '../middleware/authMiddleware.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // We (server) only need this to verify audience if desired, OR just verify signature.
// Ideally, server also knows the client ID to ensure token was issued for THIS app.
// For now, we will trust the prompt flow but good practice is to check aud.

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

        // Check and Update Details (Force Sync with Name)
        const { rollNo, department } = parseStudentDetails(user.name);
        let updated = false;

        if (rollNo && user.rollNo !== rollNo) {
            user.rollNo = rollNo;
            updated = true;
        }
        // If parser found a department (e.g. ALR->AIML), enforce it over existing (e.g. IT)
        if (department && user.department !== department) {
            user.department = department;
            updated = true;
        }

        if (updated) {
            await user.save();
            console.log(`[AUTH] Synced student ${user.email}: ${rollNo}, ${department}`);
        }

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

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
router.post('/google', asyncHandler(async (req, res) => {
    const { token } = req.body;

    // 1. Verify Token
    let ticket;
    try {
        ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.VITE_GOOGLE_CLIENT_ID // Ideally this should be in SERVER .env too, but for now we can rely on frontend sending it.
            // BETTER: Add VITE_GOOGLE_CLIENT_ID to server .env as GOOGLE_CLIENT_ID
        });
    } catch (error) {
        res.status(401);
        throw new Error('Invalid Google Token: ' + error.message);
    }

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // 2. Enforce Domain Check
    if (!email.endsWith('@kongu.edu')) {
        res.status(403);
        throw new Error('Access Denied: Only @kongu.edu emails are allowed.');
    }

    // 3. Check if user exists
    let user = await User.findOne({ email });

    if (user) {
        // User exists - Log them in
        // Update details if missing or mismatch (Force Sync)
        const { rollNo, department } = parseStudentDetails(name); // Parse from Google Name
        let updated = false;

        if (rollNo && user.rollNo !== rollNo) {
            user.rollNo = rollNo;
            updated = true;
        }

        // Enforce Department Sync based on Roll No Code
        if (department && user.department !== department) {
            user.department = department;
            updated = true;
        }

        if (updated) await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            rollNo: user.rollNo, // Return to frontend
            token: generateToken(user._id),
        });
    } else {
        // 4. Register new Student automatically
        const { rollNo, department: parsedDept } = parseStudentDetails(name);

        let department = parsedDept || "General";

        // Fallback: Try email if name didn't work (keep existing heuristic as backup)
        if (department === "General") {
            const prefix = email.split('@')[0].toLowerCase();
            if (prefix.includes('cse')) department = 'CSE';
            else if (prefix.includes('it')) department = 'IT';
            else if (prefix.includes('ece')) department = 'ECE';
            else if (prefix.includes('eee')) department = 'EEE';
            else if (prefix.includes('mech')) department = 'MECH';
            else if (prefix.includes('civil')) department = 'CIVIL';
            else if (prefix.includes('aids')) department = 'AIDS';
            else if (prefix.includes('aiml')) department = 'AIML';
            else if (prefix.includes('mts')) department = 'MTS';
        }

        // Create with random password
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        user = await User.create({
            name,
            email,
            password: randomPassword,
            role: 'student',
            department,
            rollNo: rollNo || '',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data for Google Sign-In');
        }
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
