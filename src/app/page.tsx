'use client'
import Navbar from './components/Navbar'
import Body from './components/Body'
import AuthGuard from './components/AuthGuard'

export default function Home() {
  return (
    <AuthGuard>
      <Navbar />
      <Body />
    </AuthGuard>
  )
}
