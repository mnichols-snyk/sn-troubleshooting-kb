import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing document fetch...')
    
    // Simple test query
    const count = await prisma.document.count({
      where: { published: true }
    })
    
    console.log('Document count:', count)
    
    if (count === 0) {
      return NextResponse.json({ 
        status: 'no_documents',
        message: 'No published documents found',
        count: 0
      })
    }
    
    // Try basic fetch
    const documents = await prisma.document.findMany({
      where: { published: true },
      take: 3,
      select: {
        id: true,
        title: true,
        category: true,
      }
    })
    
    return NextResponse.json({
      status: 'success',
      count,
      sample_documents: documents
    })
  } catch (error) {
    console.error('Test fetch error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
