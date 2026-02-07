# React Frontend Integration Guide
## Consuming Placement Feedback Reports

---

## Overview

This guide shows how to integrate the report generation API into your React admin dashboard.

**Prerequisites:**
- React 17+ or 18+
- Axios or Fetch API
- Authenticated user context
- Admin/Coordinator role access

---

## API Integration Hook

### Custom Hook for Report Generation

```javascript
// src/hooks/useReportGenerator.js

import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const generateReport = async (companyName, options = {}) => {
    const { useAI = true, format = 'json' } = options;
    
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/reports/generate`,
        {
          companyName,
          format,
          useAI
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 second timeout for AI processing
        }
      );

      setReport(response.data.data);
      return response.data.data;

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to generate report';
      setError(errorMessage);
      console.error('Report generation error:', err);
      throw err;

    } finally {
      setLoading(false);
    }
  };

  const downloadTextReport = async (companyName) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/reports/generate`,
        {
          companyName,
          format: 'text',
          useAI: true
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'text'
        }
      );

      // Create download link
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${companyName.replace(/\s+/g, '_')}_Feedback_Report.txt`;
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Download error:', err);
      throw err;
    }
  };

  return {
    generateReport,
    downloadTextReport,
    loading,
    error,
    report
  };
};
```

---

## Company List Hook

```javascript
// src/hooks/useCompanyList.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/companies`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setCompanies(response.data.data);
      setLoading(false);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch companies');
      setLoading(false);
      console.error('Company fetch error:', err);
    }
  };

  return { companies, loading, error, refreshCompanies: fetchCompanies };
};
```

---

## Report Generator Component

```jsx
// src/components/ReportGenerator.jsx

import React, { useState } from 'react';
import { useReportGenerator } from '../hooks/useReportGenerator';
import { useCompanyList } from '../hooks/useCompanyList';
import ReportDisplay from './ReportDisplay';

const ReportGenerator = () => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const { companies, loading: loadingCompanies } = useCompanyList();
  const { generateReport, downloadTextReport, loading, error, report } = useReportGenerator();

  const handleGenerate = async () => {
    if (!selectedCompany) {
      alert('Please select a company');
      return;
    }

    try {
      await generateReport(selectedCompany);
    } catch (err) {
      // Error already handled by hook
    }
  };

  const handleDownload = async () => {
    if (!selectedCompany) {
      alert('Please select a company');
      return;
    }

    try {
      await downloadTextReport(selectedCompany);
    } catch (err) {
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="report-generator">
      <div className="header">
        <h2>Generate Placement Feedback Report</h2>
        <p className="subtitle">
          Generate comprehensive feedback summaries for placement coordinators and faculty review
        </p>
      </div>

      <div className="controls">
        <div className="form-group">
          <label htmlFor="company-select">Select Company</label>
          <select
            id="company-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            disabled={loadingCompanies}
            className="company-select"
          >
            <option value="">-- Select a company --</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        <div className="action-buttons">
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedCompany}
            className="btn btn-primary"
          >
            {loading ? 'Generating Report...' : 'Generate Report'}
          </button>

          <button
            onClick={handleDownload}
            disabled={loading || !selectedCompany}
            className="btn btn-secondary"
          >
            Download as Text
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
      </div>

      {report && !loading && (
        <ReportDisplay report={report} companyName={selectedCompany} />
      )}
    </div>
  );
};

export default ReportGenerator;
```

---

## Report Display Component

```jsx
// src/components/ReportDisplay.jsx

import React from 'react';

const ReportDisplay = ({ report, companyName }) => {
  const { title, generatedDate, sections } = report;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-display">
      <div className="report-header">
        <h3>{title}</h3>
        <p className="generated-date">Generated: {generatedDate}</p>
        <button onClick={handlePrint} className="btn btn-print">
          Print / Export to PDF
        </button>
      </div>

      <div className="report-content">
        {/* Section 1: Overview */}
        <section className="report-section">
          <h4 className="section-heading">1. Overview</h4>
          <p className="section-content">{sections.overview}</p>
        </section>

        {/* Section 2: Interview Process Insights */}
        <section className="report-section">
          <h4 className="section-heading">2. Interview Process Insights</h4>
          <div className="section-content" style={{ whiteSpace: 'pre-line' }}>
            {sections.interviewProcessInsights}
          </div>
        </section>

        {/* Section 3: Positive Observations */}
        <section className="report-section">
          <h4 className="section-heading">3. Positive Observations</h4>
          {sections.positiveObservations.length > 0 ? (
            <ul className="section-list">
              {sections.positiveObservations.map((obs, index) => (
                <li key={index}>{obs}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No specific positive observations reported</p>
          )}
        </section>

        {/* Section 4: Challenges and Areas for Improvement */}
        <section className="report-section">
          <h4 className="section-heading">4. Challenges and Areas for Improvement</h4>
          {sections.challengesAndImprovements.length > 0 ? (
            <ul className="section-list">
              {sections.challengesAndImprovements.map((challenge, index) => (
                <li key={index}>{challenge}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No specific challenges reported</p>
          )}
        </section>

        {/* Section 5: Preparation Insights */}
        <section className="report-section">
          <h4 className="section-heading">
            5. Preparation Insights for Future Candidates
          </h4>
          {sections.preparationInsights.length > 0 ? (
            <ul className="section-list">
              {sections.preparationInsights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No preparation insights available</p>
          )}
        </section>

        {/* Section 6: Conclusion */}
        <section className="report-section">
          <h4 className="section-heading">6. Conclusion</h4>
          <p className="section-content">{sections.conclusion}</p>
        </section>
      </div>
    </div>
  );
};

export default ReportDisplay;
```

---

## Styling (CSS)

```css
/* src/styles/ReportGenerator.css */

.report-generator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  margin-bottom: 32px;
}

.header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.controls {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.company-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn {
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #0066cc;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0052a3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-print {
  background: #28a745;
  color: white;
  margin-left: auto;
}

.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fee;
  border-left: 4px solid #d00;
  color: #c00;
  border-radius: 4px;
}

.error-icon {
  margin-right: 8px;
}

.report-display {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.report-header {
  background: #f8f9fa;
  padding: 24px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 16px;
}

.report-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  flex: 1;
}

.generated-date {
  color: #666;
  font-size: 14px;
}

.report-content {
  padding: 32px;
}

.report-section {
  margin-bottom: 32px;
}

.section-heading {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #0066cc;
}

.section-content {
  line-height: 1.7;
  color: #333;
  text-align: justify;
}

.section-list {
  list-style: disc;
  padding-left: 24px;
}

.section-list li {
  margin-bottom: 8px;
  line-height: 1.6;
  color: #333;
}

.no-data {
  color: #999;
  font-style: italic;
}

/* Print Styles */
@media print {
  .controls,
  .btn-print,
  .action-buttons {
    display: none;
  }

  .report-display {
    border: none;
    box-shadow: none;
  }

  .report-content {
    padding: 0;
  }
}
```

---

## Router Integration

```jsx
// src/App.jsx or src/routes.jsx

import { Routes, Route } from 'react-router-dom';
import ReportGenerator from './components/ReportGenerator';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* ... other routes ... */}
      
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRole="coordinator">
            <ReportGenerator />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

---

## Environment Configuration

```env
# .env.local or .env.production

REACT_APP_API_URL=http://localhost:5000
# REACT_APP_API_URL=https://api.placement-portal.kec.edu.in
```

---

## Error Handling Best Practices

```jsx
// Enhanced error handling

const handleGenerateWithToast = async () => {
  try {
    await generateReport(selectedCompany);
    toast.success('Report generated successfully!');
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      // Redirect to login
      navigate('/login');
    } else if (err.response?.status === 403) {
      toast.error('You do not have permission to generate reports.');
    } else if (err.response?.status === 500) {
      toast.error('Report generation failed. Please try again or contact support.');
    } else {
      toast.error('An unexpected error occurred.');
    }
  }
};
```

---

## Loading States

```jsx
// Better loading experience

{loading && (
  <div className="loading-overlay">
    <div className="spinner"></div>
    <p>Generating report using advanced analysis...</p>
    <small>This may take 5-10 seconds</small>
  </div>
)}
```

---

## Summary

**Key Points:**
- Use custom hooks for API integration
- Handle authentication with JWT tokens
- Display structured report with proper formatting
- Support print/PDF export
- Implement proper error handling
- Show loading states for AI processing
- Protect routes with role-based access

**Integration Time:** 1-2 hours

**Components to create:**
1. `useReportGenerator` hook
2. `useCompanyList` hook
3. `ReportGenerator` component
4. `ReportDisplay` component
5. Styling and print CSS
