import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Quick test script for AI-powered report generation
 * Tests Groq API connectivity and report generation
 */

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function testGroqConnection() {
    console.log('Testing Groq API connection...\n');

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant.'
                },
                {
                    role: 'user',
                    content: 'Respond with "Connection successful" if you can read this.'
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3
        });

        const response = completion.choices[0]?.message?.content;
        console.log('✓ Groq API Response:', response);
        console.log('✓ API connection successful!\n');
        return true;

    } catch (error) {
        console.error('✗ Groq API connection failed:', error.message);
        return false;
    }
}

async function testAIAnalysis() {
    console.log('Testing AI analysis with sample feedback...\n');

    const sampleFeedback = [
        {
            feedbackId: 'F1',
            role: 'Software Engineer',
            rounds: [
                { type: 'Aptitude', difficulty: 'Moderate', mode: 'Online' },
                { type: 'Coding', difficulty: 'Difficult', mode: 'Online' },
                { type: 'Technical', difficulty: 'Moderate', mode: 'Offline' }
            ],
            overallExperience: 'The process was well organized and professional. Coding round was challenging but fair.',
            rating: 4,
            tipsForJuniors: 'Practice DSA problems regularly. Be thorough with projects on resume.'
        },
        {
            feedbackId: 'F2',
            role: 'Software Engineer',
            rounds: [
                { type: 'Aptitude', difficulty: 'Easy', mode: 'Online' },
                { type: 'Coding', difficulty: 'Moderate', mode: 'Online' },
                { type: 'Technical', difficulty: 'Difficult', mode: 'Online' }
            ],
            overallExperience: 'Good experience. Interviewers were supportive. System design was tough.',
            rating: 4,
            tipsForJuniors: 'Prepare system design concepts. Time management is crucial.'
        }
    ];

    const prompt = `Analyze the following placement interview feedback and extract insights.

FEEDBACK DATA:
${JSON.stringify(sampleFeedback, null, 2)}

Extract:
1. Overall sentiment
2. Common interview rounds
3. Difficulty trends
4. Positive aspects (2-3)
5. Challenges (2-3)
6. Preparation insights (3-4)

Return as JSON with these exact keys: overallSentiment, commonRounds, positiveAspects, challenges, preparationInsights`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a placement feedback analyzer. Generate structured insights in JSON format.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(completion.choices[0]?.message?.content);
        console.log('✓ AI Analysis Result:');
        console.log(JSON.stringify(analysis, null, 2));
        console.log('\n✓ AI analysis test successful!\n');
        return true;

    } catch (error) {
        console.error('✗ AI analysis test failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('====================================');
    console.log('Groq AI Integration Test Suite');
    console.log('====================================\n');

    const connectionTest = await testGroqConnection();
    if (!connectionTest) {
        console.log('\n✗ Stopping tests - API connection failed');
        process.exit(1);
    }

    const analysisTest = await testAIAnalysis();

    console.log('====================================');
    if (connectionTest && analysisTest) {
        console.log('✓ All tests passed!');
        console.log('✓ AI-powered report generation is ready');
    } else {
        console.log('✗ Some tests failed');
    }
    console.log('====================================\n');
}

runTests();
