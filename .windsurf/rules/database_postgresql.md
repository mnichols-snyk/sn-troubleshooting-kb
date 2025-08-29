---
trigger: always_on
description: Best practices for PostgreSQL database design, interaction, and multi-tenancy.
globs:
---

# Database: PostgreSQL Best Practices

This rule outlines our preferred practices for interacting with the PostgreSQL database, especially for multi-tenancy.

## 1. Primary Database
* **Database System:** PostgreSQL.
    * Utilize its robust features for transactional integrity and data consistency.

## 2. Multi-Tenancy Strategy
* **Approach:** Shared Database, Shared Schema with `tenant_id` and Row Level Security (RLS).
* **`tenant_id`:** Every tenant-specific table MUST include a `tenant_id` column (UUID or Integer, consistent across tables).
* **Row Level Security (RLS):** Implement RLS policies on ALL tenant-specific tables.
    * Policies must enforce that queries only access rows belonging to the authenticated `tenant_id`.
    * Example RLS policy: `CREATE POLICY tenant_isolation_policy ON my_table FOR ALL USING (tenant_id = current_setting('app.tenant_id')::uuid);`
* **Superuser Access:** Define specific database roles or configurations that allow the superuser to bypass RLS for platform-level management.

## 3. ID Generation
* **Primary Keys:** Prefer UUIDs for primary keys where practical.
    * This helps avoid sequential IDs and aids in future distributed database scenarios.

## 4. Indexing
* **Required Indexes:** Ensure appropriate indexes are created on `tenant_id` columns for all tenant-specific tables.
* Add indexes on frequently queried columns and foreign keys to optimize query performance.

## 5. Relationships
* Define clear foreign key relationships between tables to enforce referential integrity.
