'use client'
import { useState } from 'react'
import '../styles/custom-styles.css'
import { MintNFTPopup } from '../components/MintNFTPopup'
type CryptoAddress = `0x${string}`
import Dashboard from './components/Dashboard'

const Body = () => {
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
    uid: string
    address: CryptoAddress
    file: File
  }) => {
    console.log('Submitted institution details:', details)
    setShowPopup(false)
    setName('')
  }
  return (
    <main className="flex pt-20">
      <Dashboard />
    </main>
  )
}

export default Body
