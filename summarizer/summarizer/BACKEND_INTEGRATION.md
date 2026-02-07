# Backend Integration Guide
## Merging Summarizer into Existing KEC Portal

---

## Integration Options

### Option 1: Module Integration (Recommended)

Integrate as a module within your existing Express application.

**Advantages:**
- Single deployment
- Shared MongoDB connection
- No network overhead
- Easier authentication

**Steps:**

1. **Copy service files to your existing backend:**

```bash
# From your existing backend root
mkdir -p src/modules/summarizer

# Copy files
cp -r d:/summarizer/src/services src/modules/summarizer/
cp -r d:/summarizer/src/controllers/reportController.js src/modules/summarizer/
```

2. **Update imports in your existing Express app:**

```javascript
// src/app.js or server.js

import reportRoutes from './modules/summarizer/routes/reportRoutes.js';

// ... existing middleware ...

// Add summarizer routes
app.use('/api/reports', reportRoutes);
```

3. **Share MongoDB connection:**

```javascript
// In reportController.js, update to use existing connection
import mongoose from '../../../config/database.js'; // Your existing DB config

// Services will automatically use the shared Mongoose connection
```

4. **Add environment variables to your existing `.env`:**

```env
# Add to your existing .env file
GROQ_API_KEY=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
```

5. **Install Groq SDK in your main project:**

```bash
npm install groq-sdk
```

6. **Apply authentication middleware:**

```javascript
// src/modules/summarizer/routes/reportRoutes.js

import { authMiddleware } from '../../../middleware/auth.js'; // Your existing auth

router.post('/generate', authMiddleware, reportController.generateReport);
router.get('/companies', authMiddleware, reportController.listCompanies);
```

---

### Option 2: Microservice (Separate Deployment)

Keep as standalone service, call via HTTP.

**Advantages:**
- Independent scaling
- Language/tech agnostic
- Isolated failures

**Implementation:**

```javascript
// In your main backend API routes

import axios from 'axios';

const SUMMARIZER_URL = process.env.SUMMARIZER_SERVICE_URL || 'http://localhost:3000';

router.post('/admin/reports/generate', authMiddleware, async (req, res) => {
  const { companyName } = req.body;
  
  try {
    const response = await axios.post(`${SUMMARIZER_URL}/api/reports/generate`, {
      companyName,
      useAI: true
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Summarizer service error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Report generation temporarily unavailable' 
    });
  }
});
```

**Environment Variables:**

```env
SUMMARIZER_SERVICE_URL=http://localhost:3000  # Dev
# SUMMARIZER_SERVICE_URL=http://summarizer-service:3000  # Production
```

---

## File Structure (Module Integration)

```
your-kec-backend/
├── src/
│   ├── config/
│   │   └── database.js                    # Existing
│   ├── middleware/
│   │   └── auth.js                        # Existing
│   ├── modules/
│   │   └── summarizer/                    # NEW
│   │       ├── controllers/
│   │       │   └── reportController.js
│   │       ├── routes/
│   │       │   └── reportRoutes.js
│   │       └── services/
│   │           ├── feedbackRepository.js
│   │           ├── feedbackAnalyzer.js
│   │           ├── reportGenerator.js
│   │           ├── aiFeedbackAnalyzer.js
│   │           └── aiReportGenerator.js
│   ├── models/
│   │   └── Feedback.js                    # May already exist
│   └── app.js                             # Modified to include routes
├── .env                                   # Add GROQ_API_KEY
└── package.json                           # Add groq-sdk
```

---

## MongoDB Model Integration

### If Feedback Model Already Exists

**Option A: Use existing model**

```javascript
// In feedbackRepository.js
import Feedback from '../../../models/Feedback.js'; // Your existing model
```

**Option B: Extend existing model**

If your schema differs slightly, create a view:

```javascript
// src/modules/summarizer/models/FeedbackView.js

import mongoose from 'mongoose';

const FeedbackView = mongoose.model('Feedback'); // Reuse existing

export default FeedbackView;
```

### If Feedback Model Doesn't Exist

Copy the model from `d:/summarizer/src/models/Feedback.js` to your project.

---

## Route Registration

### In Your Main App File

```javascript
// src/app.js or src/server.js

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import reportRoutes from './modules/summarizer/routes/reportRoutes.js'; // NEW

const app = express();

app.use(cors());
app.use(express.json());

// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);

// NEW: Summarizer routes (coordinator access only)
app.use('/api/reports', reportRoutes);

export default app;
```

---

## Authentication Integration

### Apply Existing Auth Middleware

```javascript
// src/modules/summarizer/routes/reportRoutes.js

import express from 'express';
import reportController from '../controllers/reportController.js';
import { authenticateUser, requireRole } from '../../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Report generation - coordinators and admins only
router.post('/generate', 
  requireRole(['coordinator', 'admin']), 
  reportController.generateReport
);

// List companies - coordinators and admins only
router.get('/companies', 
  requireRole(['coordinator', 'admin']), 
  reportController.listCompanies
);

// Feedback count - coordinators and admins only
router.get('/companies/:companyName/count', 
  requireRole(['coordinator', 'admin']), 
  reportController.getFeedbackCount
);

export default router;
```

---

## Database Connection Sharing

### Update reportController.js

```javascript
// src/modules/summarizer/controllers/reportController.js

// Remove local database import
// import connectDatabase from '../config/database.js'; // REMOVE

// Services will use the shared Mongoose connection automatically
// No changes needed if models are properly imported
```

### Ensure Services Use Shared Connection

The feedbackRepository already uses Mongoose models, which will automatically use your application's existing connection.

**No changes required** if you're using:

```javascript
import Feedback from '../../../models/Feedback.js';
```

---

## Environment Variables

### Add to Existing .env

```env
# Existing variables
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kec_placement_portal
JWT_SECRET=your_jwt_secret

# NEW: Groq AI (for summarizer)
GROQ_API_KEY=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
```

---

## Testing Integration

### 1. Start Your Existing Backend

```bash
npm run dev
# or
npm start
```

### 2. Test Health Check

```bash
curl http://localhost:5000/health
```

### 3. Test Report Generation

```bash
# Get auth token first
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coordinator@kec.edu.in","password":"password"}' \
  | jq -r '.token')

# Generate report
curl -X POST http://localhost:5000/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"companyName":"TechCorp"}'
```

---

## Error Handling

### Wrap in Try-Catch

```javascript
// In your route handler or controller

try {
  const report = await reportController.generateReport(req, res);
} catch (error) {
  console.error('Report generation error:', error);
  
  // Log to your existing error tracking (Sentry, etc.)
  logger.error('Summarizer error', { error, userId: req.user.id });
  
  res.status(500).json({
    success: false,
    error: 'Report generation failed. Please contact support.'
  });
}
```

---

## Production Deployment Checklist

### Before Deploying

- [ ] Groq API key added to production `.env`
- [ ] Authentication middleware applied to all routes
- [ ] Rate limiting configured
- [ ] CORS restricted to production frontend domain
- [ ] Error logging integrated
- [ ] MongoDB indexes created for `company` field
- [ ] Health check endpoint accessible
- [ ] API documented in team wiki/docs

### Performance Optimization

**Add MongoDB Index:**

```javascript
// In your Feedback model or migration script

feedbackSchema.index({ company: 1 });
feedbackSchema.index({ createdAt: -1 });
```

**Run migration:**

```bash
db.feedbacks.createIndex({ company: 1 })
db.feedbacks.createIndex({ createdAt: -1 })
```

---

## Rollback Strategy

If integration causes issues:

1. **Remove route registration:**

```javascript
// Comment out in app.js
// app.use('/api/reports', reportRoutes);
```

2. **Redeploy without summarizer module**

3. **Revert package.json changes** (remove groq-sdk if not used elsewhere)

4. **Remove GROQ_API_KEY from .env**

The rest of your application remains unaffected.

---

## Support for Existing Feedback Schema Variations

### If Your Schema Uses Different Field Names

**Update feedbackRepository.js:**

```javascript
// If your schema uses 'companyName' instead of 'company'
const feedbackEntries = await Feedback.find(
  { companyName: { $regex: new RegExp(`^${companyName}$`, 'i') } }
);

// If rounds are named 'interviewRounds'
// Map fields in the analyzer services
```

**Or create a projection:**

```javascript
const feedbackEntries = await Feedback.aggregate([
  { $match: { companyName: companyName } },
  {
    $project: {
      company: '$companyName',  // Map to expected field
      role: 1,
      rounds: '$interviewRounds',
      overallExperience: '$feedback',
      rating: '$experienceRating',
      tipsForJuniors: '$adviceForJuniors'
    }
  }
]);
```

---

## Summary

**Recommended Approach:** Module Integration (Option 1)

**Steps:**
1. Copy services, controllers, routes to `src/modules/summarizer/`
2. Register routes in main app
3. Share MongoDB connection
4. Apply existing auth middleware
5. Add `GROQ_API_KEY` to `.env`
6. Test with authenticated requests

**Time to integrate:** 15-30 minutes

**Risk level:** Low (isolated module, easy rollback)
