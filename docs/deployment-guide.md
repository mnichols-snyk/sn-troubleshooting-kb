# Snyk ServiceNow Troubleshooting Knowledge Base - Deployment Guide

## Overview

This guide provides instructions for deploying and running the Snyk ServiceNow Troubleshooting Knowledge Base locally using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for development)
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sn-troubleshooting
   ```

2. **Run the startup script**
   ```bash
   chmod +x run-local.sh
   ./run-local.sh
   ```

3. **Access the application**
   - Open your browser to http://localhost:3003
   - The application will be ready to use

## Manual Setup

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/sn_troubleshooting_kb"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3003"
```

### 2. Database Setup

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d postgres
```

Run database migrations:

```bash
npm run db:push
```

### 3. Application Startup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## User Management

### Creating the First Editor

1. Navigate to the registration page: http://localhost:3003/auth/signup
2. Create an account with the "Editor" role
3. Sign in to start managing content

### User Roles

- **Viewer**: Can browse and search all documentation
- **Editor**: Can create, edit, and delete documentation + all Viewer capabilities

## Features

### For All Users
- Browse documentation by category
- Search across all content
- Export all documentation to Word document
- Responsive design for mobile and desktop

### For Editors
- Create new documentation with images
- Edit existing documentation
- Delete documentation with confirmation
- Real-time UI updates

## File Storage

- Images are stored in the `uploads/` directory
- Files are served via `/api/uploads/[...path]` route
- Automatic cleanup when documents are deleted

## Security Features

- Role-based access control (RBAC)
- Protected API routes for write operations
- File upload validation (type, size, filename)
- Input sanitization
- Session-based authentication

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   - The app will automatically use port 3003 if 3000 is occupied

2. **Database connection issues**
   - Ensure PostgreSQL container is running: `docker-compose ps`
   - Check database URL in `.env` file

3. **File upload errors**
   - Verify `uploads/` directory permissions
   - Check file size (max 5MB) and type (images only)

4. **Authentication issues**
   - Verify NEXTAUTH_SECRET is set in `.env`
   - Clear browser cookies and try again

### Logs

View application logs:
```bash
npm run dev
```

View database logs:
```bash
docker-compose logs postgres
```

## Production Deployment

### Environment Variables

For production, update these environment variables:

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="secure-random-secret-key"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

### Docker Production Build

Build the production image:

```bash
docker build -t sn-troubleshooting-kb .
```

Run with Docker Compose:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Security Considerations

1. **Database Security**
   - Use strong passwords
   - Enable SSL/TLS connections
   - Regular backups

2. **Application Security**
   - Use HTTPS in production
   - Set secure session cookies
   - Regular security updates

3. **File Storage**
   - Consider cloud storage for production
   - Implement virus scanning for uploads
   - Set up proper backup procedures

## Maintenance

### Database Backup

```bash
docker exec postgres pg_dump -U postgres sn_troubleshooting_kb > backup.sql
```

### Database Restore

```bash
docker exec -i postgres psql -U postgres sn_troubleshooting_kb < backup.sql
```

### Updates

1. Pull latest changes: `git pull`
2. Install dependencies: `npm install`
3. Run migrations: `npm run db:push`
4. Restart application

## Support

For technical support or questions:
- Check the troubleshooting section above
- Review application logs
- Contact the development team

## Architecture

### Technology Stack
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Local filesystem (Docker volume)
- **Authentication**: NextAuth.js with Credentials provider

### Database Schema
- Users table with role-based access
- Documents table with category organization
- File path tracking for image management
- Audit trails with creation/update timestamps
