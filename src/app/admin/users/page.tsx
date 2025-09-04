'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  role: 'EDITOR' | 'VIEWER'
  createdAt: string
  _count: {
    documents: number
  }
}

export default function UserManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    
    if (status === 'loading') return

    if (!session) {
      console.log('No session found, redirecting to login')
      router.push('/auth/signin?message=Please sign in to access this page')
      return
    }

    console.log('User role:', session.user.role)
    if (session.user.role !== 'EDITOR') {
      console.log('User is not an editor, redirecting')
      router.push('/?message=Access denied. Admin access required.')
      return
    }

    console.log('Fetching users...')
    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', response.status, errorData)
        
        if (response.status === 403) {
          setError('Access denied. Admin privileges required.')
        } else {
          setError(`Failed to load users: ${errorData.error || 'Unknown error'}`)
        }
        return
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Network error fetching users:', error)
      setError('Network error: Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingUserId(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      // Remove user from local state
      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setDeletingUserId(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-slate-400 mt-2">Manage system users and their access</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/auth/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Add New User
              </Link>
              <Link
                href="/"
                className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ← Back to KB
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-slate-300 font-medium">Name</th>
                  <th className="pb-3 text-slate-300 font-medium">Email</th>
                  <th className="pb-3 text-slate-300 font-medium">Role</th>
                  <th className="pb-3 text-slate-300 font-medium">Documents</th>
                  <th className="pb-3 text-slate-300 font-medium">Created</th>
                  <th className="pb-3 text-slate-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/50">
                    <td className="py-4 text-white">{user.name}</td>
                    <td className="py-4 text-slate-300">{user.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'EDITOR' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 text-slate-300">{user._count.documents}</td>
                    <td className="py-4 text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      {user.id !== session?.user.id ? (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={deletingUserId === user.id}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                        >
                          {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                        </button>
                      ) : (
                        <span className="text-slate-500 text-sm">Current User</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
