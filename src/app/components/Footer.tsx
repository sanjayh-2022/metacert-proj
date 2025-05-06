import React from 'react'
import { FaGithub } from 'react-icons/fa'

const Footer = () => {
  return (
    <main className="bg-blue-400 opacity-80 text-black">
      <div className="p-10">
        <div className="grid grid-cols-3">
          <div className="flex-row px-10">
            <div className="flex text-2xl font-semibold">
              <img src="./certified.png" className="w-7 h-7" />
              MetaCert
            </div>
            <div className="flex text-md">
              Securely issue, store, and verify educational and professional
              credentials, ensuring authenticity and trust. Empower your future
              with tamper-proof, easily verifiable digital credentials.
            </div>
          </div>
          <div></div>
          <div className="px-10 flex justify-end">
            <FaGithub className="w-10 h-10 cursor-pointer text-stone-700 hover:text-stone-800" />
          </div>
        </div>
      </div>
      <hr className="my-1 mx-20 border-stone-700" />
      <span className="block text-center pb-2 text-sm text-black opacity-80">
        MetaCert © 2025 All rights reserved
      </span>
    </main>
  )
}

export default Footer
