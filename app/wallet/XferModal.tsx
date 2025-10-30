'use client'

import { useState, useEffect, useRef } from "react"
import { useWallet } from "./WalletContext"
import { useTheme } from "./ThemeContext"

interface XferModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SavedAddress {
  label: string
  address: string
  type: 'recent' | 'wallet'
}

export default function XferModal({ isOpen, onClose }: XferModalProps) {
  const { currentWallet, wallets } = useWallet()
  const { theme } = useTheme()
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [showAddressBook, setShowAddressBook] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Use current wallet balance
  const availableBalance = currentWallet.balance.cc
  
  // Build saved addresses from user's wallets + recent transfers
  const [recentTransfers] = useState<SavedAddress[]>([
    {
      label: "Exchange Deposit",
      address: "bron::1220jkl345678901234567890123456789012345678901234567890",
      type: 'recent'
    },
    {
      label: "Friend's Wallet",
      address: "bron::1220mno678901234567890123456789012345678901234567890123",
      type: 'recent'
    }
  ])

  // Combine user's wallets (excluding current wallet) with recent transfers
  const savedAddresses: SavedAddress[] = [
    ...wallets
      .filter((_, index) => index !== wallets.findIndex(w => w.address === currentWallet.address))
      .map(wallet => ({
        label: wallet.label,
        address: wallet.address,
        type: 'wallet' as const
      })),
    ...recentTransfers
  ]

  const [editableSavedAddresses, setEditableSavedAddresses] = useState(savedAddresses)

  const handleSelectAddress = (address: string) => {
    setToAddress(address)
    setShowAddressBook(false)
    setSearchQuery("") // Clear search when closing
  }

  const handleCloseAddressBook = () => {
    setShowAddressBook(false)
    setSearchQuery("") // Clear search when closing
  }

  const handleStartEdit = (index: number, currentLabel: string) => {
    setEditingIndex(index)
    setEditLabel(currentLabel)
  }

  const handleSaveEdit = (index: number) => {
    const updatedAddresses = [...editableSavedAddresses]
    updatedAddresses[index] = { ...updatedAddresses[index], label: editLabel }
    setEditableSavedAddresses(updatedAddresses)
    setEditingIndex(null)
    setEditLabel("")
  }

  // Update editable addresses when wallets change
  useEffect(() => {
    const combined: SavedAddress[] = [
      ...wallets
        .filter((_, index) => index !== wallets.findIndex(w => w.address === currentWallet.address))
        .map(wallet => ({
          label: wallet.label,
          address: wallet.address,
          type: 'wallet' as const
        })),
      ...recentTransfers
    ]
    setEditableSavedAddresses(combined)
  }, [wallets, currentWallet, recentTransfers])

  // Filter addresses based on search query
  const filteredAddresses = editableSavedAddresses.filter(addr => 
    addr.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditLabel("")
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight
    
    // Show top fade if scrolled down
    setShowTopFade(scrollTop > 10)
    
    // Show bottom fade if not at the bottom
    setShowBottomFade(scrollTop + clientHeight < scrollHeight - 10)
  }

  // Check if content is scrollable when address book opens
  useEffect(() => {
    if (showAddressBook && scrollRef.current) {
      const element = scrollRef.current
      const hasScroll = element.scrollHeight > element.clientHeight
      setShowBottomFade(hasScroll)
      setShowTopFade(false)
    }
  }, [showAddressBook])

  const handlePercentageClick = (percentage: number) => {
    const calculatedAmount = (availableBalance * percentage / 100).toFixed(4)
    setAmount(calculatedAmount)
  }

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`shadow-2xl rounded-3xl w-full max-w-2xl mx-4 transform transition-all duration-300 ${
        theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-200'
      } ${isOpen ? 'scale-100' : 'scale-95'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-300'
        }`}>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Transfer CC</h2>
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
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-[#ccc]' : 'text-gray-700'}`}>To Address</label>
                <button
                  onClick={() => setShowAddressBook(!showAddressBook)}
                  className={`text-sm transition-colors flex items-center gap-1 ${
                    theme === 'dark' ? 'text-[#999] hover:text-white' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  Address Book
                </button>
              </div>
              <input 
                type="text" 
                placeholder="bron::..." 
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  theme === 'dark' 
                    ? 'border-[#3a3a3a] focus:ring-[#4a4a4a] bg-[#1a1a1a] text-white placeholder-gray-500'
                    : 'border-gray-300 focus:ring-gray-400 bg-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#ccc]' : 'text-gray-700'}`}>Amount (CC)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  theme === 'dark' 
                    ? 'border-[#3a3a3a] focus:ring-[#4a4a4a] bg-[#1a1a1a] text-white placeholder-gray-500'
                    : 'border-gray-300 focus:ring-gray-400 bg-white'
                }`}
              />
              
              {/* Available Balance */}
              <div className="flex items-center justify-between mt-2">
                <p className={`text-sm ${theme === 'dark' ? 'text-[#999]' : 'text-gray-600'}`}>
                  Available: <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{availableBalance.toLocaleString()} CC</span>
                </p>
                
                {/* Percentage Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePercentageClick(25)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      theme === 'dark' 
                        ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-black'
                    }`}
                  >
                    25%
                  </button>
                  <button
                    onClick={() => handlePercentageClick(50)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      theme === 'dark' 
                        ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-black'
                    }`}
                  >
                    50%
                  </button>
                  <button
                    onClick={() => handlePercentageClick(100)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      theme === 'dark' 
                        ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-black'
                    }`}
                  >
                    100%
                  </button>
                </div>
              </div>
            </div>
            
            <button className={`w-full px-6 py-4 text-white font-bold text-xl rounded-lg transition-colors ${
              theme === 'dark' ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a]' : 'bg-gray-400 hover:bg-gray-500'
            }`}>
              SEND
            </button>
          </div>
        </div>
      </div>

      {/* Address Book Overlay Popup */}
      {showAddressBook && (
        <>
          {/* Address Book Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-40 z-[60] transition-opacity duration-300"
            onClick={handleCloseAddressBook}
          />
          
          {/* Address Book Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none">
            <div className={`shadow-2xl rounded-3xl w-full max-w-lg mx-4 pointer-events-auto transform transition-all duration-300 scale-100 ${
              theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-200'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Address Book</h3>
                  <button
                    onClick={handleCloseAddressBook}
                    className={`transition-colors ${theme === 'dark' ? 'text-[#999] hover:text-white' : 'text-gray-600 hover:text-black'}`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 ${
                        theme === 'dark' 
                          ? 'border-[#3a3a3a] focus:ring-[#4a4a4a] bg-[#1a1a1a] text-white placeholder-gray-500'
                          : 'border-gray-300 focus:ring-gray-400 bg-white'
                      }`}
                    />
                    <svg 
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  {/* Top fade overlay */}
                  {showTopFade && (
                    <div className={`absolute top-0 left-0 right-0 h-8 pointer-events-none z-10 ${
                      theme === 'dark' ? 'bg-gradient-to-b from-[#2a2a2a] to-transparent' : 'bg-gradient-to-b from-gray-200 to-transparent'
                    }`}></div>
                  )}
                  
                  {/* Scrollable content */}
                  <div 
                    ref={scrollRef}
                    className="space-y-2 max-h-96 overflow-y-auto scrollbar-minimal pr-2"
                    onScroll={handleScroll}
                  >
                    {filteredAddresses.length === 0 ? (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        No addresses found
                      </div>
                    ) : (
                      filteredAddresses.map((saved, index) => (
                      <div
                        key={index}
                        className={`w-full p-4 border rounded-lg ${
                          theme === 'dark' ? 'bg-[#1a1a1a] border-[#3a3a3a]' : 'bg-white border-gray-300'
                        }`}
                      >
                        {editingIndex === index ? (
                          // Edit mode
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-semibold ${
                                theme === 'dark'
                                  ? 'border-[#3a3a3a] focus:ring-[#4a4a4a] bg-[#2a2a2a] text-white'
                                  : 'border-gray-300 focus:ring-gray-400 bg-white text-black'
                              }`}
                              autoFocus
                            />
                            <p className={`text-sm truncate ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>{saved.address.slice(0, 20)}...{saved.address.slice(-12)}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(index)}
                                className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                                  theme === 'dark' ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a]' : 'bg-gray-400 hover:bg-gray-500'
                                }`}
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white'
                                    : 'bg-gray-300 hover:bg-gray-400 text-black'
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div className="flex items-center justify-between gap-3">
                            <button
                              onClick={() => handleSelectAddress(saved.address)}
                              className="flex-1 text-left min-w-0"
                            >
                              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{saved.label}</p>
                              <p className={`text-sm truncate ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>{saved.address.slice(0, 20)}...{saved.address.slice(-12)}</p>
                            </button>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-xs px-3 py-1 rounded whitespace-nowrap ${saved.type === 'wallet' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {saved.type === 'wallet' ? 'My Wallet' : 'Recent'}
                              </span>
                              <button
                                onClick={() => handleStartEdit(index, saved.label)}
                                className={`transition-colors p-1 ${
                                  theme === 'dark' ? 'text-[#999] hover:text-white' : 'text-gray-500 hover:text-black'
                                }`}
                                title="Rename"
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      ))
                    )}
                  </div>
                  
                  {/* Bottom fade overlay */}
                  {showBottomFade && (
                    <div className={`absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-10 ${
                      theme === 'dark' ? 'bg-gradient-to-t from-[#2a2a2a] to-transparent' : 'bg-gradient-to-t from-gray-200 to-transparent'
                    }`}></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

