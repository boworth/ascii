'use client'

import { useState, useMemo, useEffect } from 'react'
import { useWallet } from './WalletContext'
import { useTheme } from './ThemeContext'

interface BuyModalProps {
  isOpen: boolean
  onClose: () => void
}

const DAILY_LIMIT_CC = 10000 // Daily limit per address

export default function BuyModal({ isOpen, onClose }: BuyModalProps) {
  const { ccPrice, currentWallet } = useWallet()
  const { theme } = useTheme()
  const [paymentCurrency, setPaymentCurrency] = useState('USDC')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [dailyPurchasedCC, setDailyPurchasedCC] = useState(0)
  const [loading, setLoading] = useState(false)
  
  const remainingDailyLimit = DAILY_LIMIT_CC - dailyPurchasedCC
  
  const fetchDailyLimit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/daily-limit?wallet=${encodeURIComponent(currentWallet.address)}`)
      const data = await response.json()
      
      if (data.total_cc_purchased !== undefined) {
        setDailyPurchasedCC(data.total_cc_purchased)
      }
    } catch (error) {
      console.error('Error fetching daily limit:', error)
      setDailyPurchasedCC(0)
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch daily limit when modal opens or wallet changes
  useEffect(() => {
    if (isOpen && currentWallet.address) {
      fetchDailyLimit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentWallet.address])
  
  // Calculate CC amount to receive (USDC/USDT are both $1)
  const ccReceived = useMemo(() => {
    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0 || !ccPrice || ccPrice <= 0) {
      return 0
    }
    
    // Calculate CC amount using the ask price (what user pays to buy CC)
    return amount / ccPrice
  }, [paymentAmount, ccPrice])
  
  // Check if purchase would exceed daily limit
  const exceedsLimit = ccReceived > remainingDailyLimit
  const canPurchase = paymentAmount && parseFloat(paymentAmount) > 0 && !exceedsLimit
  
  return (
    <div className="w-full px-8">
      <div className={`w-full max-w-3xl mx-auto border-t-2 pt-8 ${
        theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-300'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-300'
        }`}>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Buy CC</h2>
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
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#ccc]' : 'text-gray-700'}`}>Pay With</label>
              <select 
                value={paymentCurrency}
                onChange={(e) => setPaymentCurrency(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  theme === 'dark' 
                    ? 'border-[#3a3a3a] focus:ring-[#4a4a4a] bg-[#1a1a1a] text-white'
                    : 'border-gray-300 focus:ring-gray-400 bg-white'
                }`}
              >
                <option>USDC</option>
                <option>USDT</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#ccc]' : 'text-gray-700'}`}>Amount</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  theme === 'dark' 
                    ? 'border-[#3a3a3a] focus:ring-[#4a4a4a] bg-[#1a1a1a] text-white placeholder-gray-500'
                    : 'border-gray-300 focus:ring-gray-400 bg-white'
                }`}
              />
              {exceedsLimit && ccReceived > 0 && (
                <div className="mt-2 px-4 py-2 bg-red-100 border border-red-400 rounded">
                  <p className="text-sm text-red-700 font-medium">
                    Purchase amount ({ccReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CC) exceeds your daily address limit
                  </p>
                </div>
              )}
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-300'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-[#999]' : 'text-gray-600'}`}>You will receive</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                ~{ccReceived > 0 ? ccReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} CC
              </p>
              {ccReceived > 0 && (
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>
                  @ ${ccPrice.toFixed(6)} per CC
                </p>
              )}
            </div>
            
            {/* Daily Limit Info */}
            <div className={`px-4 py-3 border-l-4 rounded ${
              theme === 'dark' 
                ? 'bg-[#1a1a1a] border-[#4a4a4a]' 
                : 'bg-gray-100 border-gray-400'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-[#999]' : 'text-gray-600'}`}>Daily Address Limit</span>
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {dailyPurchasedCC.toLocaleString()} / {DAILY_LIMIT_CC.toLocaleString()} CC
                </span>
              </div>
            </div>
            
            <button 
              disabled={!canPurchase}
              className={`w-full px-6 py-4 text-white font-bold text-xl rounded-lg transition-colors ${
                canPurchase
                  ? theme === 'dark' 
                    ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a]'
                    : 'bg-gray-400 hover:bg-gray-500'
                  : 'opacity-50 cursor-not-allowed bg-gray-400'
              }`}
            >
              {exceedsLimit && ccReceived > 0 ? 'DAILY ADDRESS LIMIT EXCEEDED' : 'BUY NOW'}
            </button>
            
            {exceedsLimit && ccReceived > 0 && (
              <div className="text-center space-y-1">
                <p className={`text-xs ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>
                  Maximum purchase allowed for this address today: {remainingDailyLimit.toLocaleString()} CC (≈ ${(remainingDailyLimit * ccPrice).toFixed(2)})
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-[#ccc]' : 'text-gray-600'}`}>
                  If you would like to buy more, create a new address
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

