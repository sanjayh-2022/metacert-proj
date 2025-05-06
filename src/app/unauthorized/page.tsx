'use client'
import { useRouter } from 'next/navigation'

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-stone-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="bg-stone-800 rounded-xl p-8 shadow-2xl border border-stone-600">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-stone-400 mb-6">
            You don&apos;t have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}