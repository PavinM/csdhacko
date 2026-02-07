import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AI-Powered Feedback Analyzer using Groq LLM
 * Replaces rule-based pattern detection with intelligent language model analysis
 */
class AIFeedbackAnalyzer {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        this.model = 'llama-3.3-70b-versatile'; // Fast, high-quality model
    }

    /**
     * Analyzes feedback entries using AI and generates structured insights
     * 
     * @param {Array} feedbackEntries - Array of feedback documents from MongoDB
     * @param {string} companyName - Name of the company being analyzed
     * @returns {Object} AI-generated structured analysis
     */
    async analyze(feedbackEntries, companyName) {
        if (!feedbackEntries || feedbackEntries.length === 0) {
            return this._getEmptyAnalysis(companyName);
        }

        try {
            // Prepare sanitized feedback data for AI analysis
            const sanitizedFeedback = this._sanitizeFeedbackData(feedbackEntries);

            // Generate AI analysis
            const analysis = await this._generateAIAnalysis(sanitizedFeedback, companyName);

            return {
                companyName,
                totalFeedbackCount: feedbackEntries.length,
                aiGenerated: true,
                ...analysis
            };

        } catch (error) {
            console.error('AI analysis failed, falling back to basic analysis:', error.message);
            return this._getFallbackAnalysis(feedbackEntries, companyName);
        }
    }

    /**
     * Sanitizes feedback data by removing any remaining personal identifiers
     * and formatting for AI consumption
     */
    _sanitizeFeedbackData(feedbackEntries) {
        return feedbackEntries.map((entry, index) => ({
            feedbackId: `F${index + 1}`,
            role: entry.role || 'Not specified',
            rounds: entry.rounds || [],
            overallExperience: entry.overallExperience || '',
            rating: entry.rating || 0,
            tipsForJuniors: entry.tipsForJuniors || ''
        }));
    }

    /**
     * Generates comprehensive analysis using Groq LLM
     */
    async _generateAIAnalysis(sanitizedFeedback, companyName) {
        const prompt = this._buildAnalysisPrompt(sanitizedFeedback, companyName);

        const completion = await this.groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an internal reporting engine for an academic institution's Placement Cell. You analyze student placement feedback and extract structured insights. You never mention AI, automation, or artificial intelligence. You write in formal, institutional language suitable for faculty review. You maintain strict objectivity and present findings in a professional academic tone.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: this.model,
            temperature: 0.3, // Lower temperature for consistent, factual analysis
            response_format: { type: 'json_object' }
        });

        const analysisText = completion.choices[0]?.message?.content;
        return JSON.parse(analysisText);
    }

    /**
     * Builds structured prompt for AI analysis
     */
    _buildAnalysisPrompt(sanitizedFeedback, companyName) {
        const feedbackSummary = JSON.stringify(sanitizedFeedback, null, 2);

        return `Analyze the following placement interview feedback data for ${companyName} and extract structured insights.

FEEDBACK DATA:
${feedbackSummary}

ANALYSIS REQUIREMENTS:

1. Overall Sentiment: Determine the overall student experience sentiment (use one of: "predominantly positive", "moderately positive", "mixed", "challenging")

2. Interview Process Analysis:
   - Identify common interview round types (e.g., Aptitude, Coding, Technical, HR, Group Discussion)
   - Determine difficulty trends for each round type (Easy, Moderate, Difficult, or ranges like "Easy to Moderate")
   - Count online vs offline interview modes

3. Positive Aspects: Extract 3-5 recurring positive observations from student experiences

4. Challenges: Identify 3-5 common difficulties or challenges students faced

5. Preparation Insights: Derive 4-6 actionable preparation recommendations for future candidates based on student experiences and tips

CRITICAL INSTRUCTIONS:
- Be concise and professional
- Use institutional academic language
- Do NOT mention individual students or quote verbatim
- Focus on PATTERNS across multiple feedback entries
- Ignore outliers (mentioned by only 1 student)
- Extract insights that appear in at least 2 feedback entries

OUTPUT FORMAT (JSON):
{
  "overallSentiment": "string",
  "interviewProcess": {
    "commonRounds": ["round1", "round2"],
    "difficultyTrends": {
      "roundType": "difficulty level"
    },
    "modeDistribution": {
      "online": number,
      "offline": number
    }
  },
  "positiveAspects": ["aspect1", "aspect2", ...],
  "challenges": ["challenge1", "challenge2", ...],
  "preparationInsights": ["insight1", "insight2", ...]
}`;
    }

    /**
     * Fallback analysis when AI generation fails
     * Uses basic statistical aggregation
     */
    _getFallbackAnalysis(feedbackEntries, companyName) {
        const avgRating = feedbackEntries.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackEntries.length;

        let sentiment = 'mixed';
        if (avgRating >= 4) sentiment = 'predominantly positive';
        else if (avgRating >= 3) sentiment = 'moderately positive';
        else if (avgRating < 2) sentiment = 'challenging';

        return {
            companyName,
            totalFeedbackCount: feedbackEntries.length,
            aiGenerated: false,
            overallSentiment: sentiment,
            interviewProcess: {
                commonRounds: ['Multiple rounds conducted'],
                difficultyTrends: {},
                modeDistribution: { online: 0, offline: 0 }
            },
            positiveAspects: ['Students provided constructive feedback on the process'],
            challenges: ['Varied experiences reported across candidates'],
            preparationInsights: [
                'Thorough preparation recommended for technical assessments',
                'Review of fundamental concepts advised',
                'Practice coding and problem-solving exercises'
            ]
        };
    }

    /**
     * Returns empty analysis structure when no feedback exists
     */
    _getEmptyAnalysis(companyName) {
        return {
            companyName,
            totalFeedbackCount: 0,
            aiGenerated: false,
            overallSentiment: 'No feedback data available',
            interviewProcess: {
                commonRounds: [],
                difficultyTrends: {},
                modeDistribution: { online: 0, offline: 0 }
            },
            positiveAspects: [],
            challenges: [],
            preparationInsights: []
        };
    }
}

export default new AIFeedbackAnalyzer();
