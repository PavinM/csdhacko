import express from 'express';
import asyncHandler from 'express-async-handler';
import Company from '../models/Company.js';
import { protect, coordinator } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Add new company drive
// @route   POST /api/companies
// @access  Private/Coordinator
router.post('/', protect, coordinator, asyncHandler(async (req, res) => {
    const { name, visitDate, roles, eligibility, salaryPackage } = req.body;

    const company = await Company.create({
        name,
        visitDate,
        roles,
        eligibility,
        salaryPackage,
        department: req.user.department
    });

    if (company) {
        res.status(201).json(company);
    } else {
        res.status(400);
        throw new Error('Invalid company data');
    }
}));

// @desc    Get companies
// @route   GET /api/companies
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const companies = await Company.find({}).sort({ visitDate: -1 });
    res.json(companies);
}));

export default router;
