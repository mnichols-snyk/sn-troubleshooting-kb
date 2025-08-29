'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Snyk & ServiceNow AppVR Integration</h1>
            <p className="text-lg text-indigo-300 mt-2">Your go-to guide for installation, troubleshooting, and known behaviors.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-slate-300">
                  Welcome, {session.user.name || session.user.email}
                </span>
                <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded">
                  {session.user.role}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search for topics like 'OAuth failures'..."
            className="w-full p-4 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Main Content */}
        <main className="bg-slate-900/50 backdrop-blur-sm ring-1 ring-white/10 p-6 md:p-8 rounded-2xl shadow-lg">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-700 mb-6">
            <button className="text-lg font-medium py-3 px-6 border-b-2 border-indigo-400 text-white transition hover:text-white">
              Installation
            </button>
            <button className="text-lg font-medium py-3 px-6 border-b-2 border-transparent text-slate-400 transition hover:text-white">
              Troubleshooting
            </button>
            <button className="text-lg font-medium py-3 px-6 border-b-2 border-transparent text-slate-400 transition hover:text-white">
              Known Behaviors
            </button>
          </div>

          {/* Content Placeholder */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-medium text-white mb-4">Welcome to the Knowledge Base</h3>
              <p className="text-slate-300 mb-4">
                This is the foundation of your Snyk ServiceNow troubleshooting knowledge base. 
                {session?.user.role === 'EDITOR' ? (
                  <span className="text-indigo-300"> As an Editor, you can manage content and add new documentation.</span>
                ) : (
                  <span className="text-slate-400"> Sign in as an Editor to manage content.</span>
                )}
              </p>
              
              {session?.user.role === 'EDITOR' && (
                <div className="mt-4">
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                    + Add New Documentation
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-medium text-white mb-4">Sprint 1 Complete</h3>
              <p className="text-slate-300">
                The foundation has been established with:
              </p>
              <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1">
                <li>Next.js project with TypeScript and Tailwind CSS</li>
                <li>PostgreSQL database with Docker configuration</li>
                <li>User authentication with NextAuth.js</li>
                <li>Role-based access control (Editor/Viewer)</li>
                <li>File upload service for images</li>
                <li>Database schema with Users and Documents tables</li>
              </ul>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-8 text-slate-400">
          <p>&copy; 2025 Snyk Support. Information based on Snyk Integration with ServiceNow User Guide 3.2.0.</p>
        </footer>
      </div>
    </div>
  )
}
