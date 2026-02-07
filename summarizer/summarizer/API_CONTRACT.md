# API Contract Specification
## KEC Placement Feedback Summarizer

**Version:** 1.0  
**Base URL:** `http://localhost:3000` (development) or your production URL  
**Authentication:** Required in production (JWT recommended)

---

## Endpoint: Generate Report

### Request

**Method:** `POST`  
**Path:** `/api/reports/generate`  
**Content-Type:** `application/json`

**Request Body:**

```json
{
  "companyName": "string",   // REQUIRED
  "format": "string",        // OPTIONAL: "json" (default) | "text"
  "useAI": boolean           // OPTIONAL: true (default) | false
}
```

**Field Specifications:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `companyName` | string | **Yes** | - | Exact or case-insensitive company name from feedback database |
| `format` | string | No | `"json"` | Response format: `"json"` for structured data, `"text"` for plain text PDF-ready output |
| `useAI` | boolean | No | `true` | Use AI-powered analysis. Falls back to rule-based if Groq API unavailable |

**Validation Rules:**
- `companyName` must be non-empty string
- `companyName` trimmed automatically
- Case-insensitive company matching
- Invalid format defaults to `"json"`

---

### Response (Success)

**Status Code:** `200 OK`  
**Content-Type:** `application/json` (when `format: "json"`)

**Response Body:**

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
        "Professional conduct maintained throughout",
        "Supportive and approachable interviewers"
      ],
      "challengesAndImprovements": [
        "Time management during coding rounds",
        "Complexity of technical questions",
        "Adequate preparation required for problem-solving"
      ],
      "preparationInsights": [
        "Regular practice of coding problems on competitive platforms",
        "Strong foundation in data structures and algorithms",
        "Thorough understanding of projects mentioned in resume",
        "Clear communication and explanation of technical concepts"
      ],
      "conclusion": "The feedback collected from 15 students indicates a moderately positive experience..."
    },
    "aiGenerated": true
  },
  "metadata": {
    "feedbackCount": 15,
    "generatedAt": "2026-02-07T01:25:30.000Z",
    "aiPowered": true
  }
}
```

**Field Descriptions:**

| Field Path | Type | Description |
|------------|------|-------------|
| `success` | boolean | Always `true` on successful generation |
| `data.title` | string | Formatted report title with company name |
| `data.generatedDate` | string | Human-readable date in "DD Month YYYY" format |
| `data.sections.overview` | string | Paragraph summarizing overall experience |
| `data.sections.interviewProcessInsights` | string | Paragraph(s) describing interview structure and trends |
| `data.sections.positiveObservations` | string[] | Array of positive aspects (bullet points) |
| `data.sections.challengesAndImprovements` | string[] | Array of challenges (bullet points) |
| `data.sections.preparationInsights` | string[] | Array of actionable preparation tips (bullet points) |
| `data.sections.conclusion` | string | Formal closing paragraph |
| `data.aiGenerated` | boolean | `true` if AI was used, `false` if rule-based |
| `metadata.feedbackCount` | number | Total feedback entries analyzed |
| `metadata.generatedAt` | string | ISO 8601 timestamp of generation |
| `metadata.aiPowered` | boolean | Confirms AI mode was active |

---

### Response (Plain Text)

**Status Code:** `200 OK`  
**Content-Type:** `text/plain` (when `format: "text"`)

**Response Body:**

```
Placement Drive Feedback Summary Report – TechCorp Solutions
Generated: 7 February 2026
================================================================

1. Overview
This report summarizes student experiences from 15 feedback entries submitted following the TechCorp Solutions campus placement drive. The overall student experience was moderately positive. The recruitment process typically consisted of Aptitude, Coding, Technical, and HR rounds, conducted in a hybrid format (65% online, 35% offline). Students reported diverse experiences across technical assessments, problem-solving exercises, and behavioral evaluations.

2. Interview Process Insights
The recruitment process commonly included the following rounds: Aptitude (15 instances), Coding (15 instances), Technical (15 instances), and HR (12 instances). 

Difficulty Assessment: Aptitude rounds were reported as Easy to Moderate. Coding rounds were reported as Moderate to Difficult. Technical rounds were reported as Moderate.

Interview Mode: 30 rounds conducted online and 12 rounds conducted offline.

3. Positive Observations
• Well-organized interview process
• Professional conduct maintained throughout
• Supportive and approachable interviewers

4. Challenges and Areas for Improvement
• Time management during coding and technical rounds
• Complexity of technical questions
• Adequate preparation required for problem-solving

5. Preparation Insights for Future Candidates
• Regular practice of coding problems on competitive platforms
• Strong foundation in data structures and algorithms
• Thorough understanding of projects mentioned in resume
• Clear communication and explanation of technical concepts

6. Conclusion
The feedback collected from 15 students indicates a moderately positive experience with the TechCorp Solutions placement drive. The insights gathered will assist future candidates in their preparation and enable the Placement Cell to maintain effective coordination with recruiting organizations. This report serves as an institutional record for faculty review and continuous improvement of placement support services.
```

---

### Response (Error)

**Status Code:** `400 Bad Request` (validation error)  
**Status Code:** `500 Internal Server Error` (processing error)

**Response Body:**

```json
{
  "success": false,
  "error": "Company name is required and must be a non-empty string"
}
```

**Error Messages:**

| Status | Error Message | Cause |
|--------|---------------|-------|
| 400 | `"Company name is required and must be a non-empty string"` | Missing or empty `companyName` |
| 500 | `"An error occurred while generating the report. Please contact the Placement Cell administrator."` | Database error, AI API error, or unexpected failure |

---

## Endpoint: List Companies

### Request

**Method:** `GET`  
**Path:** `/api/reports/companies`  
**Authentication:** Required in production

### Response

**Status Code:** `200 OK`

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

## Endpoint: Feedback Count

### Request

**Method:** `GET`  
**Path:** `/api/reports/companies/:companyName/count`  
**Parameter:** `companyName` (URL parameter)

### Response

**Status Code:** `200 OK`

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

## Endpoint: Health Check

### Request

**Method:** `GET`  
**Path:** `/health`

### Response

**Status Code:** `200 OK`

```json
{
  "status": "operational",
  "service": "KEC Placement Feedback Summarizer",
  "timestamp": "2026-02-07T01:25:30.000Z"
}
```

---

## Expected MongoDB Schema

### Mandatory Fields

```javascript
{
  company: String,      // REQUIRED - Company name for filtering
  createdAt: Date       // REQUIRED - Timestamp for sorting
}
```

### Optional Fields (Used if Present)

```javascript
{
  role: String,                    // Job role/position
  rounds: [                        // Interview rounds array
    {
      type: String,                // Round type (Aptitude, Coding, etc.)
      difficulty: String,          // Easy, Moderate, Difficult
      mode: String,                // Online, Offline
      questions: String,           // Questions asked
      resources: String            // Preparation resources
    }
  ],
  overallExperience: String,       // Overall feedback text
  rating: Number,                  // 1-5 rating
  tipsForJuniors: String          // Advice for future candidates
}
```

### Fields Automatically Excluded

These fields are **never** sent to AI or included in reports:

- `studentName`
- `rollNumber`
- `email`
- `studentId`
- `_id` (MongoDB ID)
- `__v` (Mongoose version)

**Note:** If your schema uses different field names, the analyzer will still work but with reduced quality. For best results, align field names with the expected schema above.

---

## Rate Limiting Recommendations

**Production Settings:**

- **Per User:** 10 requests per minute
- **Per IP:** 20 requests per minute
- **Report Generation:** Max 100 reports per day per user

**Implementation:**

```javascript
import rateLimit from 'express-rate-limit';

const reportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { 
    success: false, 
    error: 'Too many report requests. Please try again later.' 
  }
});

app.post('/api/reports/generate', reportLimiter, reportController.generateReport);
```

---

## Authentication Contract

**Required:** JWT token in `Authorization` header

**Expected Format:**

```
Authorization: Bearer <jwt_token>
```

**Required Claims:**

```json
{
  "userId": "string",
  "role": "coordinator" | "admin",
  "email": "string"
}
```

**Middleware Example:**

```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'coordinator' && decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

// Apply to routes
router.post('/generate', authMiddleware, reportController.generateReport);
```

---

## CORS Configuration

**Development:**

```javascript
app.use(cors()); // Allow all origins
```

**Production:**

```javascript
app.use(cors({
  origin: 'https://placement-portal.kec.edu.in',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Integration Testing

**Test Request:**

```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "companyName": "TechCorp Solutions",
    "format": "json",
    "useAI": true
  }'
```

**Expected Response Time:**
- AI Mode: 2-5 seconds
- Rule-based Mode: <1 second

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-07 | Initial API contract with AI support |
