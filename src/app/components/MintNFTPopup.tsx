import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Address } from 'viem'
import { CalendarIcon } from '@radix-ui/react-icons'
import { addDays, format } from 'date-fns'
import { DateRange } from 'react-day-picker'

import {
  useWriteContract,
  useTransactionReceipt,
  useReadContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { abi } from './abi'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { writeContract } from 'viem/actions'
import NFTminted from './NFTminted'

type CryptoAddress = `0x${string}`

interface MintNFTPopupprops {
  onClose: () => void
}

export const MintNFTPopup: React.FC<MintNFTPopupprops> = ({ onClose }) => {
  const [uid, setUid] = useState<string>('')
  const [sname, setSname] = useState('')
  const [title, setTitle] = useState('')
  const [mint, setMint] = useState(false)
  const [desc, setDesc] = useState('')
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  })
  const [studaddress, setStudaddress] = useState<CryptoAddress>('0x')
  const [file, setFile] = useState<File | null>(null)
  const handleClose = () => {
    setMint(false)
    onClose()
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.startsWith('0x')) {
      setStudaddress(value as CryptoAddress)
    } else {
      console.error('Invalid address format')
    }
  }

  const { data: hash, writeContract } = useWriteContract()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //setMint(true)
    e.preventDefault()
    const formData = new FormData()
    formData.append('uid', uid.toString())
    formData.append('sname', sname)
    formData.append('title', title)
    formData.append('desc', desc)
    formData.append('studaddress', studaddress)
    if (file) {
      formData.append('file', file)
    } else {
      console.error('No file selected')
      return
    }

    try {
      const res = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        console.log(data.jsonPinataLink)
        writeContract({
          address: '0xbFB014898E5f55d98136fCD3dB7964231113e5aF',
          abi,
          functionName: 'mintCert',
          args: [
            BigInt(uid),
            studaddress as CryptoAddress,
            data.jsonPinataLink,
          ],
        })
        console.log(hash)
        console.log(data)
      } else {
        console.error('Upload failed:', res.statusText)
      }
    } catch (error) {
      console.error('Error during upload:', error)
    }
  }

  const { data, isLoading, isError } = useWaitForTransactionReceipt({
    hash: hash,
  })

  useEffect(() => {
    if (data?.logs) {
      alert(`Your token UID is: ${Number(data.logs[2].data)}`)
      setMint(true)
    }
  }, [data])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    } else {
      setFile(null)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm z-50">
      <div className="bg-gray-800 border border-gray-600 p-8 w-[850px] rounded-xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Create a Certificate</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col space-y-2">
                <label htmlFor="uid" className="text-sm font-semibold text-gray-200">Enter UID:</label>
                <Input
                  id="uid"
                  name="uid"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder="Enter your UID"
                  className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="studentname" className="text-sm font-semibold text-gray-200">Student Name:</label>
                <Input
                  id="studentname"
                  name="studentname"
                  value={sname}
                  onChange={(e) => setSname(e.target.value)}
                  placeholder="Enter the Student Name"
                  className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="certtitle" className="text-sm font-semibold text-gray-200">Certificate Title:</label>
                <Input
                  id="certtitle"
                  name="certtitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter certificate title"
                  className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-gray-200">Description:</label>
              <Input
                id="description"
                name="description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Enter the certificate description"
                className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <label htmlFor="duration" className="text-sm font-semibold text-gray-200">Certificate Duration:</label>
              <div className={cn('grid gap-2')}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'ghost'}
                      className={cn(
                        'w-full justify-start text-left font-normal bg-gray-700 border-gray-500 text-white hover:bg-gray-600 hover:text-white',
                        !date && 'text-gray-400'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" name="duration" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'LLL dd, y')} -{' '}
                            {format(date.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(date.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      className="bg-gray-700 text-white border-gray-500"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label htmlFor="walletaddress" className="text-sm font-semibold text-gray-200">Student&apos;s Wallet Address:</label>
              <Input
                id="walletaddress"
                name="walletaddress"
                value={studaddress}
                onChange={handleAddressChange}
                placeholder="Enter student's wallet address"
                className="bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <label htmlFor="file" className="text-sm font-semibold text-gray-200">Certificate File:</label>
              <input
                type="file"
                name="file"
                id="file"
                onChange={handleFileChange}
                className="cursor-pointer bg-gray-700/50 border border-gray-500 rounded-lg p-3 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-500 file:text-gray-200 hover:file:bg-gray-400"
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
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Certificate...
                </div>
              ) : (
                'Create Certificate'
              )}
            </button>
            {mint && (
              <NFTminted
                sname={sname}
                address={studaddress}
                onClose={handleClose}
              />
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
