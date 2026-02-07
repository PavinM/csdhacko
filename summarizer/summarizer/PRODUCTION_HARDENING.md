# Production Hardening Checklist
## Deployment Security and Performance Optimization

---

##  Security Hardening

### Authentication & Authorization

- [ ] **JWT Authentication Applied**
  ```javascript
  // All report endpoints protected
  router.post('/generate', authMiddleware, reportController.generateReport);
  router.get('/companies', authMiddleware, reportController.listCompanies);
  ```

- [ ] **Role-Based Access Control**
  ```javascript
  // Only coordinators and admins can generate reports
  router.use(requireRole(['coordinator', 'admin']));
  ```

- [ ] **Token Expiration Configured**
  ```javascript
  // JWT tokens expire in reasonable timeframe (1-24 hours)
  const token = jwt.sign(payload, secret, { expiresIn: '2h' });
  ```

- [ ] **CORS Restricted to Production Domain**
  ```javascript
  app.use(cors({
    origin: 'https://placement-portal.kec.edu.in',
    credentials: true
  }));
  ```

### Rate Limiting

- [ ] **Request Rate Limits Applied**
  ```javascript
  import rateLimit from 'express-rate-limit';

  const reportLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10, // 10 requests per minute
    message: { 
      success: false, 
      error: 'Too many requests. Please try again later.' 
    }
  });

  router.post('/generate', reportLimiter, reportController.generateReport);
  ```

- [ ] **IP-Based Rate Limiting** (if needed for public endpoints)

### Environment Security

- [ ] **Environment Variables Secured**
  - Groq API key in `.env` (not committed to Git)
  - MongoDB URI with credentials
  - JWT secret strong and unique

- [ ] **Sensitive Data Not Logged**
  ```javascript
  // Never log:
  // - API keys
  // - User passwords
  // - JWT tokens
  // - Student personal information
  ```

- [ ] **Personal Data Excluded from AI Requests**
  - Verified in `feedbackRepository.js`
  - Projection excludes: `studentName`, `rollNumber`, `email`, `studentId`

---

## Performance Optimization

### Database Indexing

- [ ] **Create MongoDB Indexes**
  ```javascript
  // Run in MongoDB shell or migration script
  db.feedbacks.createIndex({ company: 1 });
  db.feedbacks.createIndex({ createdAt: -1 });
  db.feedbacks.createIndex({ company: 1, createdAt: -1 });
  ```

- [ ] **Verify Index Usage**
  ```javascript
  db.feedbacks.find({ company: "TechCorp" }).explain("executionStats");
  // Should show indexUsed: true
  ```

### API Response Time

- [ ] **Set Appropriate Timeouts**
  ```javascript
  // In axios requests from frontend
  timeout: 15000  // 15 seconds for AI processing
  ```

- [ ] **Monitor API Response Times**
  - AI mode: 2-5 seconds expected
  - Rule-based: < 1 second expected

### Caching (Optional)

- [ ] **Consider Response Caching**
  ```javascript
  // Cache reports for 1 hour
  import NodeCache from 'node-cache';
  const reportCache = new NodeCache({ stdTTL: 3600 });

  // In controller
  const cacheKey = `report:${companyName}`;
  const cached = reportCache.get(cacheKey);
  if (cached) return cached;

  // ... generate report ...
  reportCache.set(cacheKey, report);
  ```

---

## Error Handling

### Logging & Monitoring

- [ ] **Structured Error Logging**
  ```javascript
  import winston from 'winston';

  logger.error('Report generation failed', {
    userId: req.user.id,
    companyName,
    error: error.message,
    stack: error.stack
  });
  ```

- [ ] **Error Tracking Service Integration** (optional)
  ```javascript
  // Sentry, LogRocket, or similar
  Sentry.captureException(error, {
    tags: { service: 'placement-summarizer' },
    user: { id: req.user.id }
  });
  ```

### Graceful Degradation

- [ ] **AI Fallback Tested**
  - Verify rule-based mode activates when Groq API fails
  - Test with invalid API key
  - Test with network timeout

- [ ] **Database Connection Handling**
  ```javascript
  // Retry logic for transient failures
  mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });
  ```

### User-Friendly Error Messages

- [ ] **No Internal Details Exposed**
  ```javascript
  // DON'T return stack traces to users
  // DO return generic, helpful messages
  res.status(500).json({
    success: false,
    error: 'Report generation temporarily unavailable. Please contact support.'
  });
  ```

---

## API Contract Validation

### Input Validation

- [ ] **Request Body Validation**
  ```javascript
  import { body, validationResult } from 'express-validator';

  router.post('/generate', [
    body('companyName')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Company name is required'),
    body('format')
      .optional()
      .isIn(['json', 'text'])
      .withMessage('Format must be json or text'),
    body('useAI')
      .optional()
      .isBoolean()
      .withMessage('useAI must be boolean')
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }, reportController.generateReport);
  ```

### Response Validation

- [ ] **Consistent Response Structure**
  - All responses have `success` field
  - Error responses have `error` field
  - Success responses have `data` and `metadata` fields

---

## Monitoring & Alerts

### Health Checks

- [ ] **Health Endpoint Monitored**
  ```bash
  # Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
  GET https://api.placement-portal.kec.edu.in/health
  ```

- [ ] **Database Health Check**
  ```javascript
  app.get('/health/db', async (req, res) => {
    try {
      await mongoose.connection.db.admin().ping();
      res.json({ status: 'healthy', database: 'connected' });
    } catch (error) {
      res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
    }
  });
  ```

### Performance Metrics

- [ ] **Track Key Metrics**
  - Report generation success rate
  - Average response time
  - AI vs rule-based mode usage
  - Error rate by endpoint

- [ ] **Set Up Alerts**
  - Alert if error rate > 5%
  - Alert if avg response time > 10 seconds
  - Alert if Groq API key exhausted/invalid

---

## Data Privacy Compliance

### Personal Data Protection

- [ ] **Verify No PII in Reports**
  - Test generated reports for student names
  - Verify roll numbers not present
  - Check emails excluded

- [ ] **Audit Logs** (optional)
  ```javascript
  // Log who generated which report
  auditLog.create({
    action: 'report_generated',
    userId: req.user.id,
    companyName,
    timestamp: new Date()
  });
  ```

### GDPR/Data Protection (if applicable)

- [ ] **Data Retention Policy**
  - Define how long reports are stored
  - Implement automatic cleanup of old reports

- [ ] **User Consent** (if storing reports)
  - Ensure students consented to feedback analysis
  - Provide mechanism to request data deletion

---

## Deployment Checklist

### Pre-Deployment

- [ ] **Environment Variables Set**
  ```env
  NODE_ENV=production
  MONGODB_URI=<production_connection_string>
  GROQ_API_KEY=<production_api_key>
  JWT_SECRET=<strong_secret>
  PORT=3000
  ```

- [ ] **Dependencies Updated**
  ```bash
  npm audit fix
  npm outdated
  ```

- [ ] **SSL/TLS Enabled**
  - HTTPS enforced on all endpoints
  - SSL certificates valid and up-to-date

### Post-Deployment

- [ ] **Smoke Tests Passed**
  ```bash
  # Test health endpoint
  curl https://api.placement-portal.kec.edu.in/health

  # Test authentication
  curl https://api.placement-portal.kec.edu.in/api/reports/companies \
    -H "Authorization: Bearer <token>"

  # Test report generation
  curl -X POST https://api.placement-portal.kec.edu.in/api/reports/generate \
    -H "Authorization: Bearer <token>" \
    -d '{"companyName":"TestCompany"}'
  ```

- [ ] **Performance Baseline Established**
  - Measure initial response times
  - Set benchmarks for future monitoring

- [ ] **Backup Strategy Implemented**
  - MongoDB backups scheduled
  - Environment configuration backed up

---

## Groq API Management

### API Key Security

- [ ] **API Key Rotation Plan**
  - Document process for rotating Groq API key
  - Test key rotation without downtime

- [ ] **Usage Monitoring**
  - Monitor Groq API usage/limits
  - Set up billing alerts (if applicable)

### Fallback Strategy

- [ ] **Test Fallback Behavior**
  - Remove API key temporarily
  - Verify rule-based mode activates
  - Confirm acceptable report quality

- [ ] **Document Fallback Conditions**
  - When AI fails → rule-based
  - When database unavailable → cached reports (if implemented)

---

## Documentation

- [ ] **API Documentation Published**
  - Update team wiki with endpoint details
  - Share API contract with frontend team

- [ ] **Runbook Created**
  - How to restart service
  - How to check logs
  - Common troubleshooting steps

- [ ] **Escalation Path Defined**
  - Who to contact for Groq API issues
  - Who to contact for database issues
  - Support contact for end users

---

## Testing Checklist

### Integration Tests

- [ ] **End-to-End Test with Real Data**
  - Generate report for actual company
  - Verify all sections populated
  - Check report quality meets standards

- [ ] **Error Scenarios Tested**
  - Invalid company name
  - Missing authentication token
  - Expired JWT token
  - Database connection failure
  - Groq API timeout

### Load Testing

- [ ] **Concurrent Request Handling**
  ```bash
  # Use Apache Bench or similar
  ab -n 100 -c 10 -H "Authorization: Bearer <token>" \
    -p request.json \
    https://api.placement-portal.kec.edu.in/api/reports/generate
  ```

- [ ] **Rate Limiter Verification**
  - Confirm 429 status after limit exceeded
  - Verify proper cooldown period

---

## Compliance & Approval

### Institutional

- [ ] **Faculty Review Completed**
  - Sample reports reviewed by placement coordinators
  - Report format approved for institutional use

- [ ] **IT Security Review** (if required)
  - Security team approves deployment
  - Penetration testing completed (if applicable)

### Legal

- [ ] **Terms of Service Updated** (if applicable)
  - Students informed about feedback analysis
  - Privacy policy reflects new feature

---

## Production Readiness Score

**Calculate your readiness:**

- Security items: ___ / 9
- Performance items: ___ / 6
- Error handling items: ___ / 8
- Monitoring items: ___ / 5
- Data privacy items: ___ / 4
- Deployment items: ___ / 8
- Testing items: ___ / 5

**Total: ___ / 45**

**Minimum for production:** 40/45 (89%)

---

## Emergency Rollback Plan

### Quick Disable

```javascript
// Add feature flag to quickly disable
const SUMMARIZER_ENABLED = process.env.FEATURE_SUMMARIZER === 'true';

router.post('/generate', (req, res, next) => {
  if (!SUMMARIZER_ENABLED) {
    return res.status(503).json({
      success: false,
      error: 'Report generation temporarily disabled for maintenance'
    });
  }
  next();
}, reportController.generateReport);
```

### Rollback Steps

1. Set `FEATURE_SUMMARIZER=false` in environment
2. Restart service
3. Verify endpoints return maintenance message
4. Investigate and fix issues
5. Re-enable when ready

---

## Support Resources

- **Groq API Documentation:** https://console.groq.com/docs
- **MongoDB Performance:** https://docs.mongodb.com/manual/administration/production-notes/
- **Express.js Security:** https://expressjs.com/en/advanced/best-practice-security.html
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725

---

## Final Checklist Before Go-Live

- [ ] All security items completed
- [ ] Performance optimizations applied
- [ ] Error handling tested
- [ ] Monitoring set up
- [ ] Documentation complete
- [ ] Team trained on new feature
- [ ] Rollback plan documented and tested
- [ ] Go-live announcement prepared

**Sign-off:**

- [ ] Technical Lead: ________________
- [ ] Placement Coordinator: ________________
- [ ] IT Security (if required): ________________

**Production deployment approved:** YES / NO

**Deployment date:** ______________
