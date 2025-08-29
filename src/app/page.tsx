'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { AddDocumentModal } from '@/components/documents/add-document-modal'
import DocumentBrowser from '@/components/documents/document-browser'

export default function Home() {
  const { data: session, status } = useSession()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isEditor = (session?.user as any)?.role === 'EDITOR'

  const handleDocumentCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--snyk-gray-50)'}}>
      {/* Header */}
      <header className="snyk-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">
                Snyk ServiceNow Troubleshooting Knowledge Base
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {status === 'loading' ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-white">
                    Welcome, {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    (session.user as any).name || (session.user as any).email}
                    <span className="ml-1 snyk-badge snyk-badge-success">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                      (session.user as any).role}
                    </span>
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-white hover:text-gray-200 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    href="/auth/signin"
                    className="text-sm text-white hover:text-gray-200 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="snyk-button-secondary text-sm"
                    style={{background: 'var(--snyk-white)', color: 'var(--snyk-primary)'}}
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
        <div className="snyk-card">
          <div className="px-6 py-4" style={{borderBottom: '1px solid var(--snyk-gray-200)'}}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium" style={{color: 'var(--snyk-gray-900)'}}>
                Documentation
              </h2>
              
              <div className="flex space-x-3">
                {/* Export Button */}
                <button
                  onClick={() => window.open('/api/export', '_blank')}
                  className="snyk-button-secondary inline-flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export to Doc
                </button>

                {/* Add Document Button - Only for Editors */}
                {isEditor && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="snyk-button-primary inline-flex items-center"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Documentation
                  </button>
                )}
              </div>
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

      <footer className="text-center mt-8" style={{color: 'var(--snyk-gray-500)'}}>
        <p>&copy; 2025 Snyk Support. Information based on Snyk Integration with ServiceNow User Guide 3.2.0.</p>
      </footer>
    </div>
  )
}
