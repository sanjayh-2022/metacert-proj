import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useAccount } from 'wagmi'
import { Address } from 'cluster'
import { useReadContract } from 'wagmi'
import { readContract } from '@wagmi/core'
import { abi } from './abi'
import { config } from './config'
import VerifyNFTpopup from './VerifyNFTpopup'

type CryptoAddress = `0x${string}`

const test = async (y: number, x: CryptoAddress) => {
  const result = await readContract(config, {
    abi,
    address: '0xbFB014898E5f55d98136fCD3dB7964231113e5aF',
    functionName: 'verifyCert',
    args: [x, BigInt(y)],
  })
  return result
}

// Helper to resolve ipfs:// URIs to https:// gateway URLs
const resolveIPFS = (uri: string) => {
  if (!uri) return ''
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
  return uri
}

interface VerifierDetailsFormProps {
  onSubmit: (details: { organizationname: string; address: Address }) => void
  onClose: () => void
}

interface NFT {
  name: string
  description: string
  identifier: string
  image_url: string
  metadata_url: string
}

export const VerifierDetailsPopUp: React.FC<VerifierDetailsFormProps> = ({
  onSubmit,
  onClose,
}) => {
  const [certuid, setCertuid] = useState<number>(0)
  const [studwallet, setStudwallet] = useState<CryptoAddress>('0x')
  const { address } = useAccount()
  const [response, setResponse] = useState(false)
  const [nfts, setNfts] = useState<NFT[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      if (await test(certuid, studwallet)) {
        // Step 1: read tokenURI
        const tokenURI = await readContract(config, {
          abi,
          address: '0xbFB014898E5f55d98136fCD3dB7964231113e5aF',
          functionName: 'tokenURI',
          args: [BigInt(certuid)],
        }) as string

        // Step 2: resolve IPFS link for metadata JSON
        const metadataUrl = resolveIPFS(tokenURI)

        // Step 3: fetch metadata
        const res = await fetch(tokenURI)
        if (!res.ok) throw new Error('Failed to fetch metadata')
        const metadata = await res.json()

        // Step 4: build NFT object for VerifyNFTpopup
        const nft: NFT = {
          name: metadata.name || '',
          description: metadata.description || '',
          identifier: certuid.toString(),
          image_url: resolveIPFS(metadata.image),
          metadata_url: metadataUrl,
        }

        setNfts([nft])
        setResponse(true)
      } else {
        alert('Verification failed!')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to load NFT metadata.')
    }
  }

  const handleStudwalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.startsWith('0x')) {
      setStudwallet(value as CryptoAddress)
    } else {
      setStudwallet(`0x${value}` as CryptoAddress)
    }
  }

  const handleCertuidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericValue = parseInt(value, 10)

    if (!isNaN(numericValue)) {
      setCertuid(numericValue)
    } else {
      setCertuid(0)
    }
  }

  return (
    <div className="fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-[450px] p-8 rounded-xl shadow-2xl mx-4">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">
          Certificate Verification
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="studwallet" className="text-sm font-semibold text-gray-200">
                Student Wallet Address:
              </label>
              <Input
                id="studwallet"
                value={studwallet}
                onChange={handleStudwalletChange}
                placeholder="Enter student's wallet address"
                className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="certuid" className="text-sm font-semibold text-gray-200">
                Certificate UID:
              </label>
              <Input
                id="certuid"
                type="number"
                value={certuid}
                onChange={handleCertuidChange}
                placeholder="Enter certificate ID"
                className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="address" className="text-sm font-semibold text-gray-200">
                Your Wallet Address:
              </label>
              <Input 
                id="address" 
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
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Verify Certificate
            </button>
          </div>
          {response && nfts.length > 0 && (
            <VerifyNFTpopup NFT={nfts} address={studwallet} onClose={onClose} />
          )}
        </form>
      </div>
    </div>
  )
}
