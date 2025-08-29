---
trigger: always_on
description: Enforces team-specific coding style, naming conventions, and code quality standards.
globs:
---

# Team Coding Style and Quality Guide

This rule ensures generated code adheres to our team's established coding style, promotes readability, and maintains high code quality.

## 1. Readability and Clarity

* Write clear, concise, and self-documenting code.
* Prioritize readability over cleverness.
* Use meaningful and descriptive names for variables, functions, classes, and files. Avoid single-letter variable names unless contextually obvious (e.g., loop counters).
* Add comments for complex logic, non-obvious choices, or external dependencies, but prefer self-documenting code where possible.

## 2. Naming Conventions

* **Variables/Functions:** `snake_case` for Python, `camelCase` for JavaScript/TypeScript, `camelCase` for Java.
* **Classes/Types:** `PascalCase` for Python, JavaScript/TypeScript, Java.
* **Constants:** `UPPER_SNAKE_CASE` for all languages.
* **Files:** `snake_case.py`, `camelCase.js`, `PascalCase.java`.

## 3. Formatting

* **Indentation:** Use 4 spaces for Python, 2 spaces for JavaScript/TypeScript.
* **Line Length:** Limit lines to a maximum of 120 characters.
* **Whitespace:** Use consistent whitespace around operators, in function definitions, and between logical blocks.
* **Brace Style:** Use [specific brace style, e.g., K&R or Allman] for C-family languages.

## 4. Code Structure and Organization

* **Modularity:** Break down large functions, classes, or modules into smaller, focused units with clear responsibilities.
* **Separation of Concerns:** Ensure different aspects of the application (e.g., UI, business logic, data access) are clearly separated.
* **DRY (Don't Repeat Yourself):** Avoid code duplication. Extract common logic into reusable functions or modules.
* **Imports:** Organize import statements consistently (e.g., standard library, third-party, then local imports, grouped and sorted alphabetically).

## 5. Error Handling

* Implement consistent and appropriate error handling (e.g., using exceptions, `Result` types, or early returns).
* Provide informative error messages that aid debugging but do not expose sensitive data.

## 6. Testing

* **Always** generate corresponding unit tests for new code, covering positive paths, negative paths, and edge cases.
* Ensure tests are independent, fast, and reliable.
* Use established testing frameworks for the language/framework (e.g., `pytest`, `Jest`, `JUnit`).

## 7. Specific Language/Framework Directives

* **Python:** Adhere to PEP 8. Use type hints (`from typing import ...`). Utilize context managers (`with open(...)`) for resource management.
* **JavaScript/TypeScript:** Prefer `const` and `let` over `var`. Use `async/await` for asynchronous operations. Prefer functional components and hooks for React.
* **Java:** Adhere to common Java style guides (e.g., Google Java Format, Oracle Code Conventions). Prefer immutability where possible.

