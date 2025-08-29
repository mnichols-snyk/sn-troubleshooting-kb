---
trigger: always_on
description: Core Node.js and TypeScript backend development guidelines, including framework, database interaction, and general utilities.
globs:
---

# Backend: Node.js & TypeScript Best Practices

This rule outlines the preferred technologies and practices for our Node.js and TypeScript backend.

## 1. Runtime & Framework
* **Runtime:** Node.js
* **Framework:** Express.js or Fastify.
    * **Preference:** Fastify is generally preferred for its performance and developer experience in new services. Use Express.js if existing patterns dictate.
    * Build RESTful APIs with clear endpoint definitions and HTTP methods.
* **Language:** TypeScript (mandatory for all backend code).
    * Enforce strict type checking.

## 2. Database ORM/Query Builder
* **Primary Choice:** Prisma or TypeORM.
    * **Recommendation:** Prisma for its strong type safety, migration system, and ease of use.
    * Ensure the `pg` driver is configured for PostgreSQL.
    * Utilize their features for secure parameterized queries and migrations.

## 3. Authentication & Authorization
* **Authentication:** Passport.js (for extensible strategies like JWT, OAuth).
* **Authorization:** Custom RBAC (Role-Based Access Control) middleware.
    * Implement granular permissions based on user roles (Superuser, Tenant Admin, Coach, User).
    * Integrate with JWT for stateless authentication.

## 4. AI LLM Integration
* **LLM Provider:** Google Gemini API.
* **Integration:** Use the official Node.js client library for Gemini API interactions.
* Develop a dedicated module for prompt engineering and LLM response parsing.

## 5. Email Service
* **Library:** Nodemailer for sending emails.
* **Provider Integration:** Connect Nodemailer with a reliable email service like SendGrid or Mailgun for production email delivery.

## 6. Subscription & Billing
* **Provider:** Stripe API.
* **Integration:** Use Stripe's Node.js client library for all payment, subscription, and webhook interactions.
* Adhere to PCI DSS compliance standards for handling credit card information (Stripe's Elements/Checkout are key for this).

## 7. Logging
* **Library:** Pino or Winston.
* **Format:** Prefer structured logging (e.g., JSON format) for easy parsing by centralized logging systems.
* Log security-relevant events and API requests/responses.

## 8. Validation
* **Library:** Zod or Joi.
* **Usage:** Implement comprehensive input validation on all API endpoints for request bodies, query parameters, and headers.
