import express from 'express';
import cors from 'cors';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'operational',
        service: 'KEC Placement Feedback Summarizer',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        service: 'KEC Placement Feedback Summarizer',
        version: '1.0.0',
        description: 'Backend service for generating formal placement drive feedback summary reports',
        endpoints: {
            health: 'GET /health',
            generateReport: 'POST /api/reports/generate',
            listCompanies: 'GET /api/reports/companies',
            feedbackCount: 'GET /api/reports/companies/:companyName/count'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'An internal error occurred'
    });
});

export default app;
