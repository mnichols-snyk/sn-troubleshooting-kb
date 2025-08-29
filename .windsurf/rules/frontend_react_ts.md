---
trigger: always_on
description: Best practices and preferred technologies for React and TypeScript frontend development.
globs:
---

# Frontend: React & TypeScript Best Practices

This rule details our preferred frontend technologies and development practices for React and TypeScript.

## 1. Framework & Language
* **Framework:** React
* **Language:** TypeScript (preferred for all new components and logic).
    * Prioritize strong typing. Ensure `tsconfig.json` has `"strict": true`.
    * Use `interface` for defining object shapes and `type` for aliases or union types.

## 2. Styling & UI
* **Primary Styling:** Emotion (for CSS-in-JS and theming capabilities).
    * Favor `styled` components over inline styles where practical.
    * Utilize Emotion's theming features for dynamic branding.
* **UI Components:** Consider Material-UI or Ant Design for pre-built, accessible UI components.
    * If using, adhere to their component patterns and customization best practices.

## 3. State Management
* **Data Fetching & Caching:** React Query (or TanStack Query) is the go-to for server state management.
    * Leverage its caching, invalidation, and background refetching capabilities.
* **Lightweight Global State:** Zustand or Jotai for client-side, global state that is not directly tied to server data.
    * Prefer these over heavier alternatives for simpler state needs.

## 4. Routing
* **Routing Library:** React Router DOM for client-side navigation.
    * Use modern hooks like `useNavigate`, `useParams`, `useLocation`.

## 5. General Practices
* **Component Structure:** Favor functional components with Hooks.
* **Immutability:** Always work with immutable data structures when updating state.
* **Accessibility (A11y):** Ensure all components are accessible (WCAG 2.1 AA standards). Use semantic HTML, ARIA attributes where necessary.
* **Responsiveness:** Implement a mobile-first approach.
