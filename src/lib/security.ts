import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

export interface SecurityValidationResult {
  isValid: boolean
  error?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any
}

/**
 * Validates that the user is authenticated
 */
export async function validateAuthentication(): Promise<SecurityValidationResult> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return {
        isValid: false,
        error: 'Authentication required'
      }
    }

    return {
      isValid: true,
      user: session.user
    }
  } catch (_error) {
    return {
      isValid: false,
      error: 'Authentication validation failed'
    }
  }
}

/**
 * Validates that the user has Editor role
 */
export async function validateEditorRole(_request: NextRequest): Promise<SecurityValidationResult> {
  const authResult = await validateAuthentication()
  
  if (!authResult.isValid) {
    return authResult
  }

  if (authResult.user.role !== 'EDITOR') {
    return {
      isValid: false,
      error: 'Editor role required'
    }
  }

  return authResult
}

/**
 * Validates file upload security
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
    }
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File too large. Maximum size is 5MB.'
    }
  }

  // Check for potential malicious filenames
  const filename = file.name
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return {
      isValid: false,
      error: 'Invalid filename'
    }
  }

  return { isValid: true }
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Rate limiting check (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const current = requestCounts.get(ip)
  
  if (!current || current.resetTime < windowStart) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}
