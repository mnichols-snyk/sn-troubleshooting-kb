'use client'

import { useMemo } from 'react'
import DOMPurify from 'isomorphic-dompurify'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderedContent = useMemo(() => {
    // Simple markdown parser with security focus
    const html = content
      // Escape HTML first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      
      // Convert markdown to HTML
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-2 text-gray-900">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      
      // Handle images with security validation
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        // Security: Only allow our own uploaded images
        if (!src.startsWith('/api/files/')) {
          return `[Image: ${alt || 'Invalid source'}]`
        }
        
        // Validate filename format (UUID_name.ext)
        const filename = src.replace('/api/files/', '')
        const isValidFilename = /^[a-f0-9-]{36}_[a-zA-Z0-9_.-]+\.(jpg|jpeg|png)$/i.test(filename)
        
        if (!isValidFilename) {
          return `[Image: ${alt || 'Invalid filename'}]`
        }
        
        return `<div class="my-4">
          <img 
            src="${src}" 
            alt="${alt || 'Screenshot'}" 
            class="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
            loading="lazy"
            style="max-height: 500px; object-fit: contain;"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
          />
          <div class="hidden text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded p-2 mt-2">
            Image failed to load: ${alt || 'Screenshot'}
          </div>
        </div>`
      })
      
      // Convert line breaks to paragraphs
      .split('\n\n')
      .map(paragraph => {
        paragraph = paragraph.trim()
        if (!paragraph) return ''
        
        // Don't wrap headings, lists, or images in paragraphs
        if (paragraph.startsWith('<h') || 
            paragraph.startsWith('<li') || 
            paragraph.startsWith('<div class="my-4">')) {
          return paragraph
        }
        
        return `<p class="mb-3 text-gray-700 leading-relaxed">${paragraph}</p>`
      })
      .join('')
      
      // Wrap list items in ul tags
      .replace(/(<li[^>]*>.*?<\/li>)/g, '<ul class="list-disc list-inside mb-3 space-y-1">$1</ul>')

    // Sanitize HTML to prevent XSS
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'h2', 'h3', 'strong', 'em', 'code', 'ul', 'li', 'img', 'div'
      ],
      ALLOWED_ATTR: [
        'class', 'src', 'alt', 'loading', 'style', 'onerror'
      ],
      ALLOWED_URI_REGEXP: /^\/api\/files\/[a-f0-9-]{36}_[a-zA-Z0-9_.-]+\.(jpg|jpeg|png)$/i
    })
  }, [content])

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  )
}
