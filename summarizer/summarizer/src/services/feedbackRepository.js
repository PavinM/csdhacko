import Feedback from '../models/Feedback.js';

/**
 * Repository for accessing and aggregating student placement feedback data
 */
class FeedbackRepository {
    /**
     * Retrieves all feedback entries for a specific company
     * Personal identifiers are excluded from the projection
     * 
     * @param {string} companyName - Name of the company
     * @returns {Promise<Array>} Array of feedback documents
     */
    async getFeedbackByCompany(companyName) {
        try {
            const feedbackEntries = await Feedback.find(
                { company: { $regex: new RegExp(`^${companyName}$`, 'i') } },
                {
                    // Exclude personal identifiers if present
                    studentName: 0,
                    rollNumber: 0,
                    email: 0,
                    studentId: 0,
                    __v: 0
                }
            ).lean();

            return feedbackEntries;
        } catch (error) {
            throw new Error(`Error fetching feedback for company ${companyName}: ${error.message}`);
        }
    }

    /**
     * Gets distinct list of all companies in the database
     * 
     * @returns {Promise<Array>} Array of company names
     */
    async getAllCompanies() {
        try {
            const companies = await Feedback.distinct('company');
            return companies.sort();
        } catch (error) {
            throw new Error(`Error fetching company list: ${error.message}`);
        }
    }

    /**
     * Gets count of feedback entries for a specific company
     * 
     * @param {string} companyName - Name of the company
     * @returns {Promise<number>} Count of feedback entries
     */
    async getFeedbackCount(companyName) {
        try {
            const count = await Feedback.countDocuments({
                company: { $regex: new RegExp(`^${companyName}$`, 'i') }
            });
            return count;
        } catch (error) {
            throw new Error(`Error counting feedback: ${error.message}`);
        }
    }
}

export default new FeedbackRepository();
