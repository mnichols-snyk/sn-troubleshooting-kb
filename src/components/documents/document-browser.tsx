'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { EditDocumentModal } from './edit-document-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

interface Document {
  id: string
  title: string
  description: string
  category: string
  imageUrl?: string
  createdAt: string
  author: {
    name: string | null
    email: string
  }
}

interface DocumentBrowserProps {
  onRefresh?: () => void
  refreshTrigger?: number
}

export default function DocumentBrowser({ refreshTrigger }: DocumentBrowserProps) {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('')
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/documents')
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      
      const data = await response.json()
      setDocuments(data)
      
      // Set active tab to first category if not set
      if (data.length > 0 && !activeTab) {
        setActiveTab(data[0].category)
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [refreshTrigger, fetchDocuments])

  const handleDelete = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      // Refresh the documents list
      fetchDocuments()
      setDeletingDocument(null)
    } catch (err) {
      console.error('Error deleting document:', err)
      // Could add error toast here
    }
  }

  // Group documents by category
  const documentsByCategory = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  const categories = Object.keys(documentsByCategory).sort()

  // Filter documents based on search query
  const filteredDocuments = searchQuery
    ? documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : documents

  // Group filtered documents by category for search results
  // const filteredDocumentsByCategory = filteredDocuments.reduce((acc, doc) => {
  //   if (!acc[doc.category]) {
  //     acc[doc.category] = []
  //   }
  //   acc[doc.category].push(doc)
  //   return acc
  // }, {} as Record<string, typeof documents>)

  // Find first category with search results
  // const searchResultCategory = searchQuery && filteredDocuments.length > 0
  //   ? Object.keys(filteredDocumentsByCategory).find(category => filteredDocumentsByCategory[category].length > 0)
  //   : activeTab

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading documents...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="font-medium">Error loading documents</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchDocuments}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
        <p className="text-gray-500">
          {session?.user?.role === 'EDITOR' 
            ? 'Create your first document using the + button above.'
            : 'Check back later for troubleshooting documentation.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="snyk-input block w-full pl-3 pr-12"
          style={{color: 'var(--snyk-gray-900)', background: 'var(--snyk-white)'}}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && categories.length > 0 && (
        <div style={{borderBottom: '1px solid var(--snyk-gray-200)'}}>
          <nav className="-mb-px flex space-x-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === category
                    ? 'text-white'
                    : 'border-transparent hover:border-gray-300'
                }`}
                style={{
                  borderBottomColor: activeTab === category ? 'var(--snyk-primary)' : 'transparent',
                  color: activeTab === category ? 'var(--snyk-primary)' : 'var(--snyk-gray-500)'
                }}
              >
                {category}
                <span className="ml-2 snyk-badge snyk-badge-primary">
                  {documentsByCategory[category]?.length || 0}
                </span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Documents Display */}
      <div className="space-y-4">
        {searchQuery ? (
          // Search Results
          filteredDocuments.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Search Results ({filteredDocuments.length})
              </h3>
              {filteredDocuments.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No documents found matching &quot;{searchQuery}&quot;</p>
            </div>
          )
        ) : (
          // Category View
          activeTab && documentsByCategory[activeTab] && (
            <div>
              {documentsByCategory[activeTab].map((doc) => (
                <DocumentCard 
                  key={doc.id} 
                  document={doc} 
                  onEdit={() => setEditingDocument(doc)}
                  onDelete={() => setDeletingDocument(doc)}
                  isEditor={session?.user?.role === 'EDITOR'}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Edit Modal */}
      <EditDocumentModal
        isOpen={!!editingDocument}
        onClose={() => setEditingDocument(null)}
        onSuccess={() => {
          fetchDocuments()
          setEditingDocument(null)
        }}
        document={editingDocument}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingDocument}
        onClose={() => setDeletingDocument(null)}
        onConfirm={() => deletingDocument && handleDelete(deletingDocument)}
        title="Delete Document"
        message={`Are you sure you want to delete "${deletingDocument?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  )
}

interface DocumentCardProps {
  document: Document
  onEdit?: () => void
  onDelete?: () => void
  isEditor?: boolean
}

function DocumentCard({ document, onEdit, onDelete, isEditor }: DocumentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    // Only expand if clicking on the card itself, not on action buttons
    const target = e.target as HTMLElement
    if (!target.closest('button[data-action]')) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div className="snyk-card mb-4 overflow-hidden">
      <div
        onClick={handleCardClick}
        className="w-full px-4 py-3 cursor-pointer transition-colors"
        style={{
          background: 'var(--snyk-gray-50)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--snyk-gray-100)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--snyk-gray-50)'}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-medium" style={{color: 'var(--snyk-gray-900)'}}>{document.title}</h3>
          <div className="flex items-center space-x-2">
            {isEditor && (
              <>
                <button
                  data-action="edit"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.()
                  }}
                  className="p-1 transition-colors"
                  style={{color: 'var(--snyk-gray-400)'}}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--snyk-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--snyk-gray-400)'}
                  title="Edit document"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  data-action="delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.()
                  }}
                  className="p-1 transition-colors"
                  style={{color: 'var(--snyk-gray-400)'}}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--snyk-error)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--snyk-gray-400)'}
                  title="Delete document"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
            <svg
              className={`h-5 w-5 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              style={{color: 'var(--snyk-gray-500)'}}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 py-3" style={{background: 'var(--snyk-white)'}}>
          <MarkdownRenderer 
            content={document.description}
            className="max-w-none"
          />
          
          {document.imageUrl && (
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={document.imageUrl}
                alt={document.title}
                className="max-w-full h-auto rounded-md"
                style={{border: '1px solid var(--snyk-gray-200)'}}
              />
            </div>
          )}
          
          <div className="mt-4 pt-3 text-xs" style={{borderTop: '1px solid var(--snyk-gray-100)', color: 'var(--snyk-gray-500)'}}>
            Created by {document.author.name || document.author.email} on{' '}
            {new Date(document.createdAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  )
}
