import React, { useState } from 'react'

interface SidebarProps {
  onSelectTab: (tab: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectTab }) => {
  const [activeTab, setActiveTab] = useState('issue')

  const handleTabClick = (tab: string) => {
    onSelectTab(tab)
    setActiveTab(tab)
  }

  const tabClassName = (tab: string) =>
    `py-2 px-4 rounded-lg ${
      activeTab === tab ? 'bg-stone-900' : 'bg-stone-200 text-black'
    }`

  return (
    <div className="w-64 h-full bg-blue-200 bg-opacity-60 text-blue-500 flex flex-col">
      <h2 className="text-2xl font-bold p-4 text-black mt-2">Dashboard</h2>
      <nav className="flex flex-col p-4 space-y-2">
        <button
          className={tabClassName('issue')}
          onClick={() => handleTabClick('issue')}
        >
          Issue Certificate
        </button>
        <button
          className={tabClassName('list')}
          onClick={() => handleTabClick('list')}
        >
          List Issued Certificates
        </button>
        <button
          className={tabClassName('profile')}
          onClick={() => handleTabClick('profile')}
        >
          Organization Profile
        </button>
      </nav>
    </div>
  )
}

export default Sidebar
