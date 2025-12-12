"use client"

import { useState, useRef, useEffect, type MouseEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TransactionHistory from "./TransactionHistory"
import XferModal from "./XferModal"
import TradeModal from "./TradeModal"
import CreateWalletModal from "./CreateWalletModal"
import { WalletProvider, useWallet, Wallet } from "./WalletContext"
import { ThemeProvider, useTheme } from "./ThemeContext"

// Animated Number Component with flip effect
function AnimatedNumber({ value, previousValue, delay = 0, className = "" }: { value: string; previousValue?: string; delay?: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(previousValue || "0")
  const [visibleChars, setVisibleChars] = useState(0)

  useEffect(() => {
    const startDelay = setTimeout(() => {
      const newChars = value.split('')
      const timePerChar = 70 // Time to cycle and settle each character
      const cycleTime = 20 // Time between number changes during cycling
      
      // Determine animation type
      const isWalletSwitch = previousValue && previousValue !== "0"
      const isPageLoad = !previousValue || previousValue === "0"
      
      if (isPageLoad) {
        // PAGE LOAD ANIMATION: Original right-to-left build-up from "0"
        let currentCharIndex = newChars.length - 1 // Start from rightmost
        let currentCycle = 0
        const cyclesPerChar = Math.floor(timePerChar / cycleTime)
        
        const interval = setInterval(() => {
          const numVisible = newChars.length - currentCharIndex
          
          if (currentCharIndex >= 0) {
            // Generate display string - only include visible characters
            const displayChars = newChars.slice(currentCharIndex).map((char, sliceIndex) => {
              const index = currentCharIndex + sliceIndex
              
              if (index === currentCharIndex) {
                if (currentCycle < cyclesPerChar) {
                  // Cycle through random digits during animation
                  return char.match(/\d/) ? Math.floor(Math.random() * 10).toString() : char
                } else {
                  // Settled to final value
                  return char
                }
              }
              
              // Already settled characters (to the right)
              return char
            }).join('')
            
            setDisplayValue(displayChars)
            currentCycle++
            
            if (currentCycle >= cyclesPerChar) {
              currentCharIndex--
              currentCycle = 0
            }
          } else {
            setDisplayValue(value)
            clearInterval(interval)
          }
        }, cycleTime)

        return () => clearInterval(interval)
        
      } else {
        // WALLET SWITCH ANIMATION: Align integers at decimal, pad left, animate right-to-left
        const oldString = previousValue
        const newString = value
        
        // Split at decimal (assume always present with fixed decimals)
        const [oldInteger, oldDecimal] = oldString.split('.')
        const [newInteger, newDecimal] = newString.split('.')
        
        // Max integer length for left padding
        const maxIntegerLength = Math.max(oldInteger.length, newInteger.length)
        
        // Pad integers on left with spaces
        const paddedOldInteger = oldInteger.padStart(maxIntegerLength, ' ')
        const paddedNewInteger = newInteger.padStart(maxIntegerLength, ' ')
        
        // Full padded strings (integer + '.' + decimal)
        const paddedOld = paddedOldInteger + '.' + oldDecimal
        const paddedNew = paddedNewInteger + '.' + newDecimal
        const paddedLength = paddedOld.length
        
        // Start with previous value displayed
        setDisplayValue(oldString)
        
        // Find positions that need changes
        const positionsToChange: number[] = []
        for (let i = 0; i < paddedLength; i++) {
          if (paddedOld[i] !== paddedNew[i] && paddedNew[i] !== ' ') {
            positionsToChange.push(i)
          }
        }
        
        // Force animation for identical values
        if (positionsToChange.length === 0) {
          for (let i = 0; i < paddedLength; i++) {
            if (paddedNew[i].match(/\d/)) {
              positionsToChange.push(i)
            }
          }
        }
        
        console.log('Wallet switch animation:', { 
          oldString, 
          newString, 
          paddedOld, 
          paddedNew, 
          positionsToChange 
        })
        
        let currentCharIndex = Math.max(...positionsToChange)
        let currentCycle = 0
        const cyclesPerChar = Math.floor(timePerChar / cycleTime)
        
        const interval = setInterval(() => {
          if (currentCharIndex >= 0) {
            // Build padded display
            const displayPadded = paddedOld.split('')
            
            for (let i = 0; i < paddedLength; i++) {
              if (positionsToChange.includes(i)) {
                if (i === currentCharIndex) {
                  if (currentCycle < cyclesPerChar) {
                    const targetChar = paddedNew[i]
                    if (targetChar.match(/\d/)) {
                      displayPadded[i] = Math.floor(Math.random() * 10).toString()
                    } else {
                      displayPadded[i] = targetChar
                    }
                  } else {
                    displayPadded[i] = paddedNew[i]
                  }
                } else if (i > currentCharIndex) {
                  displayPadded[i] = paddedNew[i]
                }
              }
            }
            
            // Build final display string (remove leading spaces)
            let displayString = displayPadded.join('').trimStart()
            
            console.log('Display update:', displayString)
            setDisplayValue(displayString)
            currentCycle++
            
            if (currentCycle >= cyclesPerChar) {
              const nextIndex = positionsToChange.findLast(idx => idx < currentCharIndex)
              currentCharIndex = nextIndex !== undefined ? nextIndex : -1
              currentCycle = 0
            }
          } else {
            setDisplayValue(value)
            clearInterval(interval)
          }
        }, cycleTime)

        return () => clearInterval(interval)
      }
    }, delay * 1000)

    return () => clearTimeout(startDelay)
  }, [value, previousValue, delay])

  return (
    <span className={className}>
      {displayValue}
    </span>
  )
}

const MAX_WALLETS = 10 // Maximum wallets per user

type ActivePanel = null | 'xfer' | 'trade' | 'spin'

function WalletPageContent() {
  const { wallets, selectedWalletIndex, setSelectedWalletIndex, currentWallet, addWallet, fdv, updateWalletBalance, ccPrice } = useWallet()
  const { theme, toggleTheme } = useTheme()
  const [showWalletDropdown, setShowWalletDropdown] = useState(false)
  const [showCreateWallet, setShowCreateWallet] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [betAmount, setBetAmount] = useState(10)
  const [isSpinning, setIsSpinning] = useState(false)
  const [reels, setReels] = useState(['7', '💎', '🍒'])
  const [showWinPopup, setShowWinPopup] = useState(false)
  const [winAmount, setWinAmount] = useState(0)
  const [winMultiplier, setWinMultiplier] = useState(0)
  const [lastPayout, setLastPayout] = useState(0)
  const [showIdleAnimation, setShowIdleAnimation] = useState(true)
  const idleAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showDollarSign, setShowDollarSign] = useState(false)
  const [dollarRotation, setDollarRotation] = useState(0)
  const [dollarPosition, setDollarPosition] = useState({ x: 0, y: 0 })
  const dollarTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [dollarOpacity, setDollarOpacity] = useState(0)
  
  // Track previous balance values for smooth transitions
  const [previousBalances, setPreviousBalances] = useState({
    cc: "0",
    cusd: "0",
    usd: "0"
  })
  const prevWalletIndexRef = useRef<number>(selectedWalletIndex)
  const [animationKey, setAnimationKey] = useState(0)
  
  // Update previous balances when wallet changes
  useEffect(() => {
    if (currentWallet && prevWalletIndexRef.current !== selectedWalletIndex) {
      // Store the current display values as previous before switching
      const prevWallet = wallets[prevWalletIndexRef.current]
      if (prevWallet) {
        setPreviousBalances({
          cc: prevWallet.balance.cc.toFixed(4),
          cusd: prevWallet.balance.cusd.toFixed(4),
          usd: prevWallet.balance.usd.toFixed(2)
        })
      }
      prevWalletIndexRef.current = selectedWalletIndex
      setAnimationKey(prev => prev + 1) // Force re-animation
    }
  }, [selectedWalletIndex, currentWallet, wallets])

  // Random dollar sign appearance
  useEffect(() => {
    // Don't schedule if spin panel is active
    if (activePanel === 'spin') {
      setShowDollarSign(false)
      return
    }

    const scheduleNextDollar = () => {
      // Testing: appear every 5 seconds
      const delay = 5000
      
      dollarTimeoutRef.current = setTimeout(() => {
        // Set random rotation between -20 and 20 degrees
        setDollarRotation(Math.random() * 40 - 20)
        
        // Set random position (10-90% to avoid edges)
        setDollarPosition({
          x: Math.random() * 80 + 10, // 10% to 90%
          y: Math.random() * 80 + 10  // 10% to 90%
        })
        
        setShowDollarSign(true)
        
        // Hide after 3 seconds
        setTimeout(() => {
          setShowDollarSign(false)
          // Schedule next appearance
          scheduleNextDollar()
        }, 3000)
      }, delay)
    }
    
    scheduleNextDollar()
    
    return () => {
      if (dollarTimeoutRef.current) {
        clearTimeout(dollarTimeoutRef.current)
      }
    }
  }, [activePanel])
  
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
      balance: { cc: 0, usd: 0, cusd: 0 }
    }
    
    addWallet(newWallet)
    setShowCreateWallet(false)
  }

  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 })
  
  const handleMouseMove = (e: MouseEvent) => {
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight
    setCursorPosition({ x, y })
    
    // Calculate distance from cursor to $ position (bottom-8 left-8 = ~32px from edges)
    // $ is at approximately (32 + padding, window.innerHeight - 32 - padding)
    const dollarX = 32 + 48 // left-8 + padding from outer container + some extra
    const dollarY = window.innerHeight - 32 - 48 // bottom-8 + padding
    
    const distance = Math.sqrt(
      Math.pow(e.clientX - dollarX, 2) + 
      Math.pow(e.clientY - dollarY, 2)
    )
    
    // Make visible when cursor is within 200px, fade from 0 to 1
    const maxDistance = 200
    if (distance < maxDistance) {
      const opacity = (1 - distance / maxDistance)
      setDollarOpacity(opacity)
    } else {
      setDollarOpacity(0)
    }
  }

  // Calculate colors from three gradient planes based on cursor position (same as TradeModal)
  const getGradientColors = () => {
    const { x, y } = cursorPosition
    
    // Layer 1: Vibrant Red-Orange to Bright Cyan gradient (horizontal)
    const layer1 = {
      r: Math.round(255 + (30 - 255) * x),
      g: Math.round(85 + (220 - 85) * x),
      b: Math.round(30 + (255 - 30) * x)
    }
    
    // Layer 2: Hot Magenta to Vibrant Yellow gradient (vertical)
    const layer2 = {
      r: Math.round(255),
      g: Math.round(50 + (245 - 50) * y),
      b: Math.round(180 + (50 - 180) * y)
    }
    
    // Layer 3: Electric Lime to Bright Blue gradient (diagonal)
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

  const togglePanel = (panel: 'xfer' | 'trade' | 'spin') => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  // Slot machine symbols
  const symbols = ['7', '💎', '🔔', '🍊', '🍋', '🍒']
  
  // Calculate spin result based on bet amount and desired EV
  const calculateSpinResult = (bet: number) => {
    // EV per bet size: 1CC=+0.1, 10CC=+0.2, 100CC=+0.3, 1000CC=+0.4
    const evMap: { [key: number]: number } = {
      1: 0.1,
      10: 0.2,
      100: 0.3,
      1000: 0.4
    }
    const targetEV = evMap[bet] || 0.1
    
    // Calculate target multiplier (bet + EV) / bet
    // e.g., for 10 CC bet with 0.2 EV: (10 + 0.2) / 10 = 1.02x average
    const targetMultiplier = (bet + targetEV) / bet
    
    // Weighted outcomes to achieve target EV
    // Most spins are small losses, rare spins are big wins
    const random = Math.random()
    
    let multiplier = 0
    let resultSymbols: string[] = []
    
    // Fixed high win probabilities and their contribution
    const p4 = 0.08;  // 2x
    const p5 = 0.04;  // 3x
    const p6 = 0.02;  // 5x
    const p7 = 0.008; // 10x
    const p8 = 0.002; // 15x
    const p_high = p4 + p5 + p6 + p7 + p8; // 0.15
    const contrib_high = 2*p4 + 3*p5 + 5*p6 + 10*p7 + 15*p8; // 0.49
    
    // Fixed p2 (0.5x)
    const p2 = 0.3;
    
    // Remaining probability for p1 and p3
    const p_remaining = 1 - p_high - p2; // 0.55
    
    // Solve for p1 (0.3x) to hit exact target
    // From derivation: p1 = (1.19 - targetMultiplier) / 0.7
    const p1 = (1.19 - targetMultiplier) / 0.7;
    const p3 = p_remaining - p1;
    
    // Cumulative probabilities
    const cum1 = p1;
    const cum2 = cum1 + p2;
    const cum3 = cum2 + p3;
    const cum4 = cum3 + p4;
    const cum5 = cum4 + p5;
    const cum6 = cum5 + p6;
    const cum7 = cum6 + p7;
    // cum8 = 1
    
    if (random < cum1) {
      // Small loss - mixed symbols (but still get something back)
      multiplier = 0.3
      resultSymbols = [symbols[0], symbols[1], symbols[2]] // Mixed symbols
    } else if (random < cum2) {
      // Lose half - cherry match
      multiplier = 0.5
      resultSymbols = ['🍒', '🍒', '🍒']
    } else if (random < cum3) {
      // Break even - lemon match
      multiplier = 1.0
      resultSymbols = ['🍋', '🍋', '🍋']
    } else if (random < cum4) {
      // Small win - orange match
      multiplier = 2.0
      resultSymbols = ['🍊', '🍊', '🍊']
    } else if (random < cum5) {
      // Medium win - bell match
      multiplier = 3.0
      resultSymbols = ['🔔', '🔔', '🔔']
    } else if (random < cum6) {
      // Good win - diamond match
      multiplier = 5.0
      resultSymbols = ['💎', '💎', '💎']
    } else if (random < cum7) {
      // Great win - double diamond
      multiplier = 10.0
      resultSymbols = ['💎', '💎', '7']
    } else {
      // Jackpot - triple seven
      multiplier = 15.0
      resultSymbols = ['7', '7', '7']
    }
    
    return {
      multiplier,
      symbols: resultSymbols,
      payout: bet * multiplier
    }
  }

  const handleSpin = async () => {
    if (isSpinning || currentWallet.balance.cc < betAmount) return
    
    setIsSpinning(true)
    setShowIdleAnimation(false)
    
    // Clear any pending idle animation restart
    if (idleAnimationTimeoutRef.current) {
      clearTimeout(idleAnimationTimeoutRef.current)
      idleAnimationTimeoutRef.current = null
    }
    
    // Deduct bet amount immediately
    const newCCBalance = currentWallet.balance.cc - betAmount
    const newUSDBalance = newCCBalance * ccPrice
    updateWalletBalance(selectedWalletIndex, { 
      cc: newCCBalance, 
      usd: newUSDBalance,
      cusd: currentWallet.balance.cusd 
    })
    
    // Spin animation (random symbols cycling)
    const spinDuration = 2000 // 2 seconds
    const interval = 100
    const spinInterval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ])
    }, interval)
    
    // Calculate result
    const result = calculateSpinResult(betAmount)
    
    // Stop spinning and show result
    setTimeout(() => {
      clearInterval(spinInterval)
      setReels(result.symbols)
      
      // Update wallet balance with payout
      if (result.payout > 0) {
        const finalCCBalance = newCCBalance + result.payout
        const finalUSDBalance = finalCCBalance * ccPrice
        updateWalletBalance(selectedWalletIndex, { 
          cc: finalCCBalance, 
          usd: finalUSDBalance,
          cusd: currentWallet.balance.cusd 
        })
      }
      
      setIsSpinning(false)
      
      // Update last payout display
      setLastPayout(result.payout)
      
      // Show win popup for big wins (3x or more)
      if (result.multiplier >= 3) {
        setWinAmount(result.payout) // Total payout amount
        setWinMultiplier(result.multiplier)
        setShowWinPopup(true)
        
        // Auto-hide popup after 3 seconds
        setTimeout(() => setShowWinPopup(false), 3000)
      }
      
      // Restart idle animation after a delay
      idleAnimationTimeoutRef.current = setTimeout(() => {
        setShowIdleAnimation(true)
        idleAnimationTimeoutRef.current = null
      }, 5000)
    }, spinDuration)
  }

  return (
    <main 
      className={`relative min-h-screen flex flex-col select-none transition-colors duration-300 overflow-hidden p-12 ${
        theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-100'
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Main Floating Card Container with Glow */}
      <div className="relative flex-1 flex flex-col">
        {/* Dynamic Gradient Glow - Behind the card */}
        <div 
          className="absolute -inset-8 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle 1000px at ${cursorPosition.x * 100}% ${cursorPosition.y * 100}%, ${getGradientColors().layer1.replace('rgb(', 'rgba(').replace(')', ', 0.5)')}, ${getGradientColors().layer2.replace('rgb(', 'rgba(').replace(')', ', 0.3)')}, ${getGradientColors().layer3.replace('rgb(', 'rgba(').replace(')', ', 0.15)')}, transparent 75%)`,
            zIndex: 0
          }}
        />
        <div 
          className="absolute -inset-4 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle 600px at ${cursorPosition.x * 100}% ${cursorPosition.y * 100}%, ${getGradientColors().layer1.replace('rgb(', 'rgba(').replace(')', ', 0.8)')}, ${getGradientColors().layer2.replace('rgb(', 'rgba(').replace(')', ', 0.6)')}, ${getGradientColors().layer3.replace('rgb(', 'rgba(').replace(')', ', 0.3)')}, transparent 65%)`,
            filter: 'blur(20px)',
            zIndex: 0
          }}
        />
        
        {/* Main Card */}
        <div 
          className={`relative flex-1 flex flex-col rounded-3xl border-2 shadow-2xl backdrop-blur-sm transition-colors duration-300 overflow-hidden z-10 ${
            theme === 'dark' 
              ? 'bg-[#1a1a1a] border-[#3a3a3a]' 
              : 'bg-white border-gray-300'
          }`}
          style={{
            boxShadow: theme === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
      {/* Secret Dollar Sign - Inside card, visible only when cursor is near */}
      {theme === 'dark' && activePanel !== 'spin' && (
        <button
          onClick={() => {
            setShowDollarSign(false)
            togglePanel('spin')
          }}
          className="absolute bottom-0 left-0 z-40 cursor-pointer pt-4 pb-12 pl-8 pr-8"
          style={{ opacity: dollarOpacity * 0.6 }}
        >
          <svg width="72" height="72" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="dollarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: getGradientColors().layer1, stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: getGradientColors().layer2, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: getGradientColors().layer3, stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <text 
              x="50" 
              y="75" 
              fontSize="80" 
              fontWeight="700" 
              fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif" 
              textAnchor="middle"
              fill="url(#dollarGradient)"
              className="transition-all duration-500 ease-out"
              style={{ pointerEvents: 'none' }}
            >
              $
            </text>
          </svg>
        </button>
      )}
      {/* Theme Toggle Button - Bottom Right */}
      {activePanel !== 'spin' && (
      <button
        onClick={toggleTheme}
        className={`absolute bottom-8 right-8 z-50 p-4 rounded-full transition-all duration-300 shadow-lg ${
          theme === 'dark' 
            ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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
      )}
      
      {/* Header - Trngl on left, Txn history on right */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-40">
        <div className="flex flex-col">
          <h1 className={`text-7xl font-bold transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>TRNG.le</h1>
          <div className="flex items-center gap-3 mt-2">
            {/* Wallet Dropdown */}
            <div className="relative flex items-center">
              <button
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className={`transition-colors flex items-center ${
                  activePanel === 'spin'
                    ? 'text-[#666] hover:text-[#888]'
                    : theme === 'dark' ? 'text-[#999] hover:text-white' : 'text-gray-600 hover:text-black'
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
                          <p className={`text-sm font-mono ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>...{wallet.address.slice(-8)}</p>
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
                activePanel === 'spin'
                  ? 'text-[#666] hover:text-[#888]'
                  : theme === 'dark' ? 'text-[#999] hover:text-[#ccc]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {displayAddress}
            </a>
            <button 
              onClick={handleCopyAddress}
              className={`transition-colors relative ${
                activePanel === 'spin'
                  ? 'text-[#666] hover:text-[#888]'
                  : theme === 'dark' ? 'text-[#999] hover:text-white' : 'text-gray-600 hover:text-black'
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

      {/* Main Content Container - Animates vertically only for XFER */}
      <div className="absolute inset-0 flex items-center justify-center">
      <motion.div 
        className="w-full flex flex-col items-center justify-center relative"
        initial={{ y: 0 }}
        animate={{
          y: activePanel === 'xfer' ? 20  : 0
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut"
        }}
      >
        {/* Wallet Balance Section */}
        <motion.div 
          className="text-center"
          initial={{ x: 0, scale: 1, opacity: 1 }}
          animate={{
            x: activePanel === 'trade' ? '-100%' : 0,
            scale: activePanel === 'trade' ? 0.5 : activePanel === 'spin' ? 0 : 1,
            opacity: activePanel === 'spin' ? 0 : 1
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
        >
          <h2 className={`text-8xl font-bold mb-12 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>Wallet Balance</h2>
          
          <div className="mb-12">
            <div className="flex justify-center">
              <p 
                className={`text-7xl font-mono transition-colors ${
                  theme === 'dark' ? 'text-[#ccc]' : 'text-gray-600'
                }`}
              >
                <AnimatedNumber value={currentWallet.balance.cc.toFixed(4)} previousValue={previousBalances.cc} delay={0} className="" key={animationKey} /> CC
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <motion.p 
                className={`text-6xl font-mono transition-colors ${
                  theme === 'dark' ? 'text-[#aaa]' : 'text-gray-500'
                }`}
                initial={{ opacity: 1 }}
                animate={{
                  opacity: activePanel === 'trade' ? 0.7 : 1
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut"
                }}
              >
                <AnimatedNumber value={currentWallet.balance.cusd.toFixed(4)} previousValue={previousBalances.cusd} delay={0} className="" key={animationKey} /> CUSD
              </motion.p>
            </div>
            <motion.p 
              className={`text-5xl font-mono mt-2 transition-colors text-center ${
                theme === 'dark' ? 'text-[#999]' : 'text-gray-500'
              }`}
              initial={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }}
              animate={{
                opacity: activePanel ? 0 : 1,
                height: activePanel === 'xfer' ? 0 : 'auto',
                marginTop: activePanel === 'xfer' ? 0 : '0.5rem'
              }}
              transition={{
                duration: 0.4,
                ease: "easeInOut"
              }}
            >
              $<AnimatedNumber value={currentWallet.balance.usd.toFixed(2)} previousValue={previousBalances.usd} delay={0} className="" key={animationKey} />
            </motion.p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-8 items-center justify-center">
            <motion.button
              initial={{ x: 0, opacity: 1 }}
              animate={{ 
                x: activePanel === 'xfer' ? 110 : 0,
                opacity: activePanel === 'trade' ? 0 : 1
              }}
              transition={{ 
                duration: 0.4, 
                ease: "easeInOut"
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
              style={{ pointerEvents: activePanel === 'trade' ? 'none' : 'auto' }}
            >
              XFER
            </motion.button>
            
            <motion.button
              initial={{ x: 0, opacity: 1 }}
              animate={{ 
                x: activePanel === 'xfer' ? 110 : 0,
                opacity: activePanel === 'xfer' || activePanel === 'trade' ? 0 : 1
              }}
              transition={{ 
                duration: 0.4, 
                ease: "easeInOut"
              }}
              onClick={() => togglePanel('trade')}
              className={`px-16 py-6 font-bold text-2xl rounded-lg ${
                theme === 'dark' 
                  ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white' 
                  : 'bg-gray-400 hover:bg-gray-500 text-white'
              }`}
              style={{ pointerEvents: activePanel === 'trade' || activePanel === 'xfer' ? 'none' : 'auto' }}
            >
              TRADE
            </motion.button>
          </div>
        </motion.div>
        
        {/* XFER Panel - Expands below */}
        <AnimatePresence>
          {activePanel === 'xfer' && (
            <motion.div
              key="xfer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: "easeInOut"
              }}
              className="w-full max-w-4xl overflow-hidden"
            >
              <div className="pt-8 pb-12">
                <XferModal isOpen={true} onClose={() => setActivePanel(null)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
      </div>

      {/* TRADE Panel - Slides in from right to center */}
      <AnimatePresence>
        {activePanel === 'trade' && (
          <motion.div
            key="trade"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeInOut"
            }}
            className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none"
          >
            <div className="w-full max-w-xl pointer-events-auto relative">
              <button
                onClick={() => setActivePanel(null)}
                className={`absolute -top-12 right-0 p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-[#2a2a2a] text-white' 
                    : 'hover:bg-gray-200 text-black'
                }`}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <TradeModal isOpen={true} onClose={() => setActivePanel(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Gradient Background - Shows when spin panel is active */}
      <AnimatePresence>
        {activePanel === 'spin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-20 gradient-animated-bg"
            style={{
              '--gradient-color-1': getGradientColors().layer1,
              '--gradient-color-2': getGradientColors().layer2,
              '--gradient-color-3': getGradientColors().layer3,
            } as React.CSSProperties}
          />
        )}
      </AnimatePresence>
      
      {/* SPIN Panel - Slot Machine Feature */}
      <AnimatePresence>
        {activePanel === 'spin' && (
          <motion.div
            key="spin"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center"
          >
            <div className="relative pointer-events-auto">
              {/* Close Button */}
              <button
                onClick={() => setActivePanel(null)}
                className={`absolute -top-16 right-0 p-6 transition-all z-40 hover:scale-110 ${
                  theme === 'dark' 
                    ? 'text-white hover:text-gray-300' 
                    : 'text-black hover:text-gray-600'
                }`}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {/* Large Slot Machine */}
              <motion.div 
                className="relative"
                style={{
                  borderRadius: '24px 24px 16px 16px',
                  background: theme === 'dark'
                    ? 'linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 30%, #2a2a2a 60%, #1a1a1a 100%)'
                    : 'linear-gradient(145deg, #f5f5f5 0%, #e0e0e0 30%, #d0d0d0 60%, #b0b0b0 100%)',
                  boxShadow: theme === 'dark'
                    ? '0 20px 50px rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.1), inset 0 -3px 6px rgba(0,0,0,0.3)'
                    : '0 20px 50px rgba(0,0,0,0.25), inset 0 2px 3px rgba(255,255,255,0.8), inset 0 -3px 6px rgba(0,0,0,0.15)',
                  border: theme === 'dark' ? '3px solid #5a5a5a' : '3px solid #a0a0a0',
                  padding: '0',
                  overflow: 'visible',
                  willChange: 'transform'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Rounded Top Panel with Title */}
                <div 
                  className="relative px-8 py-6"
                  style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)'
                      : 'linear-gradient(180deg, #e5e5e5 0%, #d0d0d0 100%)',
                    borderBottom: theme === 'dark' ? '3px solid #1a1a1a' : '3px solid #a0a0a0',
                    borderRadius: '24px 24px 0 0',
                    boxShadow: theme === 'dark'
                      ? 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.5)'
                      : 'inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <motion.h1 
                    className="text-4xl font-black text-center tracking-wider"
                    style={{
                      color: theme === 'dark' ? '#e0e0e0' : '#2a2a2a',
                      textShadow: theme === 'dark'
                        ? '0 2px 4px rgba(0,0,0,0.8), 0 -1px 1px rgba(255,255,255,0.1)'
                        : '0 2px 4px rgba(0,0,0,0.2), 0 -1px 1px rgba(255,255,255,0.9)'
                    }}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    SLOTS
                  </motion.h1>
                </div>

                {/* Main Body */}
                <div className="px-8 py-6 pb-10"
                  style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)'
                      : 'linear-gradient(180deg, #d0d0d0 0%, #b0b0b0 100%)',
                    borderRadius: '0 0 16px 16px',
                    overflow: 'hidden'
                  }}
                >
                {/* Metallic shine overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 30%, transparent 50%, rgba(255,255,255,0.08) 80%, transparent 100%)'
                      : 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.6) 30%, transparent 50%, rgba(255,255,255,0.8) 80%, transparent 100%)',
                    borderRadius: '24px 24px 16px 16px'
                  }}
                />
                
                {/* Slot Machine Display Window - Deep Inset */}
                <div className="relative rounded-xl mb-6"
                  style={{
                    background: theme === 'dark' ? '#0a0a0a' : '#1a1a1a',
                    padding: '24px',
                    boxShadow: theme === 'dark'
                      ? 'inset 0 6px 12px rgba(0,0,0,0.8), inset 0 -2px 4px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.5)'
                      : 'inset 0 6px 12px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)',
                    border: theme === 'dark' ? '4px solid #1a1a1a' : '4px solid #2a2a2a'
                  }}
                >
                  <div className="flex gap-4 justify-center">
                    {/* Slot Reels */}
                    {[0, 1, 2].map((index) => (
                      <motion.div 
                        key={index}
                        className={`w-32 h-40 rounded-xl flex items-center justify-center font-bold text-6xl overflow-hidden ${
                          theme === 'dark' 
                            ? 'bg-gradient-to-b from-white to-gray-200 text-black border-4 border-gray-600 shadow-inner' 
                            : 'bg-gradient-to-b from-white to-gray-100 text-black border-4 border-gray-400 shadow-inner'
                        }`}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      >
                      <motion.div
                        animate={!isSpinning && showIdleAnimation ? {
                          y: [0, -10, 10, -8, 8, 0],
                        } : {
                          y: 0
                        }}
                        transition={!isSpinning && showIdleAnimation ? {
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 10,
                          delay: index * 0.3,
                          ease: "easeInOut"
                        } : {
                          duration: 0
                        }}
                        className="font-mono"
                      >
                        {reels[index]}
                      </motion.div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Win Line Indicator */}
                  <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 ${
                    theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500'
                  } opacity-30`}></div>
                </div>

                {/* Control Panel */}
                <div className="mb-6">
                  {/* Top Row - Won and Bet */}
                  <div className="flex justify-between items-center gap-3 mb-3">
                    {/* Won Display - Inset Panel */}
                    <div className="px-6 py-3 rounded-lg flex-1"
                      style={{
                        background: theme === 'dark' ? '#1a1a1a' : '#2a2a2a',
                        boxShadow: theme === 'dark'
                          ? 'inset 0 4px 8px rgba(0,0,0,0.7), inset 0 -1px 2px rgba(255,255,255,0.05)'
                          : 'inset 0 4px 8px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.1)',
                        border: theme === 'dark' ? '2px solid #0a0a0a' : '2px solid #1a1a1a'
                      }}
                    >
                      <p className="text-xs font-semibold tracking-wider" style={{ color: '#888' }}>WON</p>
                      <p className="text-2xl font-bold" style={{ 
                        color: lastPayout > 0 ? '#4ade80' : theme === 'dark' ? '#e0e0e0' : '#f0f0f0',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}>
                        {lastPayout.toFixed(2)} CC
                      </p>
                    </div>

                    {/* Bet Display - Inset Panel */}
                    <div className="px-6 py-3 rounded-lg flex-1"
                      style={{
                        background: theme === 'dark' ? '#1a1a1a' : '#2a2a2a',
                        boxShadow: theme === 'dark'
                          ? 'inset 0 4px 8px rgba(0,0,0,0.7), inset 0 -1px 2px rgba(255,255,255,0.05)'
                          : 'inset 0 4px 8px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.1)',
                        border: theme === 'dark' ? '2px solid #0a0a0a' : '2px solid #1a1a1a'
                      }}
                    >
                      <p className="text-xs font-semibold tracking-wider" style={{ color: '#888' }}>BET</p>
                      <p className="text-2xl font-bold" style={{ 
                        color: theme === 'dark' ? '#e0e0e0' : '#f0f0f0',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}>
                        {betAmount} CC
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row - Balance (smaller) */}
                  <div className="px-4 py-2 rounded-lg"
                    style={{
                      background: theme === 'dark' ? '#1a1a1a' : '#2a2a2a',
                      boxShadow: theme === 'dark'
                        ? 'inset 0 3px 6px rgba(0,0,0,0.7), inset 0 -1px 2px rgba(255,255,255,0.05)'
                        : 'inset 0 3px 6px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.1)',
                      border: theme === 'dark' ? '2px solid #0a0a0a' : '2px solid #1a1a1a'
                    }}
                  >
                    <p className="text-xs font-semibold tracking-wider text-center" style={{ color: '#888' }}>BALANCE</p>
                    <p className="text-lg font-bold text-center" style={{ 
                      color: theme === 'dark' ? '#e0e0e0' : '#f0f0f0',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}>
                      {currentWallet.balance.cc.toFixed(2)} CC
                    </p>
                  </div>
                </div>

                {/* Bet Selection */}
                <div className="flex gap-3 justify-center mb-6">
                  {[1, 10, 100, 1000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className={`relative px-6 py-3 rounded-lg font-bold text-lg transition-all duration-150 ${
                        betAmount === amount ? 'translate-y-0.5' : 'hover:translate-y-0.5'
                      }`}
                      style={{
                        background: betAmount === amount
                          ? 'linear-gradient(180deg, #ffd700 0%, #f4c430 50%, #daa520 100%)'
                          : 'linear-gradient(180deg, #f4c430 0%, #daa520 60%, #c4941f 100%)',
                        boxShadow: betAmount === amount
                          ? 'inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.2)'
                          : '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.2)',
                        border: betAmount === amount
                          ? '2px solid #b8860b'
                          : '2px solid #c4941f',
                        color: '#2a2210',
                        textShadow: '0 1px 1px rgba(0,0,0,0.3)'
                      }}
                    >
                      {amount} CC
                    </button>
                  ))}
                </div>

                {/* Spin Button - Large Golden Button */}
                <motion.button
                  onClick={handleSpin}
                  disabled={isSpinning || currentWallet.balance.cc < betAmount}
                  whileHover={{ scale: isSpinning ? 1 : 1.01 }}
                  whileTap={{ scale: isSpinning ? 1 : 0.99 }}
                  className="w-full py-6 rounded-xl font-black text-3xl tracking-wider relative mb-2"
                  style={{
                    background: isSpinning || currentWallet.balance.cc < betAmount
                      ? 'linear-gradient(180deg, #888 0%, #666 50%, #444 100%)'
                      : 'linear-gradient(180deg, #ffd700 0%, #f4c430 30%, #daa520 70%, #c4941f 100%)',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.2)',
                    border: '2px solid #c4941f',
                    color: '#2a2210',
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    cursor: isSpinning || currentWallet.balance.cc < betAmount ? 'not-allowed' : 'pointer',
                    opacity: isSpinning || currentWallet.balance.cc < betAmount ? 0.6 : 1
                  }}
                >
                  {isSpinning ? 'SPINNING...' : 'SPIN TO WIN'}
                </motion.button>
                </div>

                {/* Slot Machine Pull Lever - Right Side */}
                {/* Lever Arm and Bottom Handle - Behind machine */}
                <div 
                  className="absolute -right-8 top-[20%] -z-10"
                  style={{
                    zIndex: -1
                  }}
                >
                  {/* Vertical Arm - Static */}
                  <div 
                    className="relative w-6 h-52 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #5a5a5a 0%, #4a4a4a 20%, #3a3a3a 50%, #2a2a2a 80%, #1a1a1a 100%)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.8), inset 2px 0 3px rgba(255,255,255,0.2), inset -2px 0 3px rgba(0,0,0,0.5)',
                      border: '2px solid #6a6a6a'
                    }}
                  >
                    {/* Horizontal Handle Bar at bottom */}
                    <div 
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-6 rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 20%, #3a3a3a 50%, #2a2a2a 80%, #1a1a1a 100%)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.7), inset 0 2px 3px rgba(255,255,255,0.2), inset 0 -2px 3px rgba(0,0,0,0.5)',
                        border: '2px solid #6a6a6a'
                      }}
                    />
                  </div>
                </div>
                
                {/* Red Ball Handle - In front of machine */}
                <div 
                  className="absolute -right-8 top-[20%]"
                  style={{
                    zIndex: 50
                  }}
                >
                  <div 
                    className="absolute -top-6 w-14 h-14 rounded-full"
                    style={{
                      left: '-39px',
                      background: 'radial-gradient(circle at 35% 35%, #ff5555 0%, #ff3333 15%, #ee2222 30%, #dc2626 45%, #cc1111 60%, #aa1111 75%, #991b1b 85%, #7f1d1d 100%)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.7), inset -3px -3px 6px rgba(0,0,0,0.6), inset 3px 3px 6px rgba(255,120,120,0.5), 0 0 20px rgba(220,38,38,0.3)',
                      border: '3px solid #8b1f1f'
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winnings Popup */}
      <AnimatePresence>
        {showWinPopup && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
          >
            <div 
              className="relative px-12 py-8 rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 20%, #ffd700 40%, #f4c430 60%, #daa520 80%, #d4af37 100%)',
                boxShadow: '0 10px 40px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4), inset 0 2px 4px rgba(255,255,255,0.5)',
                border: '4px solid #b8860b'
              }}
            >
              {/* Sparkle effects */}
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-4 -right-4 text-4xl"
              >
                ✨
              </motion.div>
              <motion.div
                animate={{ 
                  rotate: [360, 0],
                  scale: [1, 1.3, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-4 -left-4 text-4xl"
              >
                ✨
              </motion.div>
              
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="text-center"
              >
                <p className="text-6xl font-black mb-2" style={{
                  color: '#2a2210',
                  textShadow: '0 3px 6px rgba(0,0,0,0.5), 0 -1px 2px rgba(255,255,255,0.5)'
                }}>
                  BIG WIN!
                </p>
                <p className="text-5xl font-bold mb-2" style={{
                  color: '#3a3020',
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                }}>
                  {winMultiplier.toFixed(1)}x
                </p>
                <p className="text-4xl font-bold" style={{
                  color: '#2a2210',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  +{winAmount.toFixed(2)} CC
                </p>
              </motion.div>

              {/* Shine effect */}
              <motion.div
                animate={{
                  x: ['-200%', '200%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                  width: '30%'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom - FDV */}
      {activePanel !== 'spin' && (
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-40">
        <p className={`text-2xl font-mono transition-colors ${
          theme === 'dark' ? 'text-[#999]' : 'text-gray-500'
        }`}>
          CC = {fdv} FDV
        </p>
      </div>
      )}

      {/* Transaction History - Inside Card */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: showTransactions ? '0%' : '100%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className={`absolute top-0 right-0 h-full w-1/3 shadow-2xl z-50 rounded-r-3xl overflow-hidden ${
          theme === 'dark' ? 'bg-[#1a1a1a] border-l-2 border-[#3a3a3a]' : 'bg-white border-l-2 border-gray-300'
        }`}
      >
        <TransactionHistory isOpen={showTransactions} onClose={() => setShowTransactions(false)} />
      </motion.div>
        </div>
        {/* End of Main Card */}
      </div>
      {/* End of Main Floating Card Container with Glow */}
      
      {/* Create Wallet Modal */}
      <CreateWalletModal isOpen={showCreateWallet} onClose={() => setShowCreateWallet(false)} onCreate={handleCreateWallet} />
      
      {/* Backdrop for Create Wallet */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-500 ${showCreateWallet ? 'opacity-30' : 'opacity-0 pointer-events-none'}`}
        onClick={() => {
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
