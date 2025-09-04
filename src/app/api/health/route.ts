import { NextResponse } from 'next/server'
import { getDocumentCount } from '@/lib/db-direct'

export async function GET() {
  try {
    const documentCount = await getDocumentCount()
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      documentCount,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
