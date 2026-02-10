# Security Considerations for xlsx Package

## Vulnerability Notice
The `xlsx` package (v0.18.5) has a known Prototype Pollution vulnerability (CVSS 7.5). 
A fix exists in v0.19.3+ but is not available on npm.

## Current Usage
This package is used for:
- Admin bulk student upload (AdminDashboard.jsx)
- Coordinator feedback import (CoordinatorFeedback.jsx)

## Mitigation
- File uploads restricted to authenticated admin/coordinator users only
- Files processed client-side
- No untrusted file sources

## Future Action
Consider migrating to ExcelJS or monitoring for official npm release of xlsx v0.19.3+

For more details, see the security documentation in the project repository.
