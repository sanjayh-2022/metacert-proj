'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InstitutionDetailsPopUp } from './InstitutionDetailsPopup'

export function CardCompIns() {
  const [showPopup, setShowPopup] = useState(false)
  const [name, setName] = useState('')

  const handleRegisterClick = () => {
    setShowPopup(true)
  }

  const handleClosePopup = () => {
    setShowPopup(false)
    setName('')
  }

  const handleSubmitDetails = (details: {
    institutionId: string
    institutionname: string
    addressclg: string
    district: string
    address: string
  }) => {
    console.log('Submitted institution details:', details)
    setShowPopup(false)
    setName('')
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
            />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold text-white mb-2">
          Institution Registration
        </CardTitle>
        <CardDescription className="text-lg text-blue-300 font-medium">
          Join our network of trusted educational institutions
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-300">
                Institution Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your institution name"
                className="w-full border-gray-600 focus:border-blue-400 focus:ring-blue-400 bg-gray-700/80 text-white placeholder:text-gray-400"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex items-center justify-center pt-4">
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={handleRegisterClick}
        >
          Register Institution
        </Button>
      </CardFooter>
    </Card>
    {showPopup && (
      <InstitutionDetailsPopUp
        onSubmit={handleSubmitDetails}
        onClose={handleClosePopup}
        name={name}
      />
    )}
  </div>
  )
}
