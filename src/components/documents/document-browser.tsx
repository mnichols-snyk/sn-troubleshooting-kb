'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { EditDocumentModal } from './edit-document-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

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

export function DocumentBrowser({ onRefresh, refreshTrigger }: DocumentBrowserProps) {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('')
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null)

  const fetchDocuments = async () => {
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
  }

  useEffect(() => {
    fetchDocuments()
  }, [refreshTrigger])

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

  // Find first category with search results
  const searchResultCategory = searchQuery && filteredDocuments.length > 0
    ? filteredDocuments[0].category
    : activeTab

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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && categories.length > 0 && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === category
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category}
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
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
              <p className="text-gray-500">No documents found matching "{searchQuery}"</p>
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

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">{document.title}</h3>
          <div className="flex items-center space-x-2">
            {isEditor && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.()
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit document"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.()
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete document"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
            <svg
              className={`h-5 w-5 text-gray-500 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 py-3 bg-white">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{document.description}</p>
            
            {document.imageUrl && (
              <div className="mt-4">
                <img
                  src={document.imageUrl}
                  alt={document.title}
                  className="max-w-full h-auto rounded-md border border-gray-200"
                />
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            Created by {document.author.name || document.author.email} on{' '}
            {new Date(document.createdAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  )
}
