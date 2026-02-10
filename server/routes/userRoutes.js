import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import EditRequest from '../models/EditRequest.js';
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

// ==================== EDIT REQUEST ROUTES ====================

// @desc    Request edit access to profile
// @route   POST /api/users/request-edit
// @access  Private/Student
router.post('/request-edit', protect, asyncHandler(async (req, res) => {
    const { reason } = req.body;

    // Check if student already has a pending or approved request
    const existingRequest = await EditRequest.findOne({
        studentId: req.user._id,
        status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
        res.status(400);
        throw new Error(`You already have a ${existingRequest.status} edit request`);
    }

    const editRequest = await EditRequest.create({
        studentId: req.user._id,
        reason: reason || 'Request to update profile information'
    });

    const populatedRequest = await EditRequest.findById(editRequest._id)
        .populate('studentId', 'name email rollNo department');

    res.status(201).json(populatedRequest);
}));

// @desc    Get my edit requests
// @route   GET /api/users/my-edit-requests
// @access  Private/Student
router.get('/my-edit-requests', protect, asyncHandler(async (req, res) => {
    const requests = await EditRequest.find({ studentId: req.user._id })
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 });

    res.json(requests);
}));

// @desc    Get all edit requests (for coordinators)
// @route   GET /api/users/edit-requests
// @access  Private/Coordinator
router.get('/edit-requests', protect, coordinator, asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await EditRequest.find(filter)
        .populate('studentId', 'name email rollNo department year section')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 });

    res.json(requests);
}));

// @desc    Approve/Reject edit request
// @route   PATCH /api/users/edit-requests/:id
// @access  Private/Coordinator
router.patch('/edit-requests/:id', protect, coordinator, asyncHandler(async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status. Must be "approved" or "rejected"');
    }

    const editRequest = await EditRequest.findById(req.params.id);

    if (!editRequest) {
        res.status(404);
        throw new Error('Edit request not found');
    }

    if (editRequest.status !== 'pending') {
        res.status(400);
        throw new Error('This request has already been processed');
    }

    editRequest.status = status;
    editRequest.processedBy = req.user._id;
    editRequest.processedAt = new Date();

    await editRequest.save();

    const populatedRequest = await EditRequest.findById(editRequest._id)
        .populate('studentId', 'name email rollNo department')
        .populate('processedBy', 'name email');

    res.json(populatedRequest);
}));

// @desc    Update student profile (only after approval)
// @route   PATCH /api/users/profile
// @access  Private/Student
router.patch('/profile', protect, asyncHandler(async (req, res) => {
    // Check if student has an approved edit request
    const approvedRequest = await EditRequest.findOne({
        studentId: req.user._id,
        status: 'approved'
    });

    if (!approvedRequest) {
        res.status(403);
        throw new Error('You do not have edit access. Please request approval from your coordinator first.');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Update only allowed fields (not name, email, or department)
    const allowedFields = ['rollNo', 'dob', 'section', 'year', 'batch', 'domain', 'tenthMark', 'twelfthMark', 'cgpa'];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            user[field] = req.body[field];
        }
    });

    const updatedUser = await user.save();

    // Delete the approved edit request after successful update
    await EditRequest.findByIdAndDelete(approvedRequest._id);

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        rollNo: updatedUser.rollNo,
        dob: updatedUser.dob,
        section: updatedUser.section,
        year: updatedUser.year,
        batch: updatedUser.batch,
        domain: updatedUser.domain,
        tenthMark: updatedUser.tenthMark,
        twelfthMark: updatedUser.twelfthMark,
        cgpa: updatedUser.cgpa,
        profileCompleted: updatedUser.profileCompleted
    });
}));

export default router;
