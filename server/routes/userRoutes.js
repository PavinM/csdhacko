import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { protect, admin, coordinator } from '../middleware/authMiddleware.js';
import { SOFTWARE_DEPTS, HARDWARE_DEPTS } from '../utils/studentParser.js';

const router = express.Router();

// @desc    Get all users (with filters)
// @route   GET /api/users
// @access  Private/Coordinator/Admin
router.get('/', protect, coordinator, asyncHandler(async (req, res) => {
    // Basic filtering

    const keyword = req.query.role ? { role: req.query.role } : {};

    let filter = {};
    if (req.query.domainType) {
        const targetDepts = req.query.domainType === 'Software' ? SOFTWARE_DEPTS : HARDWARE_DEPTS;

        // Filter by EITHER:
        // 1. Department is in the allowed list (Inferred)
        // 2. OR Domain field explicitly matches (Explicit)
        filter = {
            $or: [
                { department: { $in: targetDepts } },
                { domain: req.query.domainType }
            ]
        };
    } else if (req.query.department) {
        filter = { department: req.query.department };
    }

    const users = await User.find({ ...keyword, ...filter }).select('-password');
    res.json(users);
}));

// @desc    Register a new user (via Coordinator/Admin dashboard)
// @route   POST /api/users
// @access  Private/Coordinator
router.post('/', protect, coordinator, asyncHandler(async (req, res) => {
    const { name, email, password, role, department, rollNo, section, year, dob, batch, domain, tenthMark, twelfthMark, cgpa } = req.body;

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
        dob,
        batch,
        domain,
        tenthMark,
        twelfthMark,
        cgpa
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



// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));

export default router;
