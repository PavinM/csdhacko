import feedbackRepository from '../services/feedbackRepository.js';
import feedbackAnalyzer from '../services/feedbackAnalyzer.js';
import reportGenerator from '../services/reportGenerator.js';
import aiFeedbackAnalyzer from '../services/aiFeedbackAnalyzer.js';
import aiReportGenerator from '../services/aiReportGenerator.js';

/**
 * Controller for handling report generation requests
 * Supports both AI-powered and rule-based analysis modes
 */
class ReportController {
    /**
     * Generates a placement feedback summary report for a specific company
     * 
     * @route POST /api/reports/generate
     * @body {string} companyName - Name of the company
     * @body {string} format - Optional format: 'json' (default) or 'text'
     * @body {boolean} useAI - Optional: Use AI-powered analysis (default: true)
     */
    async generateReport(req, res) {
        try {
            const { companyName, format = 'json', useAI = true } = req.body;

            // Validate input
            if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Company name is required and must be a non-empty string'
                });
            }

            const normalizedCompanyName = companyName.trim();

            // Step 1: Fetch feedback data from MongoDB
            const feedbackEntries = await feedbackRepository.getFeedbackByCompany(normalizedCompanyName);

            // Step 2 & 3: Choose AI or rule-based analysis and generate report
            let report;

            if (useAI && process.env.GROQ_API_KEY) {
                // AI-powered analysis and report generation
                const analysis = await aiFeedbackAnalyzer.analyze(feedbackEntries, normalizedCompanyName);
                report = await aiReportGenerator.generateReport(analysis);
            } else {
                // Rule-based analysis and report generation
                const analysis = feedbackAnalyzer.analyze(feedbackEntries, normalizedCompanyName);
                report = reportGenerator.generateReport(analysis);
            }

            // Step 4: Return formatted response
            if (format === 'text') {
                const plainText = useAI
                    ? aiReportGenerator.generatePlainTextReport(report)
                    : reportGenerator.generatePlainTextReport(report);
                return res.status(200).send(plainText);
            }

            return res.status(200).json({
                success: true,
                data: report,
                metadata: {
                    feedbackCount: feedbackEntries.length,
                    generatedAt: new Date().toISOString(),
                    aiPowered: useAI && report.aiGenerated === true
                }
            });

        } catch (error) {
            console.error('Error generating report:', error);

            return res.status(500).json({
                success: false,
                error: 'An error occurred while generating the report. Please contact the Placement Cell administrator.'
            });
        }
    }

    /**
     * Lists all companies that have feedback entries
     * 
     * @route GET /api/reports/companies
     */
    async listCompanies(req, res) {
        try {
            const companies = await feedbackRepository.getAllCompanies();

            return res.status(200).json({
                success: true,
                data: companies,
                count: companies.length
            });

        } catch (error) {
            console.error('Error fetching companies:', error);

            return res.status(500).json({
                success: false,
                error: 'An error occurred while fetching the company list.'
            });
        }
    }

    /**
     * Gets feedback count for a specific company
     * 
     * @route GET /api/reports/companies/:companyName/count
     */
    async getFeedbackCount(req, res) {
        try {
            const { companyName } = req.params;

            if (!companyName) {
                return res.status(400).json({
                    success: false,
                    error: 'Company name is required'
                });
            }

            const count = await feedbackRepository.getFeedbackCount(companyName);

            return res.status(200).json({
                success: true,
                data: {
                    company: companyName,
                    feedbackCount: count
                }
            });

        } catch (error) {
            console.error('Error fetching feedback count:', error);

            return res.status(500).json({
                success: false,
                error: 'An error occurred while fetching the feedback count.'
            });
        }
    }
}

export default new ReportController();
