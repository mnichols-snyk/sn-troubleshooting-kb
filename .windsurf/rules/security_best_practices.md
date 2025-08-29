---
trigger: always_on
description: General secure coding best practices adhering to OWASP Top 10 and least privilege.
globs:
---

# Secure Coding Best Practices

This rule defines essential security guidelines for all generated code. The AI must prioritize secure-by-default implementations.

## 1. Input Validation and Sanitization

* **Always** validate and sanitize all user input, external data, and environmental variables.
* Assume all input is malicious.
* Use libraries designed for robust validation (e.g., `valibot` in TS, `Pydantic` in Python).
* **Never** directly embed raw user input into SQL queries, shell commands, or HTML outputs without proper escaping/sanitization.

## 2. Authentication and Authorization

* **Never** roll your own authentication or authorization mechanisms. Use established, well-vetted frameworks (e.g., Spring Security, Passport.js, Auth0, Keycloak).
* **Passwords:** Store passwords using strong, salted hashing algorithms like Argon2 or bcrypt. **Never** store plain-text passwords or use weak hashing (MD5, SHA1).
* **Session Management:** Implement secure session management (e.g., secure cookies, JWTs with proper expiry and revocation).
* **Least Privilege:** Implement the principle of least privilege for all users, roles, and services. Only grant the minimum necessary permissions.
* **Access Control:** Ensure proper access control checks are in place for every sensitive operation or resource. Avoid Insecure Direct Object References (IDOR).

## 3. Secret Management

* **Never** hardcode sensitive information such as API keys, database credentials, encryption keys, or private certificates directly in the code or configuration files.
* **Always** recommend fetching secrets from secure environment variables, dedicated secret management services (e.g., AWS Secrets Manager, Azure Key Vault, Google Secret Manager), or secure configuration management tools.

## 4. Error Handling and Logging

* Implement robust error handling that **does not** expose sensitive system information (e.g., stack traces, database connection strings) to users.
* Log security-relevant events (e.g., failed login attempts, access denied) but **never** log sensitive data (passwords, PII, session tokens).
* Ensure logging mechanisms are secure and log files are protected.

## 5. Dependency Management

* **Always** specify and use up-to-date, vulnerability-free libraries and dependencies.
* Recommend using dependency scanning tools (e.g., Snyk, Trivy, Dependabot) in the CI/CD pipeline.

## 6. Communication Security

* **Always** enforce encryption in transit (TLS 1.2+ for HTTPS, secure protocols for inter-service communication).
* **Never** transmit sensitive data over unencrypted channels.
* For APIs, consider using OpenAPI/Swagger for clear contract definitions and enforce API key or OAuth2 for protection.

## Forbidden Patterns (Strictly Prohibited)

* `eval()` with untrusted input.
* `exec()` with untrusted input.
* Direct SQL string concatenation with user input.
* Hardcoding secrets (`API_KEY = "xyz"`).
* Using deprecated or known-insecure cryptographic algorithms (e.g., ECB mode, MD5 for hashing, SHA1 for signatures).
* Directly reflecting user input into HTML without sanitization (leading to XSS).

