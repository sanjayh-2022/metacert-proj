import React from 'react'
type CryptoAddress = `0x${string}`
interface NFTmintedprops {
  sname: string
  address: CryptoAddress
  onClose: () => void
}

const NFTminted: React.FC<NFTmintedprops> = ({ sname, address, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-stone-400 p-8 w-[550px] rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          {address ? 'NFT Created !' : 'Fill all the Details first sighhh...'}
        </h2>
        <h3 className="text-lg font-semibold">
          adding to {sname ? sname : 'none'}&apos;s Wallet({address})
        </h3>
        <button
          className="rounded-lg px-1.5 mt-3 py-1 bg-blue-500"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default NFTminted
