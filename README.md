# Snyk ServiceNow Troubleshooting Knowledge Base

A dynamic, secure, and collaborative web application for managing Snyk ServiceNow integration troubleshooting documentation.

## Features

- **Role-Based Authentication**: Secure access with Editor and Viewer roles
- **Dynamic Content Management**: CRUD operations for documentation entries
- **File Upload Support**: Image uploads for documentation
- **Search Functionality**: Fast search across all content
- **Responsive Design**: Modern UI with Tailwind CSS
- **Docker Support**: Containerized PostgreSQL database

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Credentials provider
- **File Storage**: Local filesystem with Docker volumes
- **Deployment**: Docker Compose for local development

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone and setup the project**:
   ```bash
   cd /path/to/sn-troubleshooting-kb
   npm install
   ```

2. **Start the database**:
   ```bash
   npm run docker:up
   ```

3. **Setup the database schema**:
   ```bash
   npm run setup
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Sign up for an account (choose Editor role to manage content)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run setup` - Generate client and push schema

## User Roles

- **Editor**: Can create, read, update, and delete documentation entries
- **Viewer**: Read-only access to all documentation

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── auth/         # Authentication pages
│   └── page.tsx      # Main application page
├── components/       # Reusable components
├── lib/             # Utilities and configurations
└── types/           # TypeScript type definitions
```

## Environment Variables

The `.env` file contains:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL

## Sprint 1 Completed Features

✅ **FE-101**: Next.js project with TypeScript and Tailwind CSS  
✅ **BE-101**: Docker Compose PostgreSQL configuration  
✅ **BE-102**: Database schema with Users and Documents tables  
✅ **BE-103**: NextAuth.js authentication with Credentials provider  
✅ **FE-102**: Login and registration pages  
✅ **BE-104**: File upload service for images  

## Next Steps (Sprint 2)

- Dynamic content management system
- Document CRUD operations
- Public API for fetching documents
- Real-time UI updates

## Security

- Role-based access control (RBAC)
- Input validation with Zod
- Secure file uploads with type and size validation
- Password hashing with bcryptjs
- Protected API routes for authenticated users only

## Support

For questions or issues, contact the Snyk support team.
