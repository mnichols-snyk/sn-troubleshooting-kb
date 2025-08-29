import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

export async function GET() {
  try {
    // Fetch all published documents
    const documents = await prisma.document.findMany({
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
        { createdAt: 'desc' },
      ],
    })

    // Group documents by category
    const documentsByCategory = documents.reduce((acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = []
      }
      acc[doc.category].push(doc)
      return acc
    }, {} as Record<string, typeof documents>)

    // Create document sections
    const docSections = []

    // Title page
    docSections.push(
      new Paragraph({
        text: 'Snyk ServiceNow Troubleshooting Knowledge Base',
        heading: HeadingLevel.TITLE,
      }),
      new Paragraph({
        text: `Generated on ${new Date().toLocaleDateString()}`,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: 'This document contains troubleshooting information and best practices for Snyk ServiceNow integration.',
        spacing: { after: 600 },
      })
    )

    // Add each category
    Object.keys(documentsByCategory).sort().forEach((category) => {
      // Category heading
      docSections.push(
        new Paragraph({
          text: category,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      )

      // Add documents in this category
      documentsByCategory[category].forEach((doc) => {
        // Document title
        docSections.push(
          new Paragraph({
            text: doc.title,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          })
        )

        // Document description
        const descriptionParagraphs = doc.description.split('\n').filter(line => line.trim())
        descriptionParagraphs.forEach((paragraph) => {
          docSections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph,
                }),
              ],
              spacing: { after: 100 },
            })
          )
        })

        // Author and date info
        docSections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Created by: ${doc.author?.name || doc.author?.email || 'Unknown'} on ${new Date(doc.createdAt).toLocaleDateString()}`,
                italics: true,
                size: 20, // 10pt font
              }),
            ],
            spacing: { after: 200 },
          })
        )
      })
    })

    // Create the Word document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docSections,
        },
      ],
    })

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc)

    // Return the document as a download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="snyk-troubleshooting-kb-${new Date().toISOString().split('T')[0]}.docx"`,
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating export:', error)
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}
