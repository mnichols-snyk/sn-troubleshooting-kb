import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Check authentication for file access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename } = params

    // Security: Validate filename to prevent path traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    // Only allow specific file extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png']
    const hasValidExtension = allowedExtensions.some(ext => 
      filename.toLowerCase().endsWith(ext)
    )

    if (!hasValidExtension) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Read file from uploads directory
    const filePath = join(process.cwd(), 'uploads', filename)
    const fileBuffer = await readFile(filePath)

    // Determine content type
    let contentType = 'image/jpeg'
    if (filename.toLowerCase().endsWith('.png')) {
      contentType = 'image/png'
    }

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Security-Policy': "default-src 'none'",
      },
    })

  } catch (error) {
    console.error('File serving error:', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
