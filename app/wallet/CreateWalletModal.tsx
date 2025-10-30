'use client'

import { useState } from "react"
import { useTheme } from "./ThemeContext"

interface CreateWalletModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (walletName: string) => void
}

export default function CreateWalletModal({ isOpen, onClose, onCreate }: CreateWalletModalProps) {
  const { theme } = useTheme()
  const [walletName, setWalletName] = useState("")

  const handleCreate = () => {
    if (walletName.trim()) {
      onCreate(walletName.trim())
      setWalletName("")
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && walletName.trim()) {
      handleCreate()
    }
  }

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`shadow-2xl rounded-3xl w-full max-w-md mx-4 transform transition-all duration-300 ${
        theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-200'
      } ${isOpen ? 'scale-100' : 'scale-95'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-300'
        }`}>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Create New Wallet</h2>
          <button 
            onClick={onClose}
            className={`transition-colors ${theme === 'dark' ? 'text-[#999] hover:text-white' : 'text-gray-600 hover:text-black'}`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#ccc]' : 'text-gray-700'}`}>Wallet Name</label>
              <input 
                type="text" 
                placeholder="e.g., My Savings Wallet" 
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  theme === 'dark' 
                    ? 'border-[#3a3a3a] focus:ring-[#4a4a4a] bg-[#1a1a1a] text-white placeholder-gray-500'
                    : 'border-gray-300 focus:ring-gray-400 bg-white'
                }`}
                autoFocus
              />
            </div>
            
            <button 
              onClick={handleCreate}
              disabled={!walletName.trim()}
              className={`w-full px-6 py-4 text-white font-bold text-xl rounded-lg transition-colors ${
                walletName.trim()
                  ? theme === 'dark'
                    ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a]'
                    : 'bg-gray-400 hover:bg-gray-500'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              CREATE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

