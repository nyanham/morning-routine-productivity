# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### DO NOT

- Do not open a public GitHub issue for security vulnerabilities
- Do not disclose the vulnerability publicly until it has been addressed

### DO

1. **Email us directly** at [rafaeljkey@gmail.com] with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

2. **Use GitHub Security Advisories** (preferred):
   - Go to the Security tab of this repository
   - Click "Report a vulnerability"
   - Fill out the form with details

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: Next release

### After Reporting

- We will investigate and validate the report
- We will work on a fix and coordinate disclosure
- You will be credited (unless you prefer anonymity)
- A security advisory will be published after the fix

## Security Best Practices for Users

### Environment Variables

- Never commit `.env` files
- Use strong, unique values for all secrets
- Rotate credentials periodically

### Supabase Security

- Enable Row Level Security (RLS) on all tables
- Use the anon key only for client-side operations
- Keep the service key server-side only

### Authentication

- Enforce strong passwords
- Consider enabling MFA in Supabase
- Set appropriate session timeouts

## Dependencies

We use automated tools to monitor dependencies:

- Dependabot for version updates
- GitHub Security Alerts for vulnerabilities
- Trivy for security scanning in CI

## Contact

For security-related questions, contact: [rafaeljkey@gmail.com]
