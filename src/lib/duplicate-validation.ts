import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Function to calculate similarity between two strings using Levenshtein distance
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

// Normalize text for comparison (remove extra spaces, convert to lowercase, etc.)
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ')
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  similarDocuments: Array<{
    id: string
    title: string
    description: string
    category: string
    similarity: number
  }>
  message?: string
}

export async function checkForDuplicates(
  title: string,
  description: string,
  category: string,
  excludeId?: string
): Promise<DuplicateCheckResult> {
  const normalizedTitle = normalizeText(title)
  const normalizedDescription = normalizeText(description)
  
  // Get all existing documents in the same category
  const existingDocuments = await prisma.document.findMany({
    where: {
      category: category,
      ...(excludeId && { id: { not: excludeId } })
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true
    }
  })
  
  const similarDocuments: Array<{
    id: string
    title: string
    description: string
    category: string
    similarity: number
  }> = []
  
  for (const doc of existingDocuments) {
    const normalizedExistingTitle = normalizeText(doc.title)
    const normalizedExistingDescription = normalizeText(doc.description)
    
    // Check title similarity (85% threshold for high similarity)
    const titleSimilarity = calculateSimilarity(normalizedTitle, normalizedExistingTitle)
    
    // Check description similarity (75% threshold for content similarity)
    const descriptionSimilarity = calculateSimilarity(normalizedDescription, normalizedExistingDescription)
    
    // Consider it a potential duplicate if:
    // 1. Title is very similar (85%+) OR
    // 2. Both title and description are moderately similar (70%+ each)
    const isHighTitleSimilarity = titleSimilarity >= 0.85
    const isModerateSimilarity = titleSimilarity >= 0.70 && descriptionSimilarity >= 0.70
    
    if (isHighTitleSimilarity || isModerateSimilarity) {
      similarDocuments.push({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        similarity: Math.max(titleSimilarity, descriptionSimilarity)
      })
    }
  }
  
  // Sort by similarity (highest first)
  similarDocuments.sort((a, b) => b.similarity - a.similarity)
  
  const isDuplicate = similarDocuments.length > 0
  
  let message = ''
  if (isDuplicate) {
    const topMatch = similarDocuments[0]
    const similarityPercentage = Math.round(topMatch.similarity * 100)
    
    if (similarDocuments.length === 1) {
      message = `A similar document "${topMatch.title}" already exists (${similarityPercentage}% similar). Please update the existing document instead of creating a duplicate.`
    } else {
      message = `${similarDocuments.length} similar documents found. The most similar is "${topMatch.title}" (${similarityPercentage}% similar). Please update existing documents instead of creating duplicates.`
    }
  }
  
  return {
    isDuplicate,
    similarDocuments,
    message
  }
}

export async function validateDocumentUniqueness(
  title: string,
  description: string,
  category: string,
  excludeId?: string
): Promise<{ isValid: boolean; error?: string; suggestions?: Array<{ id: string; title: string; description: string; category: string; similarity: number }> }> {
  try {
    const duplicateCheck = await checkForDuplicates(title, description, category, excludeId)
    
    if (duplicateCheck.isDuplicate) {
      return {
        isValid: false,
        error: duplicateCheck.message,
        suggestions: duplicateCheck.similarDocuments
      }
    }
    
    return { isValid: true }
  } catch (error) {
    console.error('Error validating document uniqueness:', error)
    return {
      isValid: false,
      error: 'Unable to validate document uniqueness. Please try again.'
    }
  }
}
