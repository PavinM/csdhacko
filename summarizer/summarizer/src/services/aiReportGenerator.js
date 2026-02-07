import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AI-Enhanced Report Generator
 * Uses Groq LLM to generate formal, institutional-quality report sections
 */
class AIReportGenerator {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        this.model = 'llama-3.3-70b-versatile';
    }

    /**
     * Generates a complete 6-section formal report using AI
     * 
     * @param {Object} analysis - Structured analysis from AIFeedbackAnalyzer
     * @returns {Object} AI-generated formatted report
     */
    async generateReport(analysis) {
        const { companyName, totalFeedbackCount } = analysis;

        if (totalFeedbackCount === 0) {
            return this._generateNoDataReport(companyName);
        }

        try {
            // Generate report sections using AI
            const sections = await this._generateReportSections(analysis);

            return {
                title: `Placement Drive Feedback Summary Report – ${companyName}`,
                generatedDate: new Date().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                sections,
                aiGenerated: true
            };
        } catch (error) {
            console.error('AI report generation failed, using fallback:', error.message);
            return this._generateFallbackReport(analysis);
        }
    }

    /**
     * Generates all report sections using AI with proper institutional formatting
     */
    async _generateReportSections(analysis) {
        const prompt = this._buildReportPrompt(analysis);

        const completion = await this.groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an internal documentation engine for an academic institution's Placement Cell. You generate formal, professional placement feedback reports suitable for faculty review and institutional records. You write in formal academic language, maintain objectivity, and never mention AI, automation, or artificial intelligence. Your reports are concise, well-structured, and appropriate for PDF export.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: this.model,
            temperature: 0.4, // Slightly higher for better prose while maintaining professionalism
            response_format: { type: 'json_object' }
        });

        const reportText = completion.choices[0]?.message?.content;
        return JSON.parse(reportText);
    }

    /**
     * Builds comprehensive prompt for report generation
     */
    _buildReportPrompt(analysis) {
        const { companyName, totalFeedbackCount, overallSentiment, interviewProcess, positiveAspects, challenges, preparationInsights } = analysis;

        return `Generate a formal placement feedback summary report for ${companyName} based on the following analyzed data.

ANALYSIS DATA:
- Total Feedback Entries: ${totalFeedbackCount}
- Overall Sentiment: ${overallSentiment}
- Common Interview Rounds: ${interviewProcess.commonRounds.join(', ')}
- Difficulty Trends: ${JSON.stringify(interviewProcess.difficultyTrends)}
- Interview Modes: ${interviewProcess.modeDistribution.online} online, ${interviewProcess.modeDistribution.offline} offline
- Positive Aspects: ${JSON.stringify(positiveAspects)}
- Challenges: ${JSON.stringify(challenges)}
- Preparation Insights: ${JSON.stringify(preparationInsights)}

REPORT REQUIREMENTS:

Generate the following 6 sections in formal institutional language:

1. OVERVIEW (Single paragraph, 4-6 sentences):
   - Summarize overall student experience
   - Mention number of feedback entries
   - Describe interview process structure
   - Note interview modes
   - Maintain formal, objective tone

2. INTERVIEW PROCESS INSIGHTS (2-3 paragraphs):
   - Describe common interview rounds
   - Discuss difficulty trends
   - Explain online vs offline distribution
   - Use complete sentences and formal structure

3. POSITIVE OBSERVATIONS (Bullet points, 3-5 items):
   - List strengths and well-received aspects
   - Each point should be a complete, formal statement
   - Start each with capital letter, no ending punctuation

4. CHALLENGES AND AREAS FOR IMPROVEMENT (Bullet points, 3-5 items):
   - List commonly reported difficulties
   - Use constructive, professional language
   - Focus on systemic patterns, not individual complaints

5. PREPARATION INSIGHTS FOR FUTURE CANDIDATES (Bullet points, 4-6 items):
   - Provide actionable, specific guidance
   - Based on student experiences and tips
   - Professional, instructive tone

6. CONCLUSION (Single paragraph, 3-4 sentences):
   - Summary of feedback significance
   - Value for future candidates and placement cell
   - Formal institutional closing
   - Mention use for faculty review and records

CRITICAL FORMATTING RULES:
- Use formal academic language throughout
- NO informal expressions, slang, or casual tone
- NO emojis or conversational phrases
- Write as if authored by the Placement Cell
- Ensure bullet points are complete statements
- Maintain objectivity and professionalism

OUTPUT FORMAT (JSON):
{
  "overview": "paragraph text",
  "interviewProcessInsights": "paragraph(s) text",
  "positiveObservations": ["point1", "point2", ...],
  "challengesAndImprovements": ["point1", "point2", ...],
  "preparationInsights": ["point1", "point2", ...],
  "conclusion": "paragraph text"
}`;
    }

    /**
     * Generates report for companies with no feedback data
     */
    _generateNoDataReport(companyName) {
        return {
            title: `Placement Drive Feedback Summary Report – ${companyName}`,
            generatedDate: new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            sections: {
                overview: 'No student feedback has been submitted for this company to date. This report will be updated as feedback entries are recorded in the placement portal.',
                interviewProcessInsights: 'Data not available.',
                positiveObservations: [],
                challengesAndImprovements: [],
                preparationInsights: [],
                conclusion: 'The Placement Cell will continue to monitor feedback submissions and update this report accordingly.'
            },
            aiGenerated: false
        };
    }

    /**
     * Fallback report generation without AI
     */
    _generateFallbackReport(analysis) {
        const { companyName, totalFeedbackCount, overallSentiment, positiveAspects, challenges, preparationInsights } = analysis;

        return {
            title: `Placement Drive Feedback Summary Report – ${companyName}`,
            generatedDate: new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            sections: {
                overview: `This report summarizes student experiences from ${totalFeedbackCount} feedback ${totalFeedbackCount === 1 ? 'entry' : 'entries'} submitted following the ${companyName} campus placement drive. The overall student experience was ${overallSentiment}.`,
                interviewProcessInsights: 'The recruitment process included multiple interview rounds across various formats and difficulty levels.',
                positiveObservations: positiveAspects.length > 0 ? positiveAspects : ['Students provided constructive feedback on the process'],
                challengesAndImprovements: challenges.length > 0 ? challenges : ['Standard placement interview challenges reported'],
                preparationInsights: preparationInsights.length > 0 ? preparationInsights : [
                    'Thorough preparation recommended for technical assessments',
                    'Review of fundamental concepts advised'
                ],
                conclusion: `The feedback collected provides valuable insights for future candidates and the Placement Cell's coordination efforts.`
            },
            aiGenerated: false
        };
    }

    /**
     * Generates plain text version of the report for PDF export
     */
    generatePlainTextReport(report) {
        if (!report.sections) return '';

        let plainText = `${report.title}\n`;
        plainText += `Generated: ${report.generatedDate}\n`;
        plainText += `${'='.repeat(report.title.length)}\n\n`;

        plainText += `1. Overview\n`;
        plainText += `${report.sections.overview}\n\n`;

        plainText += `2. Interview Process Insights\n`;
        plainText += `${report.sections.interviewProcessInsights}\n\n`;

        plainText += `3. Positive Observations\n`;
        if (Array.isArray(report.sections.positiveObservations)) {
            report.sections.positiveObservations.forEach(obs => {
                plainText += `• ${obs}\n`;
            });
        }
        plainText += `\n`;

        plainText += `4. Challenges and Areas for Improvement\n`;
        if (Array.isArray(report.sections.challengesAndImprovements)) {
            report.sections.challengesAndImprovements.forEach(challenge => {
                plainText += `• ${challenge}\n`;
            });
        }
        plainText += `\n`;

        plainText += `5. Preparation Insights for Future Candidates\n`;
        if (Array.isArray(report.sections.preparationInsights)) {
            report.sections.preparationInsights.forEach(insight => {
                plainText += `• ${insight}\n`;
            });
        }
        plainText += `\n`;

        plainText += `6. Conclusion\n`;
        plainText += `${report.sections.conclusion}\n`;

        return plainText;
    }
}

export default new AIReportGenerator();
