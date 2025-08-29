'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { z } from 'zod'

interface Document {
  id: string
  title: string
  description: string
  category: string
  imageUrl?: string
}

interface EditDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  document: Document | null
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

export function EditDocumentModal({ isOpen, onClose, onSuccess, document }: EditDocumentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  })
  const [image, setImage] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when document changes
  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        description: document.description,
        category: document.category,
      })
      setImage(null)
      setRemoveImage(false)
      setErrors({})
    }
  }, [document])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!document) return

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
      
      if (removeImage) {
        submitData.append('removeImage', 'true')
      }

      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PUT',
        body: submitData,
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.details) {
          // Handle Zod validation errors
          const fieldErrors: Record<string, string> = {}
          result.details.forEach((error: any) => {
            fieldErrors[error.path[0]] = error.message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: result.error || 'Failed to update document' })
        }
        return
      }

      // Success - close modal and refresh
      onSuccess()
      onClose()

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          fieldErrors[err.path[0] as string] = err.message
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
      setRemoveImage(false) // Cancel remove if uploading new image
      setErrors(prev => ({ ...prev, image: '' }))
    }
  }

  if (!document) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Documentation">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.general}
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

        {/* Current Image Display */}
        {document.imageUrl && !removeImage && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Image
            </label>
            <div className="relative">
              <img
                src={document.imageUrl}
                alt={document.title}
                className="max-w-xs h-auto rounded-md border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setRemoveImage(true)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Image Removal Notice */}
        {removeImage && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p className="text-sm">Image will be removed when you save.</p>
            <button
              type="button"
              onClick={() => setRemoveImage(false)}
              className="text-sm underline hover:no-underline"
            >
              Keep image
            </button>
          </div>
        )}

        {/* File Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            {document.imageUrl && !removeImage ? 'Replace Image' : 'Add Image'} (Optional)
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
              New image: {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
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
            {isSubmitting ? 'Updating...' : 'Update Document'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
