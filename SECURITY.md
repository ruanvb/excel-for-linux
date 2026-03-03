# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

Only the latest release receives security updates. Users should upgrade to the latest version to benefit from fixes.

## Reporting a Vulnerability

If you discover a security vulnerability in Excel for Linux, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities.
2. Instead, use [GitHub's private vulnerability reporting](https://github.com/your-username/excel-for-linux/security/advisories/new) to submit details confidentially.
3. Include a description of the vulnerability, steps to reproduce, and any potential impact.
4. You can expect an initial response within 7 days.
5. We will work with you to understand the issue and coordinate a fix and disclosure timeline.

## Security Architecture

The application implements the following security controls:

- **IPC validation** — all IPC channels are validated via an allowlist in `app/security/ipcValidator.js`
- **Context isolation** — Electron context isolation is enabled
- **PII log sanitization** — sensitive data is stripped from logs
- **Input validation** — IPC message payloads are validated before processing
