import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Get all users (without passwords)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    // Test password for mark.nichols@snyk.io
    const markUser = await prisma.user.findUnique({
      where: { email: 'mark.nichols@snyk.io' },
      select: { password: true }
    })

    let passwordTest = null
    if (markUser) {
      const testPassword = 'servicenow1234'
      passwordTest = {
        password_matches: await bcrypt.compare(testPassword, markUser.password),
        admin_password_env: process.env.ADMIN_PASSWORD
      }
    }

    return NextResponse.json({
      users,
      mark_user_exists: !!markUser,
      password_test: passwordTest
    })
  } catch (error) {
    console.error('Error checking users:', error)
    return NextResponse.json(
      { error: 'Failed to check users' },
      { status: 500 }
    )
  }
}
