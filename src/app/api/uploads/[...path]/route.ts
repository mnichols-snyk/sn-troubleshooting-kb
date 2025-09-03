import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const filePath = join(process.cwd(), 'uploads', ...resolvedParams.path)
    const file = await readFile(filePath)
    
    // Determine content type based on file extension
    const ext = resolvedParams.path[resolvedParams.path.length - 1].split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
    }

    return new NextResponse(file as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    } as ResponseInit)
  } catch (fileError) {
    console.error('File serving error:', fileError)
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    )
  }
}
