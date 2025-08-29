#!/bin/bash

# Snyk ServiceNow Troubleshooting Knowledge Base - Local Setup Script

echo "🚀 Starting Snyk ServiceNow Troubleshooting Knowledge Base..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create uploads directory
mkdir -p uploads

# Start PostgreSQL container
echo "📦 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Generate Prisma client and push schema
echo "🔧 Setting up database schema..."
npm run db:generate
npm run db:push

# Start the Next.js application
echo "🌐 Starting the application..."
npm run dev

echo "✅ Application is ready at http://localhost:3000"
echo "📝 Sign up for an account and choose 'Editor' role to manage content"
