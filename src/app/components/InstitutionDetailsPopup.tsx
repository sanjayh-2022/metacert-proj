import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { getTransactionReceipt } from '@wagmi/core'
import { config } from './config'
import { abi } from './abi'
import Link from 'next/link'
// import ListenEvent from './listenEvent'

interface InstitutionDetailsFormProps {
  onSubmit: (details: {
    institutionId: string
    institutionname: string
    addressclg: string
    district: string
    address: string
  }) => void
  onClose: () => void
  name: string
}

export const InstitutionDetailsPopUp: React.FC<InstitutionDetailsFormProps> = ({
  onSubmit,
  onClose,
  name,
}) => {
  const [institutionId, setInstitutionId] = useState('')
  const [addressclg, setAddressclg] = useState('')
  const [district, setDistrict] = useState('')
  const [insname, setInsname] = useState(name)
  const { address, isConnecting, isDisconnected, isConnected } = useAccount()
  const [isHashReady, setIsHashReady] = useState(false)
  const [isLoads, setIsLoads] = useState(false)

  const router = useRouter()
  const { 
    data: hashd, 
    writeContract, 
    isPending,
    error: writeError,
    isSuccess: isWriteSuccess 
  } = useWriteContract()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    console.log('=== Form Submission Started ===')
    console.log('Wallet connected:', isConnected)
    console.log('Wallet address:', address)
    console.log('Form data:', { insname, addressclg, institutionId, district })
    
    // Check if wallet is connected
    if (!isConnected || !address) {
      alert('Please connect your wallet first!')
      console.error('Wallet not connected')
      return
    }
    
    // Validate all fields are filled
    if (!insname || !addressclg || !institutionId || !district) {
      alert('Please fill in all fields')
      console.error('Missing required fields')
      return
    }

    // Validate institutionId is a valid number
    if (isNaN(Number(institutionId)) || Number(institutionId) <= 0) {
      alert('Institution ID must be a valid positive number')
      console.error('Invalid institution ID:', institutionId)
      return
    }

    setIsLoads(true)
    console.log('Calling writeContract...')
    
    try {
      writeContract({
        address: '0xbFB014898E5f55d98136fCD3dB7964231113e5aF',
        abi,
        functionName: 'registerIssuer',
        args: [insname, addressclg, BigInt(institutionId), BigInt(1)],
      })
      console.log('writeContract called successfully, waiting for wallet confirmation...')
    } catch (error) {
      console.error('Error calling writeContract:', error)
      setIsLoads(false)
      alert('Error: ' + (error as Error).message)
    }
  }
 
  const {
    data: receipt,
    isLoading,
    isError,
  } = useWaitForTransactionReceipt({
    hash: hashd,
  })

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error('=== Write Contract Error ===')
      console.error(writeError)
      setIsLoads(false)
      alert('Transaction failed: ' + writeError.message)
      console.log(writeError.message)
    }
  }, [writeError])

  // Handle successful write
  useEffect(() => {
    if (isWriteSuccess && hashd) {
      console.log('=== Transaction Submitted ===')
      console.log('Transaction hash:', hashd)
    }
  }, [isWriteSuccess, hashd])

  useEffect(() => {
    if (receipt?.logs) {
      setIsLoads(false)
      setIsHashReady(true)
      console.log('=== Transaction Confirmed ===')
      console.log(receipt.logs)
      setTimeout(() => {
        router.push('/issuer')
      }, 3000)
    }
  }, [receipt, router])
  // const res = useTransactionReceipt({
  //   hash: hashd
  // });

  // console.log(res);

  // useEffect(() => {
  //   const m = async () => {
  //     console.log("test");
  //     const t = await getTransactionReceipt(config, {
  //       hash: await hashd,
  //     })

  //     console.log(await t);
  //   }
  //   m();
  // }, [hashd]);

  return (
    <div>
      {!isHashReady && (
        <div className="fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 p-8 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">
              Enter Institution Details
            </h2>
            {!isConnected && (
              <div className="mb-4 p-4 bg-yellow-800/30 border border-yellow-500 text-yellow-300 rounded-lg">
                ⚠️ Please connect your wallet to register
              </div>
            )}
            {isConnected && (
              <div className="mb-4 p-3 bg-green-800/30 border border-green-500 text-green-300 rounded-lg text-sm">
                ✓ Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="institutionName" className="text-sm font-semibold text-gray-200">Institution Name:</label>
                  <Input
                    id="institutionName"
                    value={insname}
                    onChange={(e) => setInsname(e.target.value)}
                    placeholder="Enter institution name"
                    className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="institutionId" className="text-sm font-semibold text-gray-200">Institution ID:</label>
                  <Input
                    id="institutionId"
                    type="number"
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    placeholder="Enter institution ID"
                    className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="address" className="text-sm font-semibold text-gray-200">Address:</label>
                  <Input
                    id="address"
                    value={addressclg}
                    onChange={(e) => setAddressclg(e.target.value)}
                    placeholder="Enter address"
                    className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="district" className="text-sm font-semibold text-gray-200">District:</label>
                  <Input
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Enter district"
                    className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-2 mt-4">
                <label htmlFor="walletAddress" className="text-sm font-semibold text-gray-200">Wallet Address:</label>
                <Input
                  id="walletAddress"
                  value={address || ''}
                  disabled
                  className="bg-gray-600/50 border-gray-500 text-gray-300 cursor-not-allowed"
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button 
                  type="button"
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg disabled:opacity-50 transition-colors duration-200" 
                  onClick={onClose}
                  disabled={isPending || isLoading || isLoads}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                  disabled={!isConnected || isPending || isLoading || isLoads}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Confirm in Wallet...
                    </div>
                  ) : (isLoading || isLoads) ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    'Register Institution'
                  )}
                </button>
              </div>
              {writeError && (
                <div className="mt-4 p-3 bg-red-800/30 border border-red-500 text-red-300 rounded-lg text-sm">
                  <strong>Error:</strong> {writeError.message}
                </div>
              )}
              {hashd && (
                <div className="mt-4 p-3 bg-blue-800/30 border border-blue-500 text-blue-300 rounded-lg">
                  <div className="text-sm font-semibold">Transaction Submitted!</div>
                  <div className="text-xs mt-1 break-all">Hash: {hashd}</div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {isHashReady && receipt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm z-50">
          <div className="bg-gray-800 border border-gray-600 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <h1 className="text-center text-xl font-bold text-white mb-4">
              🎉 Registration Successful!
            </h1>
            <p className="text-center text-gray-300 mb-4">
              Congratulations! You have successfully registered as an issuer.
            </p>
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 mb-6">
              <h2 className="text-sm text-gray-200 mb-2">Your Institution UID:</h2>
              <h1 className="text-blue-400 text-3xl font-bold text-center">
                {parseInt(receipt?.logs[0].data)}
              </h1>
              <p className="text-xs text-gray-300 text-center mt-2">Keep this safe for future reference</p>
            </div>
            <div className="flex justify-center">
              <button
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
