'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import { useRouter } from 'next/navigation'
type CryptoAddress = `0x${string}`

interface StudentDetailsFormProps {
  onSubmit: (details: { name: string; address1: CryptoAddress }) => void
  onClose: () => void
  name: string
}

export const StudDetailsPopUp: React.FC<StudentDetailsFormProps> = ({
  onSubmit,
  onClose,
  name,
}) => {
  const router = useRouter()
  const [studname, setStudname] = useState(name)
  const { address, isConnecting, isDisconnected } = useAccount()
  const address1: CryptoAddress = address ? address : '0x'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      onSubmit({ name: studname, address1 })
    } catch (error) {
      console.error('Error submitting student details:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">
          Student Registration
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="studentname" className="text-sm font-semibold text-gray-200">
                Student Name:
              </label>
              <Input
                id="studentname"
                value={studname}
                onChange={(e) => setStudname(e.target.value)}
                placeholder="Enter your full name"
                className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="walletaddress" className="text-sm font-semibold text-gray-200">
                Wallet Address:
              </label>
              <Input 
                id="walletaddress" 
                value={address || ''} 
                disabled 
                className="bg-gray-600/50 border-gray-500 text-gray-300 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button 
              type="button"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Register Student
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
