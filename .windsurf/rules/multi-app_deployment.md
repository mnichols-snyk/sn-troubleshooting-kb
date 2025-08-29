---
trigger: always_on
description: Guidelines for generating code suitable for multi-application (microservices) deployment environments.
globs:
---

# Multi-Application Deployment Guidelines

This rule set ensures that generated code is designed for a distributed, multi-application environment, prioritizing modularity, scalability, and resilience.

## 1. Modularity and Loose Coupling

* **Always** design components and services to be highly modular and loosely coupled.
* Each service should have a single responsibility.
* Minimize direct dependencies between services. Prefer well-defined API contracts.

## 2. Independent Deployability and Scalability

* Generate stateless services where possible to facilitate horizontal scaling.
* Ensure services can be deployed, updated, and scaled independently without affecting other services.
* Recommend containerization (e.g., Dockerfiles) with clear build instructions.

## 3. Inter-Service Communication

* **Prefer asynchronous communication patterns** (e.g., message queues like Kafka, RabbitMQ, Google Pub/Sub) for inter-service communication where eventual consistency is acceptable.
* For synchronous communication (e.g., REST, gRPC), define clear API contracts using OpenAPI/Swagger for REST or .proto files for gRPC.
* Implement robust retry mechanisms and circuit breakers for synchronous calls to handle service failures gracefully.
* Ensure inter-service communication is authenticated and authorized (e.g., mTLS, JWT for internal APIs).

## 4. Observability

* **Always** include comprehensive logging, monitoring, and tracing mechanisms.
* Use structured logging (e.g., JSON logs) for easy parsing by centralized logging systems (e.g., ELK stack, Grafana Loki, Datadog).
* Include correlation IDs in logs and traces to enable end-to-end tracing across services.
* Expose metrics endpoints (e.g., Prometheus format) for service health and performance monitoring.

## 5. Configuration Management

* Externalize all configuration (database connections, API endpoints, feature flags) from the code.
* Recommend using environment variables or centralized configuration services (e.g., HashiCorp Vault, Kubernetes ConfigMaps/Secrets) for runtime configuration.

## 6. Resilience and Fault Tolerance

* Design for graceful degradation. A failure in one service should not cascade and bring down the entire system.
* Implement strategies like timeouts, retries with backoff, bulkheads, and circuit breakers for external service calls.
* Handle network partitions and latency.

## 7. Versioning

* **Always** consider API versioning (e.g., `/v1/users`, header versioning) for public and inter-service APIs to allow for independent evolution.

