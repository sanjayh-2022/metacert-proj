import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StudDetailsPopUp } from './StudDetailsPopup'
import { Address } from 'viem'

export function CardCompStud() {
  const [showPopup, setShowPopup] = useState(false)
  const [name, setName] = useState('')
  const router = useRouter()

  const handleRegisterClick = () => {
    setShowPopup(true)
  }

  const handleClosePopup = () => {
    setShowPopup(false)
  }

  const handleSubmitDetails = (details: {
    name: string
    address1: Address
  }) => {
    console.log('Submitted student details:', details)
    setShowPopup(false)
    router.push('/student')
  }

  return (
    <div>
      <Card className="w-[380px] bg-gradient-to-br from-stone-900 to-stone-900 border-2 border-stone-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-lg">
          <svg 
            className="w-10 h-10 text-black" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l-9-5 9-5 9 5-9 5z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" 
            />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold text-white mb-2">
          Student Portal
        </CardTitle>
        <CardDescription className="text-lg text-blue-300 font-medium">
          Access your verified educational certificates
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 mb-4">
          <p className="text-sm text-gray-300 text-center leading-relaxed">
            View, manage, and share your digitally-verified educational achievements securely.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-center">
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={handleRegisterClick}
        >
          Access Student Portal
        </Button>
      </CardFooter>
    </Card>
    {showPopup && (
      <StudDetailsPopUp
        onSubmit={handleSubmitDetails}
        onClose={handleClosePopup}
        name={name}
      />
    )}
  </div>
  )
}
