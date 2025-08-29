---
trigger: model_decision
description: Best practices for secure and efficient interaction with PostgreSQL databases.
globs:
---

# PostgreSQL Best Practices

This rule set ensures generated database code for PostgreSQL is secure, performant, and maintains data integrity.

## 1. SQL Injection Prevention

* **Always** use parameterized queries or prepared statements for all database interactions involving user input.
* **Never** concatenate user input directly into SQL strings.
* If using an ORM (e.g., TypeORM, Sequelize, Prisma), ensure it uses parameterized queries by default.
* Example (using `node-postgres` `pg` library):
    ```typescript
    import { Pool } from 'pg';
    const pool = new Pool();
    async function getUser(userId: string) {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        return res.rows[0];
    }
    ```

## 2. Connection Management

* **Always** use connection pooling for database connections to efficiently manage resources and improve performance.
* Configure connection limits appropriate for your application's load.
* Ensure connections are properly released back to the pool after use.

## 3. Transaction Management

* Use database transactions to ensure atomicity for operations involving multiple related database modifications.
* Implement `BEGIN`, `COMMIT`, and `ROLLBACK` for critical operations.

## 4. Least Privilege

* Create dedicated database users for your application with the minimum necessary permissions.
* **Never** use a superuser or administrative role for application logic.
* Limit access to specific schemas, tables, and operations (SELECT, INSERT, UPDATE, DELETE).

## 5. Data Encryption

* Recommend encrypting sensitive data at rest within the database (e.g., using PostgreSQL's `pg_crypto` or application-level encryption).
* Enforce encryption in transit (SSL/TLS) for all database connections.

## 6. Schema Design and Migrations

* Design normalized database schemas to reduce data redundancy and improve integrity (e.g., 3NF or higher).
* Use database migration tools (e.g., `TypeORM Migrations`, `Knex.js Migrations`, `Flyway`, `Liquibase`) to manage schema changes in a version-controlled way.

## 7. Performance Optimization

* Use appropriate indexes for frequently queried columns.
* Optimize queries by selecting only necessary columns and using `LIMIT` and `OFFSET` for pagination.
* Consider denormalization or materialized views for read-heavy workloads where performance is critical.

## 8. Backup and Recovery

* Recommend regular database backups and a tested recovery plan.

