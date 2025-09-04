import { PrismaClient } from '@prisma/client'

// In development, create a new client for each request to avoid prepared statement conflicts
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }
  
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['error'],
  })
  
  globalForPrisma.prisma = prisma
} else {
  // Development: create new client each time to avoid prepared statement conflicts
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  })
}

export { prisma }
