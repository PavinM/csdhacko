import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { protect, admin, coordinator } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all users (with filters)
// @route   GET /api/users
// @access  Private/Coordinator/Admin
router.get('/', protect, coordinator, asyncHandler(async (req, res) => {
    // Basic filtering
    const keyword = req.query.role ? { role: req.query.role } : {};
    const deptFilter = req.query.department ? { department: req.query.department } : {};

    const users = await User.find({ ...keyword, ...deptFilter }).select('-password');
    res.json(users);
}));

// @desc    Register a new user (via Coordinator/Admin dashboard)
// @route   POST /api/users
// @access  Private/Coordinator
router.post('/', protect, coordinator, asyncHandler(async (req, res) => {
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
            department: user.department
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
}));


export default router;
