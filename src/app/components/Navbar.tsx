'use client'
import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <nav className="bg-blue-400 py-2 z-[40] shadow-xl fixed w-full bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a
              href="/"
              className="text-xl font-bold text-gray-800 flex items-center gap-2"
            >
              <img src="./certified.png" alt="MetaCert Logo" className="w-8 h-8" />
              MetaCert
            </a>
          </div>

          {/* Center section - Navigation Links */}
          <div className="hidden sm:flex items-center space-x-8">
            <a
              href="/"
              className="border-b-2 border-transparent text-black hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors"
            >
              Home
            </a>
            <a
              href="/issuer"
              className="border-b-2 border-transparent text-black hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors"
            >
              Issuer
            </a>
            <a
              href="/student"
              className="border-b-2 border-transparent text-black hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors"
            >
              Student
            </a>
          </div>

          {/* Right section - Wallet, User Info, and Sign Out */}
          <div className="flex items-center gap-4">
            {/* Wallet Connection */}
            <div>
              <ConnectButton
                label="Connect Wallet"
                chainStatus="icon"
                showBalance={false}
              />
            </div>

            {session && (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                  )}
                  <span className="text-gray-800 text-sm font-medium hidden md:block">
                    {session.user?.name}
                  </span>
                </div>
                
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
