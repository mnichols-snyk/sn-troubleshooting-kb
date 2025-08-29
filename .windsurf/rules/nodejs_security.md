---
trigger: always_on
description: Node.js specific security best practices, including middleware and common attack mitigations.
globs:
---

# Node.js Security Best Practices

This rule set ensures generated Node.js code is resilient against common web vulnerabilities.

## 1. Security Headers (Helmet)

* **Always** use the `helmet` middleware for Express.js (or similar frameworks) to set various HTTP security headers.
* Configure `Content-Security-Policy`, `X-XSS-Protection`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.
* Example (for Express):
    ```typescript
    import express from 'express';
    import helmet from 'helmet';
    const app = express();
    app.use(helmet());
    ```

## 2. Input Validation and Sanitization

* **Always** validate and sanitize all incoming data (request bodies, query parameters, headers, URL segments) at the API boundary.
* Use robust validation libraries like `Joi`, `Zod`, `class-validator`, or `express-validator`.
* **Never** trust client-side validation alone.
* For HTML output, use libraries like `DOMPurify` to prevent XSS.

## 3. Authentication and Authorization

* **Never** store plain-text passwords. Use strong, adaptive hashing algorithms like `bcrypt`.
* Implement secure session management (e.g., `express-session` with secure cookies, or JWTs with short expiry and proper refresh token handling).
* Ensure all sensitive endpoints require authentication and authorization.
* Implement rate limiting for authentication endpoints to prevent brute-force attacks.

## 4. Rate Limiting and DoS Protection

* Implement API rate limiting using libraries like `express-rate-limit` to prevent abuse and Denial of Service (DoS) attacks.
* Configure appropriate timeouts for HTTP requests and database connections.

## 5. Dependency Vulnerability Scanning

* Regularly run `npm audit` or integrate a vulnerability scanner (e.g., Snyk, Mend) into your CI/CD pipeline.
* Actively address reported vulnerabilities by updating or replacing affected dependencies.

## 6. Prevention of Prototype Pollution

* Be mindful of potential prototype pollution vulnerabilities when merging objects from untrusted sources.
* Prefer `Object.create(null)` for creating pure hash maps.
* Use libraries that are resistant to prototype pollution or explicitly check for property existence with `Object.hasOwn()`.

## 7. Data Exposure

* **Never** log sensitive information (passwords, tokens, PII) directly. Mask or redact it.
* Ensure error messages do not reveal internal system details (e.g., database schema, file paths, stack traces).
* Prevent accidental directory listings or serving of sensitive files.

## 8. Cross-Site Request Forgery (CSRF)

* Implement CSRF protection for state-changing requests, especially in web applications (e.g., using `csurf` middleware for Express.js).

