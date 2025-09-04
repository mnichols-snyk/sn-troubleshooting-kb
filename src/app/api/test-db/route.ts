import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL starts with postgres:', process.env.DATABASE_URL?.startsWith('postgres'))
    
    // Simple connection test
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database connection successful:', result)
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection working',
      result,
      env_check: {
        has_database_url: !!process.env.DATABASE_URL,
        starts_with_postgres: process.env.DATABASE_URL?.startsWith('postgres')
      }
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        env_check: {
          has_database_url: !!process.env.DATABASE_URL,
          starts_with_postgres: process.env.DATABASE_URL?.startsWith('postgres'),
          database_url_length: process.env.DATABASE_URL?.length || 0
        }
      },
      { status: 500 }
    )
  }
}
