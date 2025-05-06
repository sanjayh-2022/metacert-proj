'use client'
import React from 'react'
import Navbar from '../components/Navbar'
import AuthGuard from '../components/AuthGuard'
import Body from './Body'

const Page = () => {
  return (
    <AuthGuard>
      <Navbar />
      <Body />
    </AuthGuard>
  )
}

export default Page
