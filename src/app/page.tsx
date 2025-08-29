'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { AddDocumentModal } from '@/components/documents/add-document-modal'
import { DocumentBrowser } from '@/components/documents/document-browser'

export default function Home() {
  const { data: session, status } = useSession()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const isEditor = session?.user?.role === 'EDITOR'

  const handleDocumentCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Snyk ServiceNow Troubleshooting Knowledge Base
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {status === 'loading' ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {session.user.name || session.user.email}
                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {session.user.role}
                    </span>
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    href="/auth/signin"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Documentation
              </h2>
              
              {/* Add Document Button - Only for Editors */}
              {isEditor && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Documentation
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <DocumentBrowser 
              refreshTrigger={refreshTrigger}
              onRefresh={handleDocumentCreated}
            />
          </div>
        </div>
      </main>

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleDocumentCreated}
      />

      <footer className="text-center mt-8 text-slate-400">
        <p>&copy; 2025 Snyk Support. Information based on Snyk Integration with ServiceNow User Guide 3.2.0.</p>
      </footer>
    </div>
  )
}
