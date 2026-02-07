import app from './app.js';
import connectDatabase from './config/database.js';

const PORT = process.env.PORT || 3000;

// Initialize database connection and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDatabase();
        console.log('Database connection established');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`KEC Placement Feedback Summarizer Service`);
            console.log(`${'='.repeat(60)}`);
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`\nEndpoints:`);
            console.log(`  Health Check:     GET  http://localhost:${PORT}/health`);
            console.log(`  Generate Report:  POST http://localhost:${PORT}/api/reports/generate`);
            console.log(`  List Companies:   GET  http://localhost:${PORT}/api/reports/companies`);
            console.log(`${'='.repeat(60)}\n`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();
