import { Pool } from 'pg'

function createPool() {
  const connectionString = process.env.DATABASE_URL?.replace(/\?.*$/, '') // Remove query params for pg
  const isLocalhost = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1')
  
  return new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false }
  })
}

const pool = createPool()

export async function getDocuments() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        d.id,
        d.title,
        d.description,
        d.category,
        d.published,
        d."sortOrder",
        d."createdAt",
        d."updatedAt",
        u.name as "authorName",
        u.email as "authorEmail"
      FROM documents d
      LEFT JOIN users u ON d."authorId" = u.id
      WHERE d.published = true
      ORDER BY d.category, d."sortOrder", d.title
    `)
    return result.rows
  } finally {
    client.release()
  }
}

export async function getDocumentCount() {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT COUNT(*) as count FROM documents')
    return parseInt(result.rows[0].count)
  } finally {
    client.release()
  }
}

export async function findUserByEmail(email: string) {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function createPasswordResetToken(email: string, token: string, expires: Date) {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      INSERT INTO password_reset_tokens (id, email, token, expires, used, "createdAt")
      VALUES (gen_random_uuid(), $1, $2, $3, false, NOW())
      RETURNING *
    `, [email, token, expires])
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function findPasswordResetToken(token: string) {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM password_reset_tokens WHERE token = $1', [token])
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function resetUserPassword(email: string, hashedPassword: string, token: string) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    // Update user password
    await client.query(`
      UPDATE users 
      SET password = $1, "updatedAt" = NOW() 
      WHERE email = $2
    `, [hashedPassword, email])
    
    // Mark token as used
    await client.query(`
      UPDATE password_reset_tokens 
      SET used = true 
      WHERE token = $1
    `, [token])
    
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
