'use client'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FcGoogle } from 'react-icons/fc'

export default function SignIn() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/') // Redirect to home if already signed in
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      // Use redirect: true to let NextAuth handle the redirect properly
      await signIn('google', {
        callbackUrl: '/',
        redirect: true,
      })
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">MetaCert</h1>
          <p className="text-stone-300 text-lg mb-8">Educational credentials on your wallet</p>
          
          <div className="bg-stone-800 rounded-xl p-8 shadow-2xl border border-stone-600">
            <h2 className="text-2xl font-semibold text-white mb-6">Sign in to continue</h2>
            <p className="text-stone-400 mb-8">Access your dashboard and manage your digital certificates</p>
            
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-gray-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <FcGoogle className="text-xl" />
              )}
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-stone-500 text-sm">
                By signing in, you agree to our terms of service and privacy policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}