import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check database connection
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      session: session,
      database: {
        connected: true,
        userCount,
        users
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Debug failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}