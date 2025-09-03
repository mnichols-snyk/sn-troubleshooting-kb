import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// File validation schema
const fileValidationSchema = z.object({
  name: z.string(),
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  type: z.enum(['image/jpeg', 'image/jpg', 'image/png']).refine(
    (type) => ['image/jpeg', 'image/jpg', 'image/png'].includes(type),
    { message: 'Only JPEG and PNG images are allowed' }
  )
})

// Security: Validate file content by checking magic bytes
function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const magicBytes = buffer.subarray(0, 8)
  
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      // JPEG magic bytes: FF D8 FF
      return magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF
    case 'image/png':
      // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
      return magicBytes[0] === 0x89 && 
             magicBytes[1] === 0x50 && 
             magicBytes[2] === 0x4E && 
             magicBytes[3] === 0x47 &&
             magicBytes[4] === 0x0D &&
             magicBytes[5] === 0x0A &&
             magicBytes[6] === 0x1A &&
             magicBytes[7] === 0x0A
    default:
      return false
  }
}

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.+/g, '.')
    .substring(0, 100)
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only editors can upload images
    if ((session.user as { role?: string }).role !== 'EDITOR') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file metadata
    try {
      fileValidationSchema.parse({
        name: file.name,
        size: file.size,
        type: file.type
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ 
          error: error.issues[0].message 
        }, { status: 400 })
      }
      throw error
    }

    // Get file buffer and validate content
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Security: Validate file content matches declared MIME type
    if (!validateImageMagicBytes(buffer, file.type)) {
      return NextResponse.json({ 
        error: 'File content does not match declared type' 
      }, { status: 400 })
    }

    // Generate secure filename
    const fileExtension = file.type === 'image/jpeg' || file.type === 'image/jpg' ? 'jpg' : 'png'
    const uniqueId = uuidv4()
    const sanitizedOriginalName = sanitizeFilename(file.name.split('.')[0])
    const filename = `${uniqueId}_${sanitizedOriginalName}.${fileExtension}`

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Write file to uploads directory
    const filePath = join(uploadsDir, filename)
    await writeFile(filePath, buffer)

    // Return the file URL
    const fileUrl = `/api/files/${filename}`

    return NextResponse.json({ 
      url: fileUrl,
      filename: filename,
      originalName: file.name,
      size: file.size
    })

  } catch (uploadError) {
    console.error('File upload error:', uploadError)
    return NextResponse.json({ 
      error: 'Failed to upload file' 
    }, { status: 500 })
  }
}
