'use client'
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import Web3Provider from './Web3Provider'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <Web3Provider>
        {children}
      </Web3Provider>
    </SessionProvider>
  )
}