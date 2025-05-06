import QRCodeComponent from './QRCodeComponent'

interface VerifyNFTpopupProps {
  NFT: {
    name: string
    description: string
    identifier: string
    image_url: string
    metadata_url: string
  }[]
  address: string
  onClose: () => void
}

const VerifyNFTpopup: React.FC<VerifyNFTpopupProps> = ({
  NFT,
  address,
  onClose,
}) => {
  console.log(address)
  console.log(NFT)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(e)
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm z-50">
       {NFT.map((nfts, idx) => (
      <div key={idx} className="bg-gray-800 border border-gray-600 w-[500px] px-6 py-6 rounded-xl shadow-2xl mx-4 max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-white text-center">
          ✅ Certificate Verified Successfully!
        </h2>
        
        <div className="space-y-5">
          <div className="bg-gray-700 rounded-lg p-3">
            <label className="text-sm font-medium text-gray-200 block mb-2">
              Student&apos;s Wallet Address:
            </label>
            <div className="text-gray-100 font-mono text-xs break-all bg-gray-900 p-3 rounded">
              {address}
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-xl">
            <div className="text-center mb-3">
              <img
                src={nfts.image_url}
                alt="Certificate"
                className="w-full max-w-[200px] h-[120px] mx-auto rounded-lg object-cover"
              />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">
                {nfts.name}
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                {nfts.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="bg-green-900/40 border border-green-500 rounded-lg px-4 py-2 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-green-400 font-semibold">Verified Certificate!</span>
            </div>
          </div>
          
          <div className="bg-gray-700 p-6 rounded-lg text-center">
            <p className="text-gray-200 text-sm mb-4">Certificate QR Code:</p>
            <div className="flex justify-center scale-150">
              <QRCodeComponent qrData={nfts.identifier} />
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <button 
            type="button"
            className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      ))}
    </div>
  )
}

export default VerifyNFTpopup
