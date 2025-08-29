---
trigger: always_on
description: Node.js specific guidelines for building and deploying microservices.
globs:
---

# Node.js Microservices Best Practices

This rule set outlines how to design and implement Node.js microservices for scalability, resilience, and maintainability in a distributed environment.

## 1. Stateless Services

* Design Node.js services to be stateless. Avoid storing session information or user data directly on the service instance.
* Store state in external, shared, and highly available services (e.g., databases, Redis, message queues).

## 2. Inter-Service Communication

* **Prefer asynchronous messaging** (e.g., RabbitMQ, Kafka, Google Pub/Sub) for communication where services don't need immediate responses.
    * Use robust message queue clients with error handling, retries, and dead-letter queues.
* For synchronous communication (REST/gRPC):
    * Define clear API contracts using OpenAPI/Swagger or Protocol Buffers.
    * Implement client-side resilience patterns (circuit breakers, retries with exponential backoff, timeouts).
    * Secure communication with mTLS (mutual TLS) or JWT-based authentication for internal APIs.

## 3. Observability

* Implement comprehensive structured logging (e.g., Winston, Pino) with correlation IDs for tracing requests across multiple services.
* Expose metrics endpoints (e.g., using Prometheus client libraries) for monitoring service health and performance.
* Integrate with distributed tracing systems (e.g., OpenTelemetry, Jaeger) to visualize request flows across services.

## 4. Containerization

* Provide optimized Dockerfiles for each service.
* Keep Docker images small by using multi-stage builds and minimal base images (e.g., `alpine` Node.js images).
* Use `.dockerignore` to prevent sensitive files or unnecessary build artifacts from being included in the image.

## 5. Configuration Management

* Externalize all configurations for each microservice using environment variables or a dedicated configuration service.
* Ensure sensitive configurations (secrets) are managed securely by the deployment environment (e.g., Kubernetes Secrets, cloud-native secret managers).

## 6. Health Checks

* Implement health check endpoints (e.g., `/health`, `/readiness`, `/liveness`) for container orchestration platforms (Kubernetes).
* These endpoints should verify critical dependencies (database, message queue, external APIs).

## 7. Service Discovery

* Assume the presence of a service discovery mechanism (e.g., Kubernetes DNS, Consul, Eureka) and design services to register and discover others dynamically.

