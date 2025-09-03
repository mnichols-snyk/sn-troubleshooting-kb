'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { z } from 'zod'

interface AddDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const documentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
})

const categories = [
  'Installation',
  'Configuration',
  'Troubleshooting',
  'Integration',
  'API',
  'Security',
  'Performance',
  'Best Practices'
]

export function AddDocumentModal({ isOpen, onClose, onSuccess }: AddDocumentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  })
  const [image, setImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [duplicateSuggestions, setDuplicateSuggestions] = useState<Array<{ id: string; title: string; description: string; category: string; similarity: number }>>([])
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form data
      documentSchema.parse(formData)

      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      
      if (image) {
        submitData.append('image', image)
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: submitData,
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.isDuplicateError) {
          // Handle duplicate validation errors
          setErrors({ general: result.error })
          setDuplicateSuggestions(result.suggestions || [])
          setShowDuplicateWarning(true)
        } else if (result.details) {
          // Handle Zod validation errors
          const fieldErrors: Record<string, string> = {}
          result.details.forEach((error: { path: string[]; message: string }) => {
            fieldErrors[error.path[0]] = error.message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: result.error || 'Failed to create document' })
        }
        return
      }

      // Success - reset form and close modal
      setFormData({ title: '', description: '', category: '' })
      setImage(null)
      setDuplicateSuggestions([])
      setShowDuplicateWarning(false)
      onSuccess()
      onClose()

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          fieldErrors[String(err.path[0])] = err.message
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ general: 'An unexpected error occurred' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setErrors({ image: 'Only JPEG, PNG, GIF, and WebP images are allowed' })
        return
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: 'File size must be less than 5MB' })
        return
      }
      
      setImage(file)
      setErrors(prev => ({ ...prev, image: '' }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Documentation">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className={`border px-4 py-3 rounded ${
            showDuplicateWarning 
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {showDuplicateWarning ? (
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {showDuplicateWarning ? 'Duplicate Content Detected' : 'Error'}
                </p>
                <p className="text-sm mt-1">{errors.general}</p>
                {showDuplicateWarning && duplicateSuggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Similar documents found:</p>
                    <div className="space-y-2">
                      {duplicateSuggestions.slice(0, 3).map((suggestion) => (
                        <div key={suggestion.id} className="bg-yellow-100 p-2 rounded text-xs">
                          <p className="font-medium">{suggestion.title}</p>
                          <p className="text-yellow-700">Category: {suggestion.category}</p>
                          <p className="text-yellow-600">{Math.round(suggestion.similarity * 100)}% similar</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs mt-2 text-yellow-700">
                      💡 Consider updating one of these existing documents instead of creating a new one.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Dropdown */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter document title"
            required
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description Textarea */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter detailed description or instructions"
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Screenshot (Optional)
          </label>
          <input
            type="file"
            id="image"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {image && (
            <p className="mt-1 text-sm text-gray-600">
              Selected: {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Document'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
