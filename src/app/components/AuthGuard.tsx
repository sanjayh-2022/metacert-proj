'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  allowedRoles?: string[]
}

export default function AuthGuard({ children, allowedRoles = [] }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // If roles are specified and user doesn't have the required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user?.role || 'student')) {
      router.push('/unauthorized')
      return
    }
  }, [session, status, router, allowedRoles])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-stone-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-stone-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user?.role || 'student')) {
    return (
      <div className="min-h-screen bg-stone-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Unauthorized access</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}