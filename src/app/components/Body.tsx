import React from 'react'
import { CardCompIns } from './CardCompIns'
import { CardCompStud } from './CardCompStud'
import { CardCompVerify } from './CardCompVerify'
import { MintNFT } from './mint-nft'
import Footer from './Footer'

const Body = () => {
  return (
    <main>
      <main className="flex items-center justify-center h-[70vh] pt-20">
        <div className="h-1/3 items-center justify-center">
          <h1 className="text-transparent items-center text-center justify-center bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 text-5xl font-semibold">
            Your Credentials, Verified and Secured.
          </h1>
          <h3 className="px-96 py-6 text-sm text-orange-100">
            MetaCert streamlines the certificate verification process.
            Institutions can seamlessly issue verifiable credentials as NFTs
            using cutting-edge technology, while employers and other entities can instantly
            confirm the authenticity of these credentials with just a few
            clicks. MetaCert ensures your achievements are secure, accessible,
            and trusted globally.
          </h3>
        </div>
      </main>
      <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-8 px-6 lg:px-12 pb-20 max-w-7xl mx-auto">
        <CardCompIns />
        <CardCompStud />
        <CardCompVerify />
      </div>
      <Footer />
    </main>
  )
}

export default Body
