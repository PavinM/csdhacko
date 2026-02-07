import express from 'express';
import asyncHandler from 'express-async-handler';
import Feedback from '../models/Feedback.js';
import { protect, coordinator } from '../middleware/authMiddleware.js';


import { SOFTWARE_DEPTS, HARDWARE_DEPTS } from '../utils/studentParser.js';

const router = express.Router();

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private (Student)
router.post('/', protect, asyncHandler(async (req, res) => {
    const { companyName, jobRole, driveDate, overallExperience, preparationTips, rounds, department } = req.body;

    const feedback = new Feedback({
        studentId: req.user._id,
        studentName: req.user.name,
        department: department || req.user.department,
        companyName,
        jobRole,
        driveDate,
        overallExperience,
        preparationTips,
        rounds
    });

    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
}));

// @desc    Get All Feedback (or filtered by pending/department)
// @route   GET /api/feedback
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.department) filters.department = req.query.department;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.company) filters.companyName = req.query.company;

    // Domain Filter
    if (req.query.domainType) {
        if (req.query.domainType === 'Software') {
            filters.department = { $in: SOFTWARE_DEPTS };
        } else if (req.query.domainType === 'Hardware') {
            filters.department = { $in: HARDWARE_DEPTS };
        }
        // If 'Both' or invalid, do not filter by department (show all)
    }

    // If student, maybe show their own feedback? Or all approved feedbacl?
    // Let's implement: public get = approved only, unless coordinator/admin

    if (req.user.role === 'student' && !req.query.myFeedback) {
        filters.status = 'approved';
    }

    if (req.query.myFeedback) {
        filters.studentId = req.user._id;
    }

    const feedbacks = await Feedback.find(filters).sort({ createdAt: -1 });
    res.json(feedbacks);
}));

// @desc    Update feedback status (Approve/Reject)
// @route   PUT /api/feedback/:id/status
// @access  Private/Coordinator
router.put('/:id/status', protect, coordinator, asyncHandler(async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'

    const feedback = await Feedback.findById(req.params.id);

    if (feedback) {
        feedback.status = status;
        const updatedFeedback = await feedback.save();
        res.json(updatedFeedback);
    } else {
        res.status(404);
        throw new Error('Feedback not found');
    }
}));


export default router;
