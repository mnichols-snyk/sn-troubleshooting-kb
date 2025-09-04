import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Pool } from 'pg'

// GET - List all users (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'EDITOR') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const connectionString = process.env.DATABASE_URL?.replace(/\?.*$/, '') // Remove query params for pg
    const isLocalhost = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1')
    
    const pool = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false }
    })

    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u."createdAt",
        COUNT(d.id) as document_count
      FROM users u
      LEFT JOIN documents d ON u.id = d."authorId"
      GROUP BY u.id, u.email, u.name, u.role, u."createdAt"
      ORDER BY u."createdAt" DESC
    `)

    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      createdAt: row.createdAt,
      _count: {
        documents: parseInt(row.document_count)
      }
    }))

    await pool.end()

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
