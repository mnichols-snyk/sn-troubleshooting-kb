# **Project Plan: Snyk ServiceNow Troubleshooting Knowledge Base**
 
Date: August 29, 2025  
Version: 1.3

### **1\. Project Objective**

The goal of this project is to transform the existing static HTML troubleshooting page into a dynamic, secure, and collaborative web application. This "Knowledge Base" will serve as a single source of truth for Snyk support engineers and authorized partners, allowing them to create and manage documentation, while providing read-only access to Snyk customers. The application will be designed for local-first deployment, ensuring portability and ease of setup.

### **2\. Key Features (Epics)**

* **Role-Based User Authentication:** Securely manage access for two distinct roles: "Editors" (Snyk support, partners) who can manage content, and the public "Viewers" (customers) who have read-only access.  
* **Dynamic Content Management (CMS):** Allow Editors to perform Create, Read, Update, and Delete (CRUD) operations on documentation entries, including text and images.  
* **Robust Search:** Provide a fast and effective search capability that scans all content (titles and descriptions) across all categories.  
* **Data Export:** Enable the export of the entire knowledge base into a single, well-formatted document for external use.  
* **Scalable Backend:** Build on a reliable and scalable self-contained architecture that can be run locally via Docker and is prepared for future cloud deployment.

### **3\. Proposed Technology Stack**

To facilitate portability, local development, and security, the following stack is recommended:

* **Full-Stack Framework:** **Next.js (React)** \- For a modern, fast, and component-based user interface with integrated backend API routes. We will reuse the existing Tailwind CSS for styling.  
* **Database:** **PostgreSQL (managed via Docker)** \- A powerful, open-source object-relational database system, containerized for easy local setup.  
* **ORM:** **Prisma** \- A next-generation Node.js and TypeScript ORM that makes working with the database simple, type-safe, and efficient.  
* **Authentication:** **NextAuth.js (Auth.js)** \- A flexible authentication library for Next.js. We will use the **Credentials Provider** for a secure email/password login system.  
* **Storage:** **Local Filesystem Storage (via Docker Volume)** \- A simple and robust solution for storing user-uploaded files like screenshots during local development and deployment.  
* **Deployment:** **Local Docker Environment** \- The application will be fully containerized using Docker Compose for one-command local startup. (Future deployment to Vercel remains an option).  
* **Export Library:** **html-to-docx** or a similar library to handle the conversion for the Google Docs export feature.

### **4\. Project Phases & Sprints**

The project is broken down into five two-week sprints.

#### **Sprint 1: Foundation & Backend Setup (Weeks 1-2)**

*Goal: Establish the project's technical foundation, containerized services, and a role-based authentication system.*

| Task ID | Task Description | Priority | Status |
| :---- | :---- | :---- | :---- |
| **FE-101** | Initialize Next.js project, set up file structure, and integrate Tailwind CSS. | **High** | To Do |
| **BE-101** | Create a docker-compose.yml file to configure and run a local PostgreSQL instance. | **High** | To Do |
| **BE-102** | Define the database schema using schema.prisma. Create users and documents tables, including a role column in the users table. | **High** | To Do |
| **BE-103** | Configure NextAuth.js with the Credentials (email/password) provider for a self-hosted authentication system. | **High** | To Do |
| **FE-102** | Create login and registration pages/components that connect with the NextAuth.js backend routes. | **High** | To Do |
| **BE-104** | Implement a file handling service in a Next.js API route to save uploaded images to a volume-mounted local directory. | **Medium** | To Do |

#### **Sprint 2: Core Content Management \- Create & Read (Weeks 3-4)**

*Goal: Enable authenticated Editors to add new content and display all content to the public.*

| Task ID | Task Description | Priority | Status |
| :---- | :---- | :---- | :---- |
| **FE-201** | Design and build the "Add New Documentation" form as a modal, triggered by a "+" icon visible only to authenticated "Editor" users. | **High** | To Do |
| **FE-202** | Add form fields: category dropdown, title input, description textarea, and a file upload input for screenshots. | **High** | To Do |
| **BE-201** | Create a protected Next.js API route to handle form submission: save the uploaded image to the local filesystem, generate a relative URL, and save all data to PostgreSQL via Prisma. | **High** | To Do |
| **FE-203** | Create a public Next.js API route to fetch all documents and dynamically render the tabs and accordion items on the main page for all users. | **High** | To Do |
| **UX-201** | Display uploaded images within their corresponding accordion content section. | **Medium** | To Do |
| **FE-204** | Implement frontend state management (e.g., React Context or Zustand) to handle user auth state and data. | **Medium** | To Do |

#### **Sprint 3: Content Management \- Update & Delete (Weeks 5-6)**

*Goal: Complete the CMS functionality by adding edit and delete capabilities for Editors.*

| Task ID | Task Description | Priority | Status |
| :---- | :---- | :---- | :---- |
| **FE-301** | Add "Edit" and "Delete" icons to each accordion item, visible only to authenticated "Editor" users. | **High** | To Do |
| **FE-302** | Build the "Edit Documentation" form, pre-populating it with data from the selected document. | **High** | To Do |
| **BE-301** | Create a protected Next.js API route to handle updates to a document. Include logic for updating or replacing an image on the local filesystem. | **High** | To Do |
| **BE-302** | Create a protected Next.js API route to delete a document and its associated image from the local filesystem. | **High** | To Do |
| **FE-303** | Implement confirmation dialogs for delete actions to prevent accidental data loss. | **Medium** | To Do |
| **UX-301** | Ensure the UI updates in real-time after any create, update, or delete operation without requiring a page refresh. | **Medium** | To Do |

#### **Sprint 4: Advanced Features \- Search & Export (Weeks 7-8)**

*Goal: Implement the primary user-facing tools for data retrieval and export.*

| Task ID | Task Description | Priority | Status |
| :---- | :---- | :---- | :---- |
| **FE-401** | Refactor the search functionality to be client-side. The app will fetch all documents on load via the API, and the search bar will filter the local data in real-time. | **High** | To Do |
| **UX-401** | As a user types in the search box, filter the accordion items across all tabs, and automatically switch to the tab with the first search result. | **High** | To Do |
| **FE-402** | Add an "Export to Doc" button to the main UI. | **High** | To Do |
| **BE-401** | Create a Next.js API route that fetches all content from the database, formats it into a clean HTML structure, and uses a library to convert this HTML into a downloadable .docx file. | **High** | To Do |
| **UX-402** | Style the exported document to be clean, readable, and professional, with clear headings for each section. | **Medium** | To Do |

#### **Sprint 5: Testing, Security Hardening & Deployment (Weeks 9-10)**

*Goal: Ensure the application is bug-free, secure, and ready for production.*

| Task ID | Task Description | Priority | Status |
| :---- | :---- | :---- | :---- |
| **QA-501** | Conduct end-to-end testing of all features: public view, login, CRUD operations, search, and export. | **High** | To Do |
| **SEC-501** | Perform a final review of all Next.js API routes, ensuring that all write/delete endpoints are protected and only accessible by authenticated users with the 'Editor' role. | **High** | To Do |
| **QA-502** | Test the application across different browsers (Chrome, Firefox, Safari) and on mobile devices to ensure responsiveness. | **High** | To Do |
| **OPS-501** | Finalize and document the docker-compose.yml setup for easy local deployment on any machine. | **High** | To Do |
| **OPS-502** | Create a startup script (e.g., run-local.sh) to simplify launching the entire application stack (database and Next.js app). | **High** | To Do |
| **DOC-501** | Create brief documentation for support engineers on how to use the new knowledge base and how to run it locally. | **Medium** | To Do |

### **5\. Security Considerations**

* **Access Control:** Role-Based Access Control (RBAC) will be managed within the Next.js application using NextAuth.js. Public routes will serve read-only data, while protected API routes will handle all CRUD operations, accessible only by authenticated users with the "Editor" role.  
* **Input Sanitization:** All user-submitted content will be sanitized to prevent Cross-Site Scripting (XSS) attacks, especially if a rich text editor is implemented.  
* **Dependencies:** We will use Snyk to scan our own project's dependencies to ensure we are not introducing new vulnerabilities.  
* **Environment Variables:** All sensitive credentials (database URLs, secret keys) will be managed through environment variables (.env file) and not committed to source control.

### **6\. Success Metrics**

* **Adoption:** The application is actively used by the Snyk support team and partners to manage documentation.  
* **Efficiency:** A measurable reduction in the time it takes for engineers to find and share troubleshooting information.  
* **Content Growth:** A steady increase in the number of high-quality documentation entries over time.