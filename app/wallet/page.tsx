"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TransactionHistory from "./TransactionHistory"
import XferModal from "./XferModal"
import BuyModal from "./BuyModal"
import CreateWalletModal from "./CreateWalletModal"
import { WalletProvider, useWallet, Wallet } from "./WalletContext"
import { ThemeProvider, useTheme } from "./ThemeContext"

const MAX_WALLETS = 10 // Maximum wallets per user

type ActivePanel = null | 'xfer' | 'buy'

function WalletPageContent() {
  const { wallets, selectedWalletIndex, setSelectedWalletIndex, currentWallet, addWallet, fdv } = useWallet()
  const { theme, toggleTheme } = useTheme()
  const [showWalletDropdown, setShowWalletDropdown] = useState(false)
  const [showCreateWallet, setShowCreateWallet] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  
  const displayAddress = `...${currentWallet.address.slice(-4)}`
  const canCreateWallet = wallets.length < MAX_WALLETS
  
  const handleCopyAddress = async () => {
    try {
      // Try modern clipboard API first
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentWallet.address)
        console.log('Copied using clipboard API')
      } else {
        // Fallback to older method
        const textArea = document.createElement('textarea')
        textArea.value = currentWallet.address
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        console.log('Copied using execCommand')
      }
      
      // Show confirmation
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSelectWallet = (index: number) => {
    setSelectedWalletIndex(index)
    setShowWalletDropdown(false)
  }

  const handleCreateWallet = (walletName: string) => {
    // Check if we're at the limit
    if (!canCreateWallet) {
      console.warn(`Cannot create wallet: Maximum ${MAX_WALLETS} wallets allowed`)
      return
    }
    
    // Generate a mock address (in production, this would call your wallet creation API)
    const randomSuffix = Math.random().toString(36).substring(2, 15)
    const newWallet: Wallet = {
      label: walletName,
      address: `bron::1220${randomSuffix}000000000000000000000000000000000000000`,
      balance: { cc: 0, usd: 0 }
    }
    
    addWallet(newWallet)
    setShowCreateWallet(false)
  }

  const togglePanel = (panel: 'xfer' | 'buy') => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  return (
    <main className={`relative min-h-screen flex flex-col select-none transition-colors duration-300 overflow-hidden ${
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-200'
    }`}>
      {/* Theme Toggle Button - Bottom Right */}
      <button
        onClick={toggleTheme}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full transition-all duration-300 shadow-lg ${
          theme === 'dark' 
            ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300' 
            : 'bg-white hover:bg-gray-100 text-gray-700'
        }`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          // Sun icon
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          // Moon icon
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
      
      {/* Header - Ascii on left, Txn history on right */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-20">
        <div className="flex flex-col">
          <h1 className={`text-7xl font-bold transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>Ascii</h1>
          <div className="flex items-center gap-3 mt-2">
            {/* Wallet Dropdown */}
            <div className="relative flex items-center">
              <button
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className={`transition-colors flex items-center ${
                  theme === 'dark' ? 'text-[#999] hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {showWalletDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-30"
                    onClick={() => setShowWalletDropdown(false)}
                  />
                  <div className={`absolute left-0 top-full mt-2 rounded-lg shadow-lg z-40 min-w-[280px] ${
                    theme === 'dark' ? 'bg-[#2a2a2a] border border-[#3a3a3a]' : 'bg-white border border-gray-300'
                  }`}>
                    {/* Scrollable wallet list */}
                    <div className="max-h-64 overflow-y-auto scrollbar-minimal">
                      {wallets.map((wallet, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectWallet(index)}
                          className={`w-full px-4 py-3 text-left transition-colors first:rounded-t-lg ${
                            theme === 'dark'
                              ? `hover:bg-[#3a3a3a] ${index === selectedWalletIndex ? 'bg-[#3a3a3a]' : ''}`
                              : `hover:bg-gray-100 ${index === selectedWalletIndex ? 'bg-gray-50' : ''}`
                          }`}
                        >
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{wallet.label}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>...{wallet.address.slice(-8)}</p>
                        </button>
                      ))}
                    </div>
                    
                    {/* Create New Wallet Button */}
                    <div className={`border-t ${theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-300'}`}>
                      <button
                        onClick={() => {
                          if (canCreateWallet) {
                            setShowWalletDropdown(false)
                            setShowCreateWallet(true)
                          }
                        }}
                        disabled={!canCreateWallet}
                        className={`w-full px-4 py-3 text-left rounded-b-lg flex items-center gap-2 font-medium ${
                          canCreateWallet 
                            ? theme === 'dark'
                              ? 'hover:bg-[#3a3a3a] transition-colors text-[#ccc] hover:text-white cursor-pointer'
                              : 'hover:bg-gray-100 transition-colors text-gray-700 hover:text-black cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed opacity-60'
                        }`}
                        title={!canCreateWallet ? `Maximum ${MAX_WALLETS} wallets allowed` : ''}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Create New Wallet
                        {!canCreateWallet && (
                          <span className="ml-auto text-xs">({wallets.length}/{MAX_WALLETS})</span>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <a 
              href={`https://ccview.io/party/${currentWallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-4xl transition-colors ${
                theme === 'dark' ? 'text-[#999] hover:text-[#ccc]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {displayAddress}
            </a>
            <button 
              onClick={handleCopyAddress}
              className={`transition-colors relative ${
                theme === 'dark' ? 'text-[#999] hover:text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              <div className="relative w-7 h-7">
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={`absolute inset-0 transition-all duration-300 ${copied ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={`absolute inset-0 transition-all duration-300 ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => setShowTransactions(true)}
          className={`flex items-center gap-2 transition-colors ${
            theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'
          }`}
        >
          <span className="text-2xl">Txn history</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      {/* Main Content Container - Animates vertically */}
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center"
        animate={{
          y: activePanel ? -20 : 0
        }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        {/* Wallet Balance Section */}
        <div className="text-center mb-8">
          <h2 className={`text-8xl font-bold mb-12 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>Wallet Balance</h2>
          
          <div className="mb-12">
            <p className={`text-7xl transition-colors ${
              theme === 'dark' ? 'text-[#ccc]' : 'text-gray-600'
            }`}>
              {currentWallet.balance.cc.toFixed(4)} CC
            </p>
            <p className={`text-5xl mt-2 transition-colors ${
              theme === 'dark' ? 'text-[#999]' : 'text-gray-500'
            }`}>
              ${currentWallet.balance.usd.toFixed(2)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-8 justify-center items-center">
            <motion.button
              animate={{ 
                x: activePanel === 'xfer' ? 110 : 0,
                opacity: activePanel === 'buy' ? 0 : 1,
                scale: activePanel === 'buy' ? 0.95 : 1
              }}
              transition={{ 
                duration: 0.35, 
                ease: [0.4, 0, 0.2, 1]
              }}
              onClick={() => togglePanel('xfer')}
              className={`px-16 py-6 font-bold text-2xl rounded-lg ${
                activePanel === 'xfer'
                  ? theme === 'dark'
                    ? 'bg-[#4a4a4a] text-white ring-2 ring-white ring-opacity-50'
                    : 'bg-gray-500 text-white ring-2 ring-gray-700 ring-opacity-30'
                  : theme === 'dark' 
                    ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white' 
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
              }`}
              style={{ pointerEvents: activePanel === 'buy' ? 'none' : 'auto' }}
            >
              XFER
            </motion.button>
            
            <motion.button
              animate={{ 
                x: activePanel === 'buy' ? -110 : 0,
                opacity: activePanel === 'xfer' ? 0 : 1,
                scale: activePanel === 'xfer' ? 0.95 : 1
              }}
              transition={{ 
                duration: 0.35, 
                ease: [0.4, 0, 0.2, 1]
              }}
              onClick={() => togglePanel('buy')}
              className={`px-16 py-6 font-bold text-2xl rounded-lg ${
                activePanel === 'buy'
                  ? theme === 'dark'
                    ? 'bg-[#4a4a4a] text-white ring-2 ring-white ring-opacity-50'
                    : 'bg-gray-500 text-white ring-2 ring-gray-700 ring-opacity-30'
                  : theme === 'dark' 
                    ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white' 
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
              }`}
              style={{ pointerEvents: activePanel === 'xfer' ? 'none' : 'auto' }}
            >
              BUY
            </motion.button>
          </div>
        </div>

        {/* Expanding Panels Container */}
        <AnimatePresence mode="wait">
          {activePanel && (
            <motion.div
              key={activePanel}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="w-full max-w-4xl overflow-hidden"
            >
              <div className="pt-8 pb-12">
                {activePanel === 'xfer' && (
                  <XferModal isOpen={true} onClose={() => setActivePanel(null)} />
                )}
                {activePanel === 'buy' && (
                  <BuyModal isOpen={true} onClose={() => setActivePanel(null)} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom - FDV */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <p className={`text-2xl transition-colors ${
          theme === 'dark' ? 'text-[#999]' : 'text-gray-500'
        }`}>
          CC = {fdv} FDV
        </p>
      </div>

      {/* Transaction History Sidebar */}
      <TransactionHistory isOpen={showTransactions} onClose={() => setShowTransactions(false)} />
      
      {/* Create Wallet Modal */}
      <CreateWalletModal isOpen={showCreateWallet} onClose={() => setShowCreateWallet(false)} onCreate={handleCreateWallet} />
      
      {/* Backdrop for Transaction History and Create Wallet */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-500 ${showTransactions || showCreateWallet ? 'opacity-30' : 'opacity-0 pointer-events-none'}`}
        onClick={() => {
          setShowTransactions(false)
          setShowCreateWallet(false)
        }}
      />
    </main>
  )
}

export default function WalletPage() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <WalletPageContent />
      </WalletProvider>
    </ThemeProvider>
  )
}
