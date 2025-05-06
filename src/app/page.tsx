'use client'
import Navbar from './components/Navbar'
import Body from './components/Body'
import { useSession } from 'next-auth/react'

function HomeContent() {
  const { data: session, status } = useSession()

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

  return (
    <>
      <Navbar />
      <Body />
    </>
  )
}

export default function Home() {
  return <HomeContent />
}
