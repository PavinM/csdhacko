import express from 'express';
import reportController from '../controllers/reportController.js';

const router = express.Router();

/**
 * @route   POST /api/reports/generate
 * @desc    Generate placement feedback summary report for a specific company
 * @access  Internal (should be protected by authentication in production)
 * @body    { companyName: string, format: 'json' | 'text' }
 * @returns Structured report in JSON or plain text format
 */
router.post('/generate', reportController.generateReport);

/**
 * @route   GET /api/reports/companies
 * @desc    Get list of all companies with feedback entries
 * @access  Internal
 * @returns Array of company names
 */
router.get('/companies', reportController.listCompanies);

/**
 * @route   GET /api/reports/companies/:companyName/count
 * @desc    Get count of feedback entries for a specific company
 * @access  Internal
 * @returns Feedback count for the specified company
 */
router.get('/companies/:companyName/count', reportController.getFeedbackCount);

export default router;
