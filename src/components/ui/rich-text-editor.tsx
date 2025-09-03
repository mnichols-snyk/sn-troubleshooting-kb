'use client'

import { useState, useRef, useCallback } from 'react'
import { z } from 'zod'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
}

const imageUploadSchema = z.object({
  url: z.string(),
  filename: z.string(),
  originalName: z.string()
})

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your content...", 
  disabled = false,
  error 
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertTextAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.substring(0, start) + text + value.substring(end)
    
    onChange(newValue)
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }, [value, onChange])

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      // Client-side validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG and PNG images are allowed')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image')
      }

      // Validate response
      const uploadedImage = imageUploadSchema.parse(result)

      // Insert image markdown at cursor position
      const imageMarkdown = `\n![${uploadedImage.originalName}](${uploadedImage.url})\n`
      insertTextAtCursor(imageMarkdown)

    } catch (error) {
      console.error('Image upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleImageUpload(imageFile)
    }
  }

  const insertFormatting = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let insertText = ''
    switch (format) {
      case 'bold':
        insertText = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        insertText = `*${selectedText || 'italic text'}*`
        break
      case 'code':
        insertText = `\`${selectedText || 'code'}\``
        break
      case 'heading':
        insertText = `\n## ${selectedText || 'Heading'}\n`
        break
      case 'list':
        insertText = `\n- ${selectedText || 'List item'}\n`
        break
    }

    insertTextAtCursor(insertText)
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-t-md">
        <button
          type="button"
          onClick={() => insertFormatting('bold')}
          disabled={disabled || isUploading}
          className="px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('italic')}
          disabled={disabled || isUploading}
          className="px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('code')}
          disabled={disabled || isUploading}
          className="px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          title="Code"
        >
          {'<>'}
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('heading')}
          disabled={disabled || isUploading}
          className="px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('list')}
          disabled={disabled || isUploading}
          className="px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          title="List"
        >
          • List
        </button>
        
        <div className="border-l border-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
          title="Insert Image"
        >
          {isUploading ? (
            <>
              <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></div>
              Uploading...
            </>
          ) : (
            <>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Image
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isUploading}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`w-full px-3 py-2 border rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[200px] font-mono text-sm ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled || isUploading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        />
        
        {/* Drag overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
            Drag & drop images here or use the toolbar
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {uploadError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {uploadError}
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p><strong>Formatting:</strong> Use **bold**, *italic*, `code`, ## headings, and - lists</p>
        <p><strong>Images:</strong> JPEG/PNG only, max 5MB. Images are inserted as markdown.</p>
      </div>
    </div>
  )
}
