import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DuplicateGroup {
  title: string
  documents: Array<{
    id: string
    title: string
    description: string
    category: string
    createdAt: Date
  }>
}

// Function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  
  return matrix[str2.length][str1.length]
}

async function findDuplicates() {
  console.log('🔍 Analyzing documents for duplicates...\n')
  
  const documents = await prisma.document.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      createdAt: true
    },
    orderBy: {
      title: 'asc'
    }
  })
  
  console.log(`📄 Found ${documents.length} total documents\n`)
  
  const duplicateGroups: DuplicateGroup[] = []
  const processed = new Set<string>()
  
  for (let i = 0; i < documents.length; i++) {
    if (processed.has(documents[i].id)) continue
    
    const currentDoc = documents[i]
    const similarDocs = [currentDoc]
    processed.add(currentDoc.id)
    
    // Check for similar titles (85% similarity threshold)
    for (let j = i + 1; j < documents.length; j++) {
      if (processed.has(documents[j].id)) continue
      
      const similarity = calculateSimilarity(
        currentDoc.title.toLowerCase().trim(),
        documents[j].title.toLowerCase().trim()
      )
      
      if (similarity >= 0.85) {
        similarDocs.push(documents[j])
        processed.add(documents[j].id)
      }
    }
    
    if (similarDocs.length > 1) {
      duplicateGroups.push({
        title: currentDoc.title,
        documents: similarDocs
      })
    }
  }
  
  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicates found!')
    return
  }
  
  console.log(`🚨 Found ${duplicateGroups.length} groups of duplicate documents:\n`)
  
  duplicateGroups.forEach((group, index) => {
    console.log(`${index + 1}. "${group.title}" (${group.documents.length} duplicates):`)
    group.documents.forEach((doc, docIndex) => {
      console.log(`   ${docIndex + 1}. ID: ${doc.id}`)
      console.log(`      Title: "${doc.title}"`)
      console.log(`      Category: ${doc.category}`)
      console.log(`      Created: ${doc.createdAt.toLocaleDateString()}`)
      console.log(`      Description: ${doc.description.substring(0, 100)}...`)
      console.log()
    })
    console.log('---\n')
  })
  
  return duplicateGroups
}

async function removeDuplicates(duplicateGroups: DuplicateGroup[]) {
  console.log('🗑️  Removing duplicate documents (keeping the oldest one in each group)...\n')
  
  let removedCount = 0
  
  for (const group of duplicateGroups) {
    // Sort by creation date (oldest first)
    const sortedDocs = group.documents.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    const keepDoc = sortedDocs[0]
    const docsToRemove = sortedDocs.slice(1)
    
    console.log(`📌 Keeping: "${keepDoc.title}" (ID: ${keepDoc.id})`)
    
    for (const doc of docsToRemove) {
      try {
        await prisma.document.delete({
          where: { id: doc.id }
        })
        console.log(`   ❌ Removed: "${doc.title}" (ID: ${doc.id})`)
        removedCount++
      } catch (error) {
        console.error(`   ⚠️  Failed to remove: "${doc.title}" (ID: ${doc.id})`, error)
      }
    }
    console.log()
  }
  
  console.log(`✅ Removed ${removedCount} duplicate documents`)
}

async function main() {
  try {
    const duplicateGroups = await findDuplicates()
    
    if (duplicateGroups && duplicateGroups.length > 0) {
      console.log('Would you like to remove duplicates? (This will keep the oldest document in each group)')
      console.log('Run with --remove flag to actually remove duplicates\n')
      
      if (process.argv.includes('--remove')) {
        await removeDuplicates(duplicateGroups)
      } else {
        console.log('💡 To remove duplicates, run: npm run analyze-duplicates -- --remove')
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
