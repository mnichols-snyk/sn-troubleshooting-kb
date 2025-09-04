import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateDocumentUniqueness } from '@/lib/duplicate-validation'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
})

// GET - Fetch all documents (public endpoint)
export async function GET() {
  try {
    // Add connection timeout and retry logic
    const documents = await Promise.race([
      prisma.document.findMany({
        where: {
          published: true,
        },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { category: 'asc' },
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      )
    ])

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    
    // Try to disconnect and reconnect on timeout
    if (error instanceof Error && error.message.includes('timeout')) {
      try {
        await prisma.$disconnect()
        await prisma.$connect()
        
        // Retry with simpler query
        const documents = await prisma.document.findMany({
          where: { published: true },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: [
            { category: 'asc' },
            { createdAt: 'desc' },
          ],
        })
        
        return NextResponse.json(documents)
      } catch (retryError) {
        console.error('Retry failed:', retryError)
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST - Create new document (protected endpoint for Editors)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions) as any
    if (!session || session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    // Extract text fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const image = formData.get('image') as File | null

    // Validate required fields
    const validatedData = createDocumentSchema.parse({
      title,
      description,
      category,
    })

    // Check for duplicates before proceeding
    const duplicateValidation = await validateDocumentUniqueness(
      validatedData.title,
      validatedData.description,
      validatedData.category
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

    let imageUrl: string | null = null

    // Handle image upload if provided
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

      // Generate unique filename
      const fileExtension = image.name.split('.').pop()
      const filename = `${uuidv4()}.${fileExtension}`
      
      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'uploads')
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch {
        // Directory might already exist, continue
      }

      // Save file
      const filepath = join(uploadsDir, filename)
      const buffer = Buffer.from(await image.arrayBuffer())
      await writeFile(filepath, buffer)

      imageUrl = `/uploads/${filename}`
      // imagePath = filepath // Used for cleanup on document deletion - TODO: implement cleanup
    }

    // Create document in database
    const document = await prisma.document.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        imageUrl,
        // Get user ID from session
        authorId: session.user.id,
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
      message: 'Document created successfully',
      document,
    }, { status: 201 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues || error.message },
        { status: 400 }
      )
    }
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
