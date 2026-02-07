/**
 * Report Generator Service
 * Converts analyzed feedback data into formal, institutional report format
 */
class ReportGenerator {
    /**
     * Generates a complete 6-section formal report from analyzed feedback data
     * 
     * @param {Object} analysis - Structured analysis from FeedbackAnalyzer
     * @returns {Object} Formatted report with all sections
     */
    generateReport(analysis) {
        const { companyName, totalFeedbackCount } = analysis;

        if (totalFeedbackCount === 0) {
            return this._generateNoDataReport(companyName);
        }

        return {
            title: `Placement Drive Feedback Summary Report – ${companyName}`,
            generatedDate: new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            sections: {
                overview: this._generateOverview(analysis),
                interviewProcessInsights: this._generateInterviewProcessInsights(analysis),
                positiveObservations: this._generatePositiveObservations(analysis),
                challengesAndImprovements: this._generateChallengesAndImprovements(analysis),
                preparationInsights: this._generatePreparationInsights(analysis),
                conclusion: this._generateConclusion(analysis)
            }
        };
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
            }
        };
    }

    /**
     * Section 1: Overview
     */
    _generateOverview(analysis) {
        const { companyName, totalFeedbackCount, overallSentiment, interviewProcess } = analysis;

        const roundSummary = interviewProcess.rounds.length > 0
            ? `typically consisting of ${this._formatRoundsList(interviewProcess.rounds)}`
            : 'with varying interview structures';

        const modeSummary = this._getModeSummary(interviewProcess.modeTrends);

        return `This report summarizes student experiences from ${totalFeedbackCount} feedback ${totalFeedbackCount === 1 ? 'entry' : 'entries'} submitted following the ${companyName} campus placement drive. The overall student experience was ${overallSentiment}. The recruitment process ${roundSummary}, conducted ${modeSummary}. Students reported diverse experiences across technical assessments, problem-solving exercises, and behavioral evaluations.`;
    }

    /**
     * Section 2: Interview Process Insights
     */
    _generateInterviewProcessInsights(analysis) {
        const { interviewProcess } = analysis;
        const { rounds, difficultyTrends, modeTrends } = interviewProcess;

        let insights = '';

        // Rounds description
        if (rounds.length > 0) {
            insights += `The recruitment process commonly included the following rounds: ${this._formatDetailedRounds(rounds)}. `;
        }

        // Difficulty trends
        if (Object.keys(difficultyTrends).length > 0) {
            insights += '\n\n';
            insights += this._formatDifficultyTrends(difficultyTrends);
        }

        // Mode distribution
        if (modeTrends.online > 0 || modeTrends.offline > 0) {
            insights += '\n\n';
            insights += this._formatModeDistribution(modeTrends);
        }

        return insights.trim() || 'Interview process details vary across feedback entries.';
    }

    /**
     * Section 3: Positive Observations
     */
    _generatePositiveObservations(analysis) {
        const { positiveAspects } = analysis;

        if (positiveAspects.length === 0) {
            return ['Students provided constructive feedback on the overall process.'];
        }

        return positiveAspects.map(aspect => this._standardizeLanguage(aspect));
    }

    /**
     * Section 4: Challenges and Areas for Improvement
     */
    _generateChallengesAndImprovements(analysis) {
        const { challenges } = analysis;

        if (challenges.length === 0) {
            return ['No significant systemic challenges were reported.'];
        }

        return challenges.map(challenge => this._standardizeLanguage(challenge));
    }

    /**
     * Section 5: Preparation Insights for Future Candidates
     */
    _generatePreparationInsights(analysis) {
        const { preparationInsights, interviewProcess } = analysis;

        const insights = [];

        // Add specific insights from analysis
        if (preparationInsights.length > 0) {
            insights.push(...preparationInsights.map(insight => this._standardizeLanguage(insight)));
        }

        // Add general recommendations based on interview structure
        if (interviewProcess.rounds.some(r => r.type === 'Coding')) {
            insights.push('Consistent practice on coding platforms to build problem-solving speed and accuracy');
        }

        if (interviewProcess.rounds.some(r => r.type === 'Aptitude')) {
            insights.push('Focused preparation for quantitative aptitude and logical reasoning assessments');
        }

        // Ensure at least some generic guidance if nothing specific
        if (insights.length === 0) {
            insights.push('Thorough review of fundamental computer science concepts and data structures');
            insights.push('Preparation of articulate explanations for resume projects and technical decisions');
            insights.push('Mock interview practice to build confidence and communication skills');
        }

        return insights;
    }

    /**
     * Section 6: Conclusion
     */
    _generateConclusion(analysis) {
        const { companyName, totalFeedbackCount, overallSentiment } = analysis;

        return `The feedback collected from ${totalFeedbackCount} ${totalFeedbackCount === 1 ? 'student' : 'students'} indicates a ${overallSentiment} experience with the ${companyName} placement drive. The insights gathered will assist future candidates in their preparation and enable the Placement Cell to maintain effective coordination with recruiting organizations. This report serves as an institutional record for faculty review and continuous improvement of placement support services.`;
    }

    // Helper methods

    _formatRoundsList(rounds) {
        const roundNames = rounds.map(r => r.type);
        if (roundNames.length === 1) return roundNames[0];
        if (roundNames.length === 2) return `${roundNames[0]} and ${roundNames[1]} rounds`;

        const last = roundNames.pop();
        return `${roundNames.join(', ')}, and ${last} rounds`;
    }

    _formatDetailedRounds(rounds) {
        return rounds.map(r => `${r.type} (${r.frequency} ${r.frequency === 1 ? 'instance' : 'instances'})`).join(', ');
    }

    _getModeSummary(modeTrends) {
        const { online, offline } = modeTrends;
        const total = online + offline;

        if (total === 0) return 'in various modes';
        if (online > 0 && offline === 0) return 'primarily online';
        if (offline > 0 && online === 0) return 'primarily offline';

        const onlinePercent = Math.round((online / total) * 100);
        return `in a hybrid format (${onlinePercent}% online, ${100 - onlinePercent}% offline)`;
    }

    _formatDifficultyTrends(difficultyTrends) {
        const trends = Object.entries(difficultyTrends)
            .map(([round, difficulty]) => `${round} rounds were reported as ${difficulty}`)
            .join('. ');

        return `Difficulty Assessment: ${trends}.`;
    }

    _formatModeDistribution(modeTrends) {
        const { online, offline } = modeTrends;
        const total = online + offline;

        if (total === 0) return '';

        return `Interview Mode: ${online} rounds conducted online and ${offline} rounds conducted offline.`;
    }

    _standardizeLanguage(text) {
        // Capitalize first letter
        return text.charAt(0).toUpperCase() + text.slice(1);
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

export default new ReportGenerator();
