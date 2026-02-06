import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import companyRoutes from './routes/companyRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    credentials: true
}));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/companies', companyRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
