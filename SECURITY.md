# Security Policy

## Supported versions

This project is maintained continuously on `main`. Only the latest version on
`main` receives security patches.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| others  | :x:                |

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.
Instead, report them privately so they can be addressed before disclosure.

To report a vulnerability:

1. **Do not** create a public issue.
2. Email the maintainer, or open a **private security advisory** on GitHub
   (Repository -> Security -> Advisories -> *New advisory*).

Please include:

- A description of the vulnerability and its impact.
- Steps to reproduce, if possible.
- Affected versions.

You should receive a response within a reasonable time. Once the issue is
confirmed and fixed, we will coordinate disclosure.

## Safe handling of secrets in this repo

- Firebase `apiKey`, `appId`, `projectId`, and `authDomain` values shown in
  config files are **client-side configuration** (public by design) and are
  safe to commit. Security is enforced by **Firestore security rules**, never
  by the client config.
- Real **API keys** (Gemini, OpenRouter, Paynow integration keys, EmailJS keys,
  Firebase service-account JSON) **must never** be committed. Use environment
  variables and `.env.local` (gitignored), or CI/CD secrets.

## Reporting exposed keys

If you believe a real secret has been committed, rotate it immediately and
report it per the process above.
