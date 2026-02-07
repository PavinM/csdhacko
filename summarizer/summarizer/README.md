# KEC Placement Feedback Summarizer

Backend service for generating formal placement drive feedback summary reports from student interview experiences stored in MongoDB.

## Overview

This standalone Node.js service processes student placement feedback data and generates institutional-grade summary reports suitable for faculty review, coordinator documentation, and PDF export.

### Key Features

- **Company-specific analysis** of placement interview feedback
- **Automated pattern detection** across multiple feedback entries
- **Personal data protection** with automatic identifier removal
- **Formal institutional reporting** in standardized 6-section format
- **REST API** for integration with existing placement portals
- **Plain text export** for PDF generation

---

## Installation

### Prerequisites

- Node.js 18.x or higher
- MongoDB 6.x or higher
- Existing placement feedback data in MongoDB

### Setup Steps

1. **Clone or copy this service** to your server:
   ```bash
   cd d:\summarizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your MongoDB credentials:
   ```env
   PORT=3000
   NODE_ENV=production
   MONGODB_URI=mongodb://localhost:27017/kec_placement_portal
   DB_NAME=kec_placement_portal
   FEEDBACK_COLLECTION=feedbacks
   ```

5. **Start the service**:
   ```bash
   npm start
   ```

---

## MongoDB Schema

The service expects feedback documents with the following structure:

```javascript
{
  company: String,              // Required - Company name
  role: String,                 // Job role
  rounds: [
    {
      type: String,             // e.g., "Aptitude", "Coding", "Technical", "HR"
      difficulty: String,       // e.g., "Easy", "Moderate", "Difficult"
      mode: String,             // e.g., "Online", "Offline"
      questions: String,        // Questions asked in this round
      resources: String         // Preparation resources
    }
  ],
  overallExperience: String,    // Student's overall experience narrative
  rating: Number,               // 1-5 rating
  tipsForJuniors: String,       // Advice for future candidates
  createdAt: Date               // Submission timestamp
}
```

**Note:** Any fields containing personal identifiers (e.g., `studentName`, `rollNumber`, `email`) are automatically excluded during data retrieval.

---

## API Endpoints

### 1. Generate Report

**Endpoint:** `POST /api/reports/generate`

**Description:** Generates a formal placement feedback summary report for a specific company.

**Request Body:**
```json
{
  "companyName": "TechCorp Solutions",
  "format": "json"
}
```

**Parameters:**
- `companyName` (string, required) - Name of the company
- `format` (string, optional) - Response format: `"json"` (default) or `"text"`

**Response (JSON format):**
```json
{
  "success": true,
  "data": {
    "title": "Placement Drive Feedback Summary Report – TechCorp Solutions",
    "generatedDate": "7 February 2026",
    "sections": {
      "overview": "This report summarizes student experiences from 15 feedback entries...",
      "interviewProcessInsights": "The recruitment process commonly included...",
      "positiveObservations": [
        "Well-organized interview process",
        "Professional conduct maintained throughout"
      ],
      "challengesAndImprovements": [
        "Time management during coding rounds",
        "Complexity of technical questions"
      ],
      "preparationInsights": [
        "Regular practice of coding problems on competitive platforms",
        "Strong foundation in data structures and algorithms"
      ],
      "conclusion": "The feedback collected from 15 students indicates..."
    }
  },
  "metadata": {
    "feedbackCount": 15,
    "generatedAt": "2026-02-07T00:51:26.000Z"
  }
}
```

**Response (Plain text format):**
```
Placement Drive Feedback Summary Report – TechCorp Solutions
Generated: 7 February 2026
============================================================

1. Overview
This report summarizes student experiences from 15 feedback entries...

2. Interview Process Insights
The recruitment process commonly included...

3. Positive Observations
• Well-organized interview process
• Professional conduct maintained throughout

[...continues with remaining sections...]
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"companyName": "TechCorp Solutions", "format": "json"}'
```

---

### 2. List Companies

**Endpoint:** `GET /api/reports/companies`

**Description:** Retrieves a list of all companies with feedback entries.

**Response:**
```json
{
  "success": true,
  "data": [
    "Infosys",
    "TCS",
    "TechCorp Solutions",
    "Wipro"
  ],
  "count": 4
}
```

---

### 3. Feedback Count

**Endpoint:** `GET /api/reports/companies/:companyName/count`

**Description:** Gets the count of feedback entries for a specific company.

**Response:**
```json
{
  "success": true,
  "data": {
    "company": "TechCorp Solutions",
    "feedbackCount": 15
  }
}
```

---

### 4. Health Check

**Endpoint:** `GET /health`

**Description:** Service health status check.

**Response:**
```json
{
  "status": "operational",
  "service": "KEC Placement Feedback Summarizer",
  "timestamp": "2026-02-07T00:51:26.000Z"
}
```

---

## Integration with Existing Portal

### Option 1: Direct API Integration

From your existing Node.js/Express backend:

```javascript
import axios from 'axios';

// In your admin/coordinator controller
async function generatePlacementReport(req, res) {
  const { companyName } = req.body;

  try {
    const response = await axios.post('http://localhost:3000/api/reports/generate', {
      companyName,
      format: 'json'
    });

    const report = response.data.data;
    
    // Send to frontend or save to file system
    res.json(report);
    
  } catch (error) {
    console.error('Report generation failed:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}
```

### Option 2: Microservice Architecture

Deploy this service on a separate port/server and call it via internal network requests from your main application.

### Option 3: Module Import (Same Codebase)

If integrating into the same codebase, you can import the services directly:

```javascript
import feedbackRepository from './summarizer/src/services/feedbackRepository.js';
import feedbackAnalyzer from './summarizer/src/services/feedbackAnalyzer.js';
import reportGenerator from './summarizer/src/services/reportGenerator.js';

async function generateReport(companyName) {
  const feedbackData = await feedbackRepository.getFeedbackByCompany(companyName);
  const analysis = feedbackAnalyzer.analyze(feedbackData, companyName);
  const report = reportGenerator.generateReport(analysis);
  return report;
}
```

---

## Report Structure

All generated reports follow this standardized 6-section format:

### 1. Overview
Concise paragraph summarizing overall student experience, recruitment process structure, and interview modes.

### 2. Interview Process Insights
Details on:
- Common interview rounds conducted
- Difficulty trends per round type
- Distribution of online vs. offline modes

### 3. Positive Observations
Bullet-pointed list of strengths and well-received aspects of the placement process.

### 4. Challenges and Areas for Improvement
Bullet-pointed list of commonly reported difficulties and systemic issues.

### 5. Preparation Insights for Future Candidates
Actionable guidance derived from student experiences, including:
- Technical preparation recommendations
- Resource suggestions
- Skill development priorities

### 6. Conclusion
Formal summary suitable for institutional documentation and faculty review.

---

## Sample Data for Testing

Create sample feedback documents in MongoDB:

```javascript
db.feedbacks.insertMany([
  {
    company: "TestCompany",
    role: "Software Engineer",
    rounds: [
      {
        type: "Aptitude",
        difficulty: "Moderate",
        mode: "Online",
        questions: "Quantitative aptitude, logical reasoning, verbal ability",
        resources: "IndiaBix, Prepinsta"
      },
      {
        type: "Coding",
        difficulty: "Difficult",
        mode: "Online",
        questions: "Array manipulation, dynamic programming problem",
        resources: "LeetCode, GeeksforGeeks"
      },
      {
        type: "Technical",
        difficulty: "Moderate",
        mode: "Offline",
        questions: "OOP concepts, DBMS, OS fundamentals, project discussion",
        resources: "Resume projects, GFG interview questions"
      },
      {
        type: "HR",
        difficulty: "Easy",
        mode: "Offline",
        questions: "Strengths, weaknesses, long-term goals",
        resources: "Mock interviews"
      }
    ],
    overallExperience: "The interview process was well-organized and professional. The coding round was challenging but fair. Interviewers were supportive during the technical discussion.",
    rating: 4,
    tipsForJuniors: "Practice DSA regularly on LeetCode. Be thorough with your resume projects. Time management is crucial in coding rounds.",
    createdAt: new Date()
  }
  // Add more similar documents for realistic testing
]);
```

---

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses Node's watch mode for automatic restarts on file changes.

### Project Structure

```
d:/summarizer/
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/
│   │   └── reportController.js  # API request handlers
│   ├── models/
│   │   └── Feedback.js          # Mongoose schema
│   ├── routes/
│   │   └── reportRoutes.js      # Express routes
│   ├── services/
│   │   ├── feedbackRepository.js   # Data access layer
│   │   ├── feedbackAnalyzer.js     # Analysis engine
│   │   └── reportGenerator.js      # Report formatting
│   ├── app.js                   # Express app configuration
│   └── server.js                # Entry point
├── .env.example                 # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## Security Considerations

### Personal Data Protection

The service automatically excludes the following fields from database queries:
- `studentName`
- `rollNumber`
- `email`
- `studentId`

### Authentication (Production Recommendation)

For production deployment, add authentication middleware:

```javascript
// In src/routes/reportRoutes.js
import authMiddleware from '../middleware/auth.js';

router.post('/generate', authMiddleware, reportController.generateReport);
```

### CORS Configuration

The service uses permissive CORS by default. For production, restrict origins:

```javascript
// In src/app.js
app.use(cors({
  origin: 'https://your-placement-portal.edu.in'
}));
```

---

## Troubleshooting

### Connection Errors

**Issue:** `Database connection error: MongoServerError`

**Solution:** Verify MongoDB URI in `.env` file and ensure MongoDB service is running.

### No Feedback Found

**Issue:** Report shows "No student feedback has been submitted"

**Solution:** 
- Verify company name spelling matches database entries
- Check that feedback collection contains documents
- Use `GET /api/reports/companies` to see available companies

### Empty Sections in Report

**Issue:** Report sections are empty or generic

**Solution:** This is normal when feedback count is very low (1-2 entries). Pattern detection requires sufficient data for meaningful insights.

---

## Support

For integration assistance or technical issues, contact the KEC Placement Cell technical team.

---

## License

Internal use only - KEC Placement Cell

## Version

1.0.0 - February 2026
