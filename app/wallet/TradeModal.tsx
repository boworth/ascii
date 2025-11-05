'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from './WalletContext'
import { useTheme } from './ThemeContext'

interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
}

const DAILY_LIMIT_CC = 10000 // Daily limit per address

export default function TradeModal({ isOpen, onClose }: TradeModalProps) {
  const { ccPrice, currentWallet } = useWallet()
  const { theme } = useTheme()
  const [sellToken, setSellToken] = useState('CC')
  const [buyToken, setBuyToken] = useState('USDC')
  const [showSellTokenModal, setShowSellTokenModal] = useState(false)
  const [showBuyTokenModal, setShowBuyTokenModal] = useState(false)
  const [sellAmount, setSellAmount] = useState('')
  const [buyAmount, setBuyAmount] = useState('')
  const [dailyPurchasedCC, setDailyPurchasedCC] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  // Available tokens
  const tokens = ['CC', 'USDC', 'USDT', 'CUSD']
  
  // Get token icon
  const getTokenIcon = (token: string) => {
    if (token === 'USDC' || token === 'USDT') {
      // ETH icon - cleaner diamond version
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L6 12.5L12 15.5L18 12.5L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square"/>
          <path d="M6 12.5L12 21L18 12.5L12 15.5L6 12.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square"/>
          <path d="M12 3L12 15.5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    } else {
      // Canton icon (C symbol)
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M16 8C15 7 13.5 6.5 12 6.5C9 6.5 6.5 9 6.5 12C6.5 15 9 17.5 12 17.5C13.5 17.5 15 17 16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      )
    }
  }

  // Get token balance
  const getTokenBalance = (token: string): string => {
    if (token === 'CC') {
      return currentWallet.balance.cc.toLocaleString()
    }
    if (token === 'CUSD') {
      return currentWallet.balance.cusd.toLocaleString()
    }
    // For now, other tokens show 0 (will be implemented when wallet supports them)
    return '0'
  }
  
  // Get token balance number for validation
  const getTokenBalanceNum = (token: string): number => {
    switch (token) {
      case 'CC':
        return currentWallet.balance.cc;
      case 'CUSD':
        return currentWallet.balance.cusd;
      default:
        return 0;
    }
  };

  // Format amount with commas
  const formatAmount = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num) || num === 0) return '0';
    return num.toLocaleString('en-US', { maximumFractionDigits: 4 });
  };

  const sellBalanceNum = getTokenBalanceNum(sellToken);
  const sellAmountNum = parseFloat(sellAmount || '0');
  const insufficientBalance = sellAmountNum > sellBalanceNum && sellAmountNum > 0;
  const isDisabled = !sellAmount || sellAmountNum <= 0 || insufficientBalance;

  // Get swap path
  const getSwapPath = () => {
    // If selling and buying the same token (shouldn't happen but just in case)
    if (sellToken === buyToken) return [sellToken]
    
    // Direct CUSD swaps with CC
    if ((sellToken === 'CUSD' && buyToken === 'CC') || (sellToken === 'CC' && buyToken === 'CUSD')) {
      return [sellToken, buyToken]
    }
    
    // All other swaps involving CC go through CUSD
    if (sellToken === 'CC') {
      return [sellToken, 'CUSD', buyToken]
    }
    if (buyToken === 'CC') {
      return [sellToken, 'CUSD', buyToken]
    }
    
    // Non-CC pairs also go through CUSD
    return [sellToken, 'CUSD', buyToken]
  }
  
  // Fee tier (0.3% for non-subscribers)
  const feePercentage = 0.3
  
  // Swap direction
  const handleSwapDirection = () => {
    const tempToken = sellToken
    const tempAmount = sellAmount
    setSellToken(buyToken)
    setBuyToken(tempToken)
    setSellAmount(buyAmount)
    setBuyAmount(tempAmount)
  }
  
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

  // Track mouse position for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  // Calculate buy amount based on sell amount
  useMemo(() => {
    const amount = parseFloat(sellAmount || '0') || 0;
    if (amount === 0) {
      setBuyAmount('');
      return;
    }
    
    let calculatedBuyAmount = 0;
    
    // For CC markets
    if (sellToken === 'CC' && buyToken !== 'CC') {
      // Selling CC for stablecoin
      calculatedBuyAmount = amount * ccPrice;
    } else if (sellToken !== 'CC' && buyToken === 'CC') {
      // Buying CC with stablecoin
      calculatedBuyAmount = amount / ccPrice;
    } else if (sellToken === buyToken) {
      // Same token
      calculatedBuyAmount = amount;
    } else {
      // For stablecoin pairs, 1:1 ratio
      calculatedBuyAmount = amount;
    }
    
    // Subtract fee (0.3%) from the buy amount
    const amountAfterFee = calculatedBuyAmount * (1 - feePercentage / 100);
    setBuyAmount(formatAmount(amountAfterFee));
  }, [sellAmount, ccPrice, sellToken, buyToken, feePercentage]);

  const handleSwap = () => {
    console.log('Swapping:', {
      sellToken,
      sellAmount,
      buyToken,
      buyAmount
    })
    // TODO: Implement actual swap logic
    onClose()
  }

  // Calculate colors from three gradient planes based on cursor position
  const getGradientColors = () => {
    const { x, y } = mousePos
    
    // Layer 1: Vibrant Red-Orange to Bright Cyan gradient (horizontal)
    // Red-Orange (255, 85, 30) -> Bright Cyan (30, 220, 255)
    const layer1 = {
      r: Math.round(255 + (30 - 255) * x),
      g: Math.round(85 + (220 - 85) * x),
      b: Math.round(30 + (255 - 30) * x)
    }
    
    // Layer 2: Hot Magenta to Vibrant Yellow gradient (vertical)
    // Hot Magenta (255, 50, 180) -> Vibrant Yellow (255, 235, 50)
    const layer2 = {
      r: Math.round(255),
      g: Math.round(50 + (245 - 50) * y),
      b: Math.round(180 + (50 - 180) * y)
    }
    
    // Layer 3: Electric Lime to Bright Blue gradient (diagonal)
    // Electric Lime (150, 255, 50) -> Bright Blue (50, 140, 255)
    const diag = (x + y) / 2
    const layer3 = {
      r: Math.round(150 + (50 - 150) * diag),
      g: Math.round(255 + (130 - 255) * diag),
      b: Math.round(50 + (255 - 50) * diag)
    }
    
    return {
      layer1: `rgb(${layer1.r}, ${layer1.g}, ${layer1.b})`,
      layer2: `rgb(${layer2.r}, ${layer2.g}, ${layer2.b})`,
      layer3: `rgb(${layer3.r}, ${layer3.g}, ${layer3.b})`
    }
  }

  const gradientColors = getGradientColors()

  // Convert gradient colors to grayscale for disabled state
  const getGrayscaleColors = () => {
    const colors = getGradientColors()
    
    const toGrayscale = (rgbString: string) => {
      const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (!match) return rgbString
      
      const r = parseInt(match[1])
      const g = parseInt(match[2])
      const b = parseInt(match[3])
      
      // Calculate luminance (weighted average for human perception)
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
      return `rgb(${gray}, ${gray}, ${gray})`
    }
    
    return {
      layer1: toGrayscale(colors.layer1),
      layer2: toGrayscale(colors.layer2),
      layer3: toGrayscale(colors.layer3)
    }
  }

  const grayscaleColors = getGrayscaleColors()

  if (!isOpen) return null

  return (
    <div 
      className={`w-full flex flex-col ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}
    >
      {/* Swap Interface */}
      <div className="flex-1">
        {/* Sell/Buy Container - isolated for swap button positioning */}
        <div className="relative">
          {/* Sell Section */}
          <div className={`p-4 rounded-2xl border-4 ${
            insufficientBalance
              ? 'border-red-400'
              : theme === 'dark' 
                ? 'bg-transparent border-[#2a2a2a]' 
                : 'bg-transparent border-gray-100'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>Sell</span>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Balance: {getTokenBalance(sellToken)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                value={formatAmount(sellAmount)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const rawValue = e.target.value.replace(/,/g, '');
                  setSellAmount(rawValue);
                }}
                placeholder="0"
                className={`flex-1 bg-transparent text-3xl font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  theme === 'dark' ? 'text-white placeholder-[#666]' : 'text-gray-900 placeholder-gray-400'
                }`}
              />
              <button
                onClick={() => setShowSellTokenModal(true)}
                className={`px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2 border-2 ${
                  theme === 'dark'
                    ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] border-[#3a3a3a]'
                    : 'bg-white text-gray-900 hover:bg-gray-100 border-gray-300'
                }`}
              >
                {sellToken}
                {getTokenIcon(sellToken)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div className={`text-sm mt-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              ${sellToken === 'CC' ? (parseFloat(sellAmount || '0') * ccPrice).toFixed(2) : sellAmount || '0.00'}
            </div>
          </div>

          {/* Swap Arrow - Overlapping design */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={handleSwapDirection}
              className={`p-3 rounded-xl transition-all border-2 ${
                theme === 'dark'
                  ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a] border-[#2a2a2a]'
                  : 'bg-gray-200 hover:bg-gray-300 border-gray-100'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </button>
          </div>

          {/* Buy Section */}
          <div className={`p-4 rounded-2xl mt-1 ${
            theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Buy</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                value={buyAmount}
                readOnly
                placeholder="0"
                className={`flex-1 bg-transparent text-3xl font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  theme === 'dark' ? 'text-white placeholder-[#666]' : 'text-gray-900 placeholder-gray-400'
                }`}
              />
              <button
                onClick={() => setShowBuyTokenModal(true)}
                className={`px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2 border-2 ${
                  theme === 'dark'
                    ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] border-[#3a3a3a]'
                    : 'bg-white text-gray-900 hover:bg-gray-100 border-gray-300'
                }`}
              >
                {buyToken}
                {getTokenIcon(buyToken)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div className={`text-sm mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              ${buyToken === 'CC' ? (parseFloat(buyAmount || '0') * ccPrice).toFixed(2) : buyAmount || '0.00'}
            </div>
          </div>
        </div>

        {/* Swap Details - Fee and Path */}
        {sellAmountNum > 0 && parseFloat(buyAmount || '0') > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-3 mt-3 overflow-hidden"
            >
              {/* Fee Tier */}
              <div className={`px-4 py-3 rounded-xl ${
                theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100'
              }`}>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Fee Tier</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {feePercentage}%
                  </span>
                </div>
              </div>

              {/* Swap Path */}
              <div className={`px-4 py-3 rounded-xl ${
                theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Route</span>
                  <div className="flex items-center gap-2">
                    {getSwapPath().map((token, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {index > 0 && (
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-500"
                          >
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        )}
                        <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
                          theme === 'dark' ? 'bg-[#3a3a3a] text-white' : 'bg-white text-gray-900'
                        }`}>
                          {token}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exchange Rate */}
              <div className={`px-4 py-3 rounded-xl ${
                theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100'
              }`}>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Rate</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    1 {sellToken} = {(parseFloat(buyAmount) / parseFloat(sellAmount)).toFixed(6)} {buyToken}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Swap Button */}
      <div className="mt-5">
        <button
          onClick={handleSwap}
          disabled={isDisabled}
          className={`w-full py-5 rounded-2xl font-bold text-3xl text-white ${
            isDisabled
              ? 'swap-btn-reactive-grayscale cursor-not-allowed'
              : 'swap-btn-reactive'
          }`}
          style={
            isDisabled
              ? {
                  '--layer1-color': grayscaleColors.layer1,
                  '--layer2-color': grayscaleColors.layer2,
                  '--layer3-color': grayscaleColors.layer3
                } as React.CSSProperties
              : {
                  '--layer1-color': gradientColors.layer1,
                  '--layer2-color': gradientColors.layer2,
                  '--layer3-color': gradientColors.layer3
                } as React.CSSProperties
          }
        >
          <span className="content">
            {isDisabled 
              ? (!sellAmount || sellAmountNum <= 0 
                  ? 'Enter an amount' 
                  : 'Insufficient Balance'
                ) 
              : 'Swap'
            }
          </span>
        </button>
      </div>

      {/* Sell Token Selection Modal */}
      <AnimatePresence>
        {showSellTokenModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowSellTokenModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-2xl p-6 w-[90vw] max-w-sm ${
                theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Select a token</h3>
                <button
                  onClick={() => setShowSellTokenModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-100'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {tokens.filter(t => t !== buyToken).map((token) => (
                  <button
                    key={token}
                    onClick={() => {
                      setSellToken(token)
                      setShowSellTokenModal(false)
                    }}
                    className={`w-full px-4 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-between ${
                      sellToken === token
                        ? theme === 'dark'
                          ? 'bg-gray-800 text-white'
                          : 'bg-blue-500 text-white'
                        : theme === 'dark'
                          ? 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span>{token}</span>
                      <span className={`text-xs font-normal ${
                        sellToken === token
                          ? 'text-white opacity-80'
                          : theme === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-500'
                      }`}>
                        Balance: {getTokenBalance(token)}
                      </span>
                    </div>
                    {getTokenIcon(token)}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Token Selection Modal */}
      <AnimatePresence>
        {showBuyTokenModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowBuyTokenModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-2xl p-6 w-[90vw] max-w-sm ${
                theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Select a token</h3>
                <button
                  onClick={() => setShowBuyTokenModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-100'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {tokens.filter(t => t !== sellToken).map((token) => (
                  <button
                    key={token}
                    onClick={() => {
                      setBuyToken(token)
                      setShowBuyTokenModal(false)
                    }}
                    className={`w-full px-4 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-between ${
                      buyToken === token
                        ? theme === 'dark'
                          ? 'bg-gray-800 text-white'
                          : 'bg-blue-500 text-white'
                        : theme === 'dark'
                          ? 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span>{token}</span>
                      <span className={`text-xs font-normal ${
                        buyToken === token
                          ? 'text-white opacity-80'
                          : theme === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-500'
                      }`}>
                        Balance: {getTokenBalance(token)}
                      </span>
                    </div>
                    {getTokenIcon(token)}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

