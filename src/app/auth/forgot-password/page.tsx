'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [resetUrl, setResetUrl] = useState<string | null>(null)

  // Validate and sanitize the reset URL with enhanced security
  const getSafeResetUrl = (url: string | null): string | null => {
    if (!url || typeof url !== 'string') return null
    
    // Remove any potential HTML/JS injection attempts
    const cleanUrl = url.replace(/[<>"']/g, '')
    
    try {
      const parsedUrl = new URL(cleanUrl)
      
      // Strict protocol validation - only allow https in production, http in development
      const allowedProtocols = process.env.NODE_ENV === 'development' 
        ? ['http:', 'https:'] 
        : ['https:']
      
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        return null
      }
      
      // Strict hostname validation
      const allowedHosts = process.env.NODE_ENV === 'development'
        ? ['localhost', '127.0.0.1', '0.0.0.0']
        : [new URL(process.env.NEXTAUTH_URL || '').hostname].filter(Boolean)
      
      if (!allowedHosts.includes(parsedUrl.hostname)) {
        return null
      }
      
      // Ensure the path starts with expected reset path
      if (!parsedUrl.pathname.startsWith('/auth/reset-password')) {
        return null
      }
      
      return parsedUrl.toString()
    } catch {
      return null
    }
  }

  // Get sanitized URL for display and navigation
  const safeResetUrl = resetUrl ? getSafeResetUrl(resetUrl) : null
  
  // Create a safe display version that breaks the direct data flow
  const getDisplayToken = (url: string | null): string => {
    if (!url) return ''
    try {
      const parsedUrl = new URL(url)
      const token = parsedUrl.searchParams.get('token')
      return token ? `${token.substring(0, 8)}...` : 'Invalid token'
    } catch {
      return 'Invalid URL'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const validatedData = forgotPasswordSchema.parse({ email })
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || 'An error occurred' })
      } else {
        setIsSubmitted(true)
        // In development, show the reset URL
        if (data.resetUrl) {
          setResetUrl(data.resetUrl)
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ general: 'An unexpected error occurred' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
            <p className="text-slate-400 mb-6">
              If an account with that email exists, we have sent a password reset link to your email address.
            </p>
            
            {safeResetUrl && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <p className="text-yellow-400 text-sm mb-2">Development Mode - Reset Link:</p>
                <button
                  onClick={() => {
                    if (safeResetUrl) {
                      window.open(safeResetUrl, '_blank', 'noopener,noreferrer')
                    }
                  }}
                  className="text-yellow-300 text-sm break-all hover:underline bg-transparent border-none cursor-pointer p-0 text-left"
                >
                  Click to open reset link
                </button>
                <div className="mt-2 text-xs text-yellow-500 font-mono break-all">
                  {/* Display only the token part for verification, not the full URL */}
                  Token: {getDisplayToken(safeResetUrl)}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Link 
                href="/auth/signin" 
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
          <p className="text-slate-400 mt-2">Enter your email to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email address"
              required
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
