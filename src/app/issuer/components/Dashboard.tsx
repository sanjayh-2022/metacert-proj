'use client'
import React, { useState, FormEvent } from 'react'
import { MintNFTPopup } from '@/app/components/MintNFTPopup'
import Sidebar from '../components/Sidebar'
import ListCertificates from './Listcertificates'
import InsProfile from './Insprofile'

type CryptoAddress = `0x${string}`
/*

jsonPinataLink
: 
"https://gateway.pinata.cloud/ipfs/bafkreiabsonhlkla33kizolnkmqngmsko7f5cjlmessllczeilnda3ybiu"
pinataLink
: 
"ipfs://bafkreibogqvdwcombr6vkosmfphk2nf6kepckm3s3dqvbu7bonymeozwle"

 */

interface Details {
  uid: string
  sname: string
  title: string
  desc: string
  date: Date
  studaddress: CryptoAddress
  file: File
}

const Dashboard: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [name, setName] = useState('')
  const [activeTab, setActiveTab] = useState('issue')
  const [formData, setFormData] = useState({
    file: null,
  })

  const handleRegisterClick = () => {
    setShowPopup(true)
  }

  const handleClosePopup = () => {
    setShowPopup(false)
    setName('')
  }

  const handleSubmitDetails = async (file: File) => {
    console.log('Submitted institution details:', file)
    const formData = new FormData()
    formData.append('file', file)
    try {
      console.log(formData)
      const response = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data',
        },
        body: formData,
      })

      if (response.ok) {
        console.log('up')
      } else {
        console.log('nope')
      }
    } catch (e) {
      console.log(e)
    }
    setShowPopup(false)
    setName('')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'issue':
        return (
          <div className="p-4">
            <h1 className="text-black text-2xl mb-4 font-semibold">
              Issue Educational Credential to a Student:
            </h1>
            <button
              className="bg-blue-500 rounded-lg py-2 px-4"
              onClick={handleRegisterClick}
            >
              Mint Certificate
            </button>
            {showPopup && <MintNFTPopup onClose={handleClosePopup} />}
          </div>
        )
      case 'list':
        return <ListCertificates />
      case 'profile':
        return <InsProfile />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar onSelectTab={setActiveTab} />
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  )
}

export default Dashboard
