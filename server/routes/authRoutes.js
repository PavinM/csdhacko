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
            audience: process.env.GOOGLE_CLIENT_ID
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


// @desc    Bulk register/update students
// @route   POST /api/auth/bulk-register
// @access  Private/Admin
router.post('/bulk-register', protect, admin, asyncHandler(async (req, res) => {
    const { students } = req.body; // Expecting array of objects

    if (!students || !Array.isArray(students)) {
        res.status(400);
        throw new Error('Invalid data format. Expected array of students.');
    }

    const operations = [];

    // Pre-generate hashes for NEW users (expensive, so do it inside loop if needed, but bulkWrite doesn't support async value generation easily inside the ops array if we want parallelism, but map is sync. 
    // We'll iterate and build ops. For passwords, if we need to set them for new users, we'll hash.

    // Note: bcrypt is async. We'll use a for...of loop.

    let processedCount = 0;

    for (const rawStudent of students) {
        // Normalize keys for robustness (Handle "Email ", "EMAIL", "student name" etc.)
        const student = {};
        Object.keys(rawStudent).forEach(key => {
            student[key.toLowerCase().trim()] = rawStudent[key];
        });

        // Map keys (checking lowercase variants)
        const name = student['name'] || student['student name'];
        const email = student['email'];

        if (!email || !name) continue;

        // Fields to update/insert
        const rollNo = student['rollno'] || student['roll no'] || student['register number'] || student['roll number'] || '';
        const dob = student['dob'] || '';
        const department = student['department'] || 'General';
        const section = student['section'];
        const year = student['year'] || student['batch'] || student['batch / year'];
        const batch = student['year'] || student['batch'] || student['batch / year']; // Redundant bu safe
        const domain = student['domain'] || student['area of interest'];

        // Academic Fields
        const tenthMark = student['10th percentage'] || student['10th %'] || student['10th'] || student['tenthmark'];
        const twelfthMark = student['12th percentage'] || student['12th %'] || student['12th'] || student['twelfthmark'];
        const cgpa = student['current cgpa'] || student['cgpa'];

        // Determine password for NEW users only
        const plainPassword = rollNo ? rollNo.toString() : (dob ? dob.toString() : 'password123');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        operations.push({
            updateOne: {
                filter: { email: email },
                update: {
                    $set: {
                        name,
                        department,
                        rollNo,
                        dob,
                        section,
                        year,
                        batch,
                        domain,
                        tenthMark,
                        twelfthMark,
                        cgpa
                    },
                    $setOnInsert: {
                        password: hashedPassword,
                        role: 'student',
                        createdAt: new Date()
                    }
                },
                upsert: true
            }
        });
        processedCount++;
    }

    if (operations.length > 0) {
        await User.bulkWrite(operations);
    }

    res.status(200).json({
        message: 'Bulk processing complete',
        count: processedCount
    });
}));

// @desc    Update student profile (One-time or Admin override)
// @route   PUT /api/auth/profile
// @access  Private
router.post('/profile', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if already completed (and not admin)
    if (user.profileCompleted && user.role !== 'admin') {
        res.status(403);
        throw new Error('Profile already completed. Contact admin for changes.');
    }

    const { tenthMark, twelfthMark, cgpa, domain } = req.body;

    user.tenthMark = tenthMark || user.tenthMark;
    user.twelfthMark = twelfthMark || user.twelfthMark;
    user.cgpa = cgpa || user.cgpa;
    user.domain = domain || user.domain;

    user.profileCompleted = true;

    await user.save();

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileCompleted: user.profileCompleted,
        token: generateToken(user._id)
    });
}));
export default router;
