import express from 'express';
import asyncHandler from 'express-async-handler';
import Company from '../models/Company.js';
import { protect, admin, coordinator } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Add new company drive
// @route   POST /api/companies
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    const { name, visitDate, domain, roles, eligibility, salaryPackage } = req.body;

    const company = await Company.create({
        name,
        visitDate,
        domain,
        roles,
        eligibility,
        salaryPackage
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

// @desc    Update company status
// @route   PUT /api/companies/:id/status
// @access  Private/Coordinator
router.put('/:id/status', protect, coordinator, asyncHandler(async (req, res) => {
    const { status } = req.body;
    const company = await Company.findById(req.params.id);

    if (company) {
        company.status = status;
        const updatedCompany = await company.save();
        res.json(updatedCompany);
    } else {
        res.status(404);
        throw new Error('Company not found');
    }
}));

// @desc    Update eligible students
// @route   PUT /api/companies/:id/eligibility
// @access  Private/Coordinator
router.put('/:id/eligibility', protect, coordinator, asyncHandler(async (req, res) => {
    const { eligibleStudents } = req.body;
    const company = await Company.findById(req.params.id);

    if (company) {
        company.eligibleStudents = eligibleStudents;
        const updatedCompany = await company.save();
        res.json(updatedCompany);
    } else {
        res.status(404);
        throw new Error('Company not found');
    }
}));

// @desc    Update company details (Admin only)
// @route   PUT /api/companies/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);

    if (company) {
        company.name = req.body.name || company.name;
        company.visitDate = req.body.visitDate || company.visitDate;
        company.domain = req.body.domain || company.domain;
        company.roles = req.body.roles || company.roles;
        company.salaryPackage = req.body.salaryPackage || company.salaryPackage;
        company.eligibility = req.body.eligibility || company.eligibility;

        const updatedCompany = await company.save();
        res.json(updatedCompany);
    } else {
        res.status(404);
        throw new Error('Company not found');
    }
}));

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);

    if (company) {
        await company.deleteOne();
        res.json({ message: 'Company removed' });
    } else {
        res.status(404);
        throw new Error('Company not found');
    }
}));

export default router;
