/**
 * Feedback Analyzer Service
 * Processes raw student feedback data and extracts structured insights
 */
class FeedbackAnalyzer {
    /**
     * Analyzes feedback entries and generates structured insights
     * 
     * @param {Array} feedbackEntries - Array of feedback documents from MongoDB
     * @param {string} companyName - Name of the company being analyzed
     * @returns {Object} Structured analysis containing patterns, trends, and insights
     */
    analyze(feedbackEntries, companyName) {
        if (!feedbackEntries || feedbackEntries.length === 0) {
            return this._getEmptyAnalysis(companyName);
        }

        return {
            companyName,
            totalFeedbackCount: feedbackEntries.length,
            overallSentiment: this._analyzeOverallSentiment(feedbackEntries),
            interviewProcess: this._analyzeInterviewProcess(feedbackEntries),
            positiveAspects: this._extractPositiveAspects(feedbackEntries),
            challenges: this._extractChallenges(feedbackEntries),
            preparationInsights: this._extractPreparationInsights(feedbackEntries)
        };
    }

    /**
     * Returns empty analysis structure when no feedback exists
     */
    _getEmptyAnalysis(companyName) {
        return {
            companyName,
            totalFeedbackCount: 0,
            overallSentiment: 'No feedback data available',
            interviewProcess: {
                rounds: [],
                difficultyTrends: {},
                modeTrends: {}
            },
            positiveAspects: [],
            challenges: [],
            preparationInsights: []
        };
    }

    /**
     * Analyzes overall sentiment and experience ratings
     */
    _analyzeOverallSentiment(feedbackEntries) {
        const ratings = feedbackEntries
            .map(f => f.rating)
            .filter(r => r !== null && r !== undefined);

        if (ratings.length === 0) {
            return 'mixed experiences';
        }

        const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

        if (avgRating >= 4) {
            return 'predominantly positive';
        } else if (avgRating >= 3) {
            return 'moderately positive';
        } else if (avgRating >= 2) {
            return 'mixed';
        } else {
            return 'challenging';
        }
    }

    /**
     * Analyzes interview process structure, difficulty, and modes
     */
    _analyzeInterviewProcess(feedbackEntries) {
        const roundTypes = {};
        const difficultyByRound = {};
        const modeCount = { online: 0, offline: 0 };

        feedbackEntries.forEach(feedback => {
            if (!feedback.rounds || feedback.rounds.length === 0) return;

            feedback.rounds.forEach(round => {
                // Count round types
                const roundType = this._normalizeRoundType(round.type);
                roundTypes[roundType] = (roundTypes[roundType] || 0) + 1;

                // Track difficulty
                if (round.difficulty) {
                    if (!difficultyByRound[roundType]) {
                        difficultyByRound[roundType] = [];
                    }
                    difficultyByRound[roundType].push(this._normalizeDifficulty(round.difficulty));
                }

                // Track mode
                if (round.mode) {
                    const mode = round.mode.toLowerCase();
                    if (mode.includes('online')) modeCount.online++;
                    else if (mode.includes('offline')) modeCount.offline++;
                }
            });
        });

        // Calculate difficulty trends
        const difficultyTrends = {};
        Object.keys(difficultyByRound).forEach(roundType => {
            difficultyTrends[roundType] = this._calculateDifficultyTrend(difficultyByRound[roundType]);
        });

        return {
            rounds: this._formatRoundTypes(roundTypes),
            difficultyTrends,
            modeTrends: modeCount
        };
    }

    /**
     * Normalizes round type variations to standard names
     */
    _normalizeRoundType(type) {
        const normalized = type.toLowerCase().trim();
        if (normalized.includes('aptitude') || normalized.includes('quant')) {
            return 'Aptitude';
        } else if (normalized.includes('coding') || normalized.includes('programming')) {
            return 'Coding';
        } else if (normalized.includes('technical') || normalized.includes('tech')) {
            return 'Technical';
        } else if (normalized.includes('hr') || normalized.includes('human resource')) {
            return 'HR';
        } else if (normalized.includes('group') || normalized.includes('gd')) {
            return 'Group Discussion';
        } else {
            return type;
        }
    }

    /**
     * Normalizes difficulty levels to standard scale
     */
    _normalizeDifficulty(difficulty) {
        const normalized = difficulty.toLowerCase().trim();
        if (normalized.includes('easy')) return 1;
        if (normalized.includes('medium') || normalized.includes('moderate')) return 2;
        if (normalized.includes('hard') || normalized.includes('difficult')) return 3;
        return 2; // Default to medium
    }

    /**
     * Calculates dominant difficulty trend for a round type
     */
    _calculateDifficultyTrend(difficulties) {
        if (difficulties.length === 0) return 'Moderate';

        const avg = difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length;

        if (avg <= 1.5) return 'Easy to Moderate';
        if (avg <= 2.5) return 'Moderate';
        return 'Moderate to Difficult';
    }

    /**
     * Formats round types for reporting
     */
    _formatRoundTypes(roundTypes) {
        return Object.entries(roundTypes)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => ({ type, frequency: count }));
    }

    /**
     * Extracts positive aspects from feedback
     */
    _extractPositiveAspects(feedbackEntries) {
        const positiveKeywords = [
            'good', 'excellent', 'well-organized', 'professional', 'supportive',
            'friendly', 'smooth', 'clear', 'fair', 'helpful', 'positive', 'great'
        ];

        const aspects = new Map();

        feedbackEntries.forEach(feedback => {
            const text = (feedback.overallExperience || '').toLowerCase();

            if (text.includes('well') && text.includes('organized')) {
                this._incrementAspect(aspects, 'Well-organized interview process');
            }
            if (text.includes('professional') || text.includes('formal')) {
                this._incrementAspect(aspects, 'Professional conduct maintained throughout');
            }
            if (text.includes('friendly') || text.includes('supportive')) {
                this._incrementAspect(aspects, 'Supportive and approachable interviewers');
            }
            if (text.includes('clear') || text.includes('transparent')) {
                this._incrementAspect(aspects, 'Clear communication of expectations');
            }
            if (text.includes('fair') || text.includes('unbiased')) {
                this._incrementAspect(aspects, 'Fair and unbiased evaluation process');
            }
        });

        return this._getSortedAspects(aspects, 2);
    }

    /**
     * Extracts challenges and difficulties from feedback
     */
    _extractChallenges(feedbackEntries) {
        const challengeKeywords = {
            'Time management': ['time', 'rushed', 'quick', 'pressure'],
            'Technical depth': ['difficult', 'complex', 'advanced', 'deep'],
            'Preparation gaps': ['unprepared', 'unexpected', 'unfamiliar'],
            'Communication barriers': ['explain', 'communicate', 'articulate'],
            'Stress management': ['stress', 'nervous', 'anxiety', 'pressure']
        };

        const challenges = new Map();

        feedbackEntries.forEach(feedback => {
            const experienceText = (feedback.overallExperience || '').toLowerCase();
            const tipsText = (feedback.tipsForJuniors || '').toLowerCase();
            const combinedText = `${experienceText} ${tipsText}`;

            // Check for negative indicators
            if (combinedText.includes('time') && (combinedText.includes('manage') || combinedText.includes('short'))) {
                this._incrementAspect(challenges, 'Time management during coding and technical rounds');
            }
            if (combinedText.includes('difficult') || combinedText.includes('tough') || combinedText.includes('hard')) {
                this._incrementAspect(challenges, 'Complexity of technical questions');
            }
            if (combinedText.includes('practice') || combinedText.includes('prepare')) {
                this._incrementAspect(challenges, 'Adequate preparation required for problem-solving');
            }
            if (combinedText.includes('stress') || combinedText.includes('pressure') || combinedText.includes('nervous')) {
                this._incrementAspect(challenges, 'Managing pressure in high-stakes interview scenarios');
            }

            // Check rounds for specific challenges
            if (feedback.rounds) {
                feedback.rounds.forEach(round => {
                    const questionsText = (round.questions || '').toLowerCase();
                    if (questionsText.includes('data structure') || questionsText.includes('algorithm')) {
                        this._incrementAspect(challenges, 'Data structures and algorithms proficiency');
                    }
                    if (questionsText.includes('system design')) {
                        this._incrementAspect(challenges, 'System design and architecture knowledge');
                    }
                });
            }
        });

        return this._getSortedAspects(challenges, 2);
    }

    /**
     * Extracts preparation insights and actionable guidance
     */
    _extractPreparationInsights(feedbackEntries) {
        const insights = new Map();
        const resources = new Set();

        feedbackEntries.forEach(feedback => {
            const tips = (feedback.tipsForJuniors || '').toLowerCase();

            // Extract common preparation advice
            if (tips.includes('practice') && (tips.includes('coding') || tips.includes('programming'))) {
                this._incrementAspect(insights, 'Regular practice of coding problems on competitive platforms');
            }
            if (tips.includes('data structure') || tips.includes('algorithm') || tips.includes('dsa')) {
                this._incrementAspect(insights, 'Strong foundation in data structures and algorithms');
            }
            if (tips.includes('project') || tips.includes('resume')) {
                this._incrementAspect(insights, 'Thorough understanding of projects mentioned in resume');
            }
            if (tips.includes('aptitude') || tips.includes('quant')) {
                this._incrementAspect(insights, 'Preparation for aptitude and quantitative reasoning');
            }
            if (tips.includes('communication') || tips.includes('explain')) {
                this._incrementAspect(insights, 'Clear communication and explanation of technical concepts');
            }
            if (tips.includes('time') && tips.includes('manage')) {
                this._incrementAspect(insights, 'Time management strategies for coding assessments');
            }

            // Extract resources
            if (feedback.rounds) {
                feedback.rounds.forEach(round => {
                    if (round.resources) {
                        const resourceList = round.resources.split(',').map(r => r.trim());
                        resourceList.forEach(r => {
                            if (r && r.length > 2) resources.add(r);
                        });
                    }
                });
            }
        });

        // Add resource-based insight if resources are mentioned
        if (resources.size > 0) {
            const topResources = Array.from(resources).slice(0, 3);
            insights.set(`Recommended resources: ${topResources.join(', ')}`, topResources.length);
        }

        return this._getSortedAspects(insights, 2);
    }

    /**
     * Helper to increment aspect count with frequency tracking
     */
    _incrementAspect(aspectsMap, aspect) {
        aspectsMap.set(aspect, (aspectsMap.get(aspect) || 0) + 1);
    }

    /**
     * Returns sorted aspects by frequency, with minimum threshold
     */
    _getSortedAspects(aspectsMap, minFrequency = 1) {
        return Array.from(aspectsMap.entries())
            .filter(([_, count]) => count >= minFrequency)
            .sort((a, b) => b[1] - a[1])
            .map(([aspect, _]) => aspect);
    }
}

export default new FeedbackAnalyzer();
