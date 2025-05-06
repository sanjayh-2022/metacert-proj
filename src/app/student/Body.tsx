'use client'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useAccount } from 'wagmi'
import { readContract } from '@wagmi/core'
import {config} from "../components/config"
import {abi} from "../components/abi"
import http from 'https'
import QRCodeComponent from '../components/QRCodeComponent'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import '../styles/custom-styles.css'
import { Address } from 'viem'

interface NFT {
  name: string
  description: string
  identifier: string
  image_url: string
  metadata_url: string
  opensea_url?: string
}

const resolveIPFS = (uri: string) =>
  uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/') : uri



const Body = () => {
  const { address } = useAccount()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)

  const MAX_TOKEN_ID = 10 // adjust based on how many NFTs you minted

  useEffect(() => {
    if (!address) return

    const fetchNFTs = async () => {
      setLoading(true)
      try {
        const nftList: NFT[] = []

        for (let tokenId = 0; tokenId < MAX_TOKEN_ID; tokenId++) {
          const owns = await readContract(config, {
            address: '0xbFB014898E5f55d98136fCD3dB7964231113e5aF', // your v2 Sepolia contract
            abi,
            functionName: 'verifyCert',
            args: [address, BigInt(tokenId)],
          })

          if (!owns) continue

          const tokenURI: string = await readContract(config, {
            address: '0xbFB014898E5f55d98136fCD3dB7964231113e5aF',
            abi,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          })

          const metadataUrl = resolveIPFS(tokenURI)
          const res = await fetch(metadataUrl)
          if (!res.ok) continue
          const metadata = await res.json()

          nftList.push({
            name: metadata.name || 'No Name',
            description: metadata.description || 'No Description',
            identifier: tokenId.toString(),
            image_url: resolveIPFS(metadata.image),
            metadata_url: metadataUrl,
          })
        }

        setNfts(nftList)
      } catch (err) {
        console.error('Failed to fetch NFTs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [address])

  return (
    <main className="min-h-screen pt-24 bg-gradient-to-br from-slate-100 to-blue-50">
      <div className="container mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-4">
            Your Educational Certificates
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View and manage your digitally-verified educational NFT certificates with complete authenticity and security
          </p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-semibold text-blue-800 mb-2">Loading Your Certificates</h2>
              <p className="text-gray-600">Fetching your NFT certificates from the blockchain...</p>
              <div className="flex justify-center mt-4 space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-10 lg:px-20">
            {nfts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-3xl font-bold text-gray-700 mb-2">No Certificates Found</h2>
                <p className="text-lg text-gray-500">Your educational NFT certificates will appear here once you receive them.</p>
              </div>
            ) : (
              nfts.map((nft, idx) => (
                <div key={idx} className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-blue-200">
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <img
                      src={nft.image_url || './dummy.png'}
                      alt={nft.name}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Certificate #{nft.identifier}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-800 mb-3 line-clamp-2">{nft.name}</h3>
                    <div className="bg-blue-50/50 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                      <p className="text-sm text-blue-700 font-semibold mb-2">Description:</p>
                      <p className="text-blue-900/80 leading-relaxed text-sm">{nft.description}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                      <button 
                        onClick={() => window.open(nft.metadata_url, '_blank')}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200 hover:underline"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default Body