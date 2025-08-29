---
trigger: always_on
description: Guidelines for infrastructure, containerization, and CI/CD processes.
globs:
---

# Infrastructure & DevOps Best Practices

This rule defines our standards for infrastructure, containerization, and CI/CD.

## 1. Containerization
* **Runtime:** Docker (mandatory for all application components).
* **Dockerfiles:**
    * Use multi-stage builds to create small, efficient Docker images.
    * Use minimal base images (e.g., `node:lts-alpine`).
    * Include `.dockerignore` files to prevent unnecessary files from being included in the image.

## 2. Orchestration
* **Production Orchestration:** Kubernetes.
    * Design deployments for scalability (Horizontal Pod Autoscaling).
    * Leverage Kubernetes for service discovery, load balancing, and self-healing.

## 3. Cloud Provider
* **Primary Cloud:** GCP (Google Cloud Platform).
    * **Managed Services:** Prefer managed services (e.g., Cloud SQL for PostgreSQL, GKE for Kubernetes Engine) to reduce operational overhead.
    * **Logging:** Utilize GCP Cloud Logging.
    * **Monitoring:** Utilize GCP Cloud Monitoring.

## 4. CI/CD
* **Platform:** GitHub Actions or GitLab CI/CD.
* **Pipeline Stages:** Ensure pipelines include linting, testing, security scanning, Docker image building, and deployment steps.

## 5. Secret Management
* **Service:** GCP Secret Manager.
* **Principle:** **Never** hardcode secrets in code or configuration files. All sensitive information must be retrieved securely at runtime from Secret Manager.

## 6. Infrastructure as Code (IaC)
* **Tool:** Terraform.
* **Principle:** All cloud infrastructure should be defined and managed using Terraform to ensure reproducibility, version control, and consistency.
