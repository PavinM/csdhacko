# Integration Guide for KEC Placement Feedback Summarizer

## Quick Integration Steps

### For Existing Node.js Backend

Add this to your existing placement portal backend:

```javascript
// In your admin routes file (e.g., routes/admin.js)
import axios from 'axios';

// Endpoint to generate placement report
router.post('/placement-reports/generate', async (req, res) => {
  const { companyName } = req.body;

  try {
    // Call the summarizer service
    const response = await axios.post('http://localhost:3000/api/reports/generate', {
      companyName,
      format: 'json'
    });

    const report = response.data.data;
    
    // Return to frontend for display or PDF generation
    res.json({
      success: true,
      report
    });
    
  } catch (error) {
    console.error('Report generation failed:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Unable to generate report. Please try again later.' 
    });
  }
});

// Endpoint to list companies with feedback
router.get('/placement-reports/companies', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3000/api/reports/companies');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch companies' });
  }
});
```

### For React Admin Dashboard

Add this component to your admin dashboard:

```jsx
// components/ReportGenerator.jsx
import { useState } from 'react';
import axios from 'axios';

export default function ReportGenerator() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available companies
    axios.get('/api/admin/placement-reports/companies')
      .then(res => setCompanies(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedCompany) {
      alert('Please select a company');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/admin/placement-reports/generate', {
        companyName: selectedCompany
      });
      
      setReport(response.data.report);
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-generator">
      <h2>Generate Placement Feedback Report</h2>
      
      <select 
        value={selectedCompany} 
        onChange={e => setSelectedCompany(e.target.value)}
      >
        <option value="">Select Company</option>
        {companies.map(company => (
          <option key={company} value={company}>{company}</option>
        ))}
      </select>

      <button onClick={handleGenerateReport} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Report'}
      </button>

      {report && (
        <div className="report-display">
          <h3>{report.title}</h3>
          <p><em>Generated: {report.generatedDate}</em></p>
          
          <section>
            <h4>1. Overview</h4>
            <p>{report.sections.overview}</p>
          </section>

          <section>
            <h4>2. Interview Process Insights</h4>
            <p>{report.sections.interviewProcessInsights}</p>
          </section>

          <section>
            <h4>3. Positive Observations</h4>
            <ul>
              {report.sections.positiveObservations.map((obs, idx) => (
                <li key={idx}>{obs}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4>4. Challenges and Areas for Improvement</h4>
            <ul>
              {report.sections.challengesAndImprovements.map((challenge, idx) => (
                <li key={idx}>{challenge}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4>5. Preparation Insights for Future Candidates</h4>
            <ul>
              {report.sections.preparationInsights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4>6. Conclusion</h4>
            <p>{report.sections.conclusion}</p>
          </section>

          <button onClick={() => exportToPDF(report)}>
            Export to PDF
          </button>
        </div>
      )}
    </div>
  );
}

function exportToPDF(report) {
  // Use a library like jsPDF or react-pdf
  // Or make an API call to backend PDF generation service
  window.print(); // Simple option
}
```

## Deployment Notes

1. **Development**: Run both services locally on different ports
   - Main portal: `http://localhost:5000`
   - Summarizer: `http://localhost:3000`

2. **Production**: Deploy as microservice
   - Use internal network calls
   - Or deploy on same server and import services directly

3. **Security**: Add authentication middleware to protect endpoints

## Testing the Integration

```bash
# 1. Start the summarizer service
cd d:\summarizer
npm start

# 2. Test from your main backend
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"companyName": "TechCorp Solutions"}'

# 3. Verify response format matches your frontend expectations
```

## Environment Variables for Production

In your main application's `.env`:

```env
SUMMARIZER_SERVICE_URL=http://localhost:3000
# Or for production:
# SUMMARIZER_SERVICE_URL=http://internal-summarizer-service:3000
```

Then use:

```javascript
const SUMMARIZER_URL = process.env.SUMMARIZER_SERVICE_URL;
axios.post(`${SUMMARIZER_URL}/api/reports/generate`, { companyName });
```
