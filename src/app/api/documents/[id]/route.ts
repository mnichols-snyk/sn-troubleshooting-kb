import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateDocumentUniqueness } from '@/lib/duplicate-validation'
import { z } from 'zod'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const updateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
})

interface RouteParams {
  params: { id: string }
}

// GET - Fetch single document
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

// PUT - Update document
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!session.user.role || session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Editor role required' },
        { status: 403 }
      )
    }

    const { id } = params

    // Check if document exists and user owns it or is admin
    const existingDocument = await prisma.document.findUnique({
      where: { id },
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    
    // Extract text fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const image = formData.get('image') as File | null
    const removeImage = formData.get('removeImage') === 'true'

    // Validate required fields
    const validatedData = updateDocumentSchema.parse({
      title,
      description,
      category,
    })

    // Check for duplicates before proceeding (exclude current document)
    const duplicateValidation = await validateDocumentUniqueness(
      validatedData.title,
      validatedData.description,
      validatedData.category,
      id // Exclude current document from duplicate check
    )

    if (!duplicateValidation.isValid) {
      return NextResponse.json(
        { 
          error: duplicateValidation.error,
          suggestions: duplicateValidation.suggestions,
          isDuplicateError: true
        },
        { status: 409 } // Conflict status code
      )
    }

    let imageUrl = existingDocument.imageUrl
    let imagePath = existingDocument.imagePath

    // Handle image removal
    if (removeImage && existingDocument.imagePath) {
      try {
        await unlink(existingDocument.imagePath)
      } catch (unlinkError) {
        console.warn('Failed to delete old image file:', unlinkError)
      }
      imageUrl = null
      imagePath = null
    }

    // Handle new image upload
    if (image && image.size > 0) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' },
          { status: 400 }
        )
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (image.size > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 5MB.' },
          { status: 400 }
        )
      }

      // Remove old image if exists
      if (existingDocument.imagePath && !removeImage) {
        try {
          await unlink(existingDocument.imagePath)
        } catch (unlinkError) {
          console.warn('Failed to delete old image file:', unlinkError)
        }
      }

      // Generate unique filename
      const fileExtension = image.name.split('.').pop()
      const filename = `${uuidv4()}.${fileExtension}`
      
      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'uploads')
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (mkdirError) {
        // Directory might already exist
      }

      // Save file
      const filepath = join(uploadsDir, filename)
      const buffer = Buffer.from(await image.arrayBuffer())
      await writeFile(filepath, buffer)

      imageUrl = `/uploads/${filename}`
      imagePath = filepath
    }

    // Update document in database
    const document = await prisma.document.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        imageUrl,
        imagePath,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Document updated successfully',
      document,
    })

  } catch (error) {
    console.error('Error updating document:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!session.user.role || session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Editor role required' },
        { status: 403 }
      )
    }

    const { id } = params

    // Check if document exists
    const existingDocument = await prisma.document.findUnique({
      where: { id },
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete associated image file if exists
    if (existingDocument.imagePath) {
      try {
        await unlink(existingDocument.imagePath)
      } catch (unlinkError) {
        console.warn('Failed to delete image file:', unlinkError)
      }
    }

    // Delete document from database
    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Document deleted successfully',
    })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
