'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Wallet {
  label: string
  address: string
  balance: {
    cc: number
    usd: number
    cusd: number
  }
}

interface WalletContextType {
  wallets: Wallet[]
  selectedWalletIndex: number
  setSelectedWalletIndex: (index: number) => void
  addWallet: (wallet: Wallet) => void
  updateWalletBalance: (index: number, balance: { cc: number; usd: number; cusd: number }) => void
  currentWallet: Wallet
  fdv: string
  ccPrice: number
  bronPrice: number
  ethPrice: number
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Total supply of CC tokens
const CC_TOTAL_SUPPLY = 32889473226.7744

function formatFDV(fdvValue: number): string {
  if (fdvValue === 0) {
    return "0.00"
  }
  if (fdvValue >= 1e9) {
    return `${(fdvValue / 1e9).toFixed(2)}bn`
  } else if (fdvValue >= 1e6) {
    return `${(fdvValue / 1e6).toFixed(2)}m`
  } else if (fdvValue >= 1e3) {
    return `${(fdvValue / 1e3).toFixed(2)}k`
  }
  return fdvValue.toFixed(2)
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [ccPrice, setCCPrice] = useState(0) // Start at 0 until real price loads
  const [bronPrice, setBRONPrice] = useState(0) // Start at 0 until real price loads
  const [ethPrice, setETHPrice] = useState(0) // Start at 0 until real price loads
  const [fdv, setFdv] = useState("0.00") // Will be calculated from price
  
  const [wallets, setWallets] = useState<Wallet[]>([
    {
      label: "Main Wallet",
      address: "bron::122067a3096266f3cbb9320eeacf64bd5bec8de8f94c1ae605fda3218d3424a16da3",
      balance: { cc: 10000.5234, usd: 0, cusd: 0 } // USD will be calculated from price
    },
    {
      label: "Trading Account",
      address: "bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345",
      balance: { cc: 5432.1234, usd: 0, cusd: 0 }
    },
    {
      label: "Savings Wallet",
      address: "bron::1220ghi012345678901234567890123456789012345678901234567",
      balance: { cc: 25000.0000, usd: 0, cusd: 0 }
    },
    {
      label: "Cold Storage",
      address: "bron::1220jkl345678901234567890123456789012345678901234567890",
      balance: { cc: 50000.0000, usd: 0, cusd: 0 }
    },
    {
      label: "Personal Wallet",
      address: "bron::1220mno678901234567890123456789012345678901234567890123",
      balance: { cc: 1234.5678, usd: 0, cusd: 0 }
    },
    {
      label: "Business Account",
      address: "bron::1220pqr901234567890123456789012345678901234567890123456",
      balance: { cc: 7890.1234, usd: 0, cusd: 0 }
    }
  ])
  
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0)
  
  // Fetch prices from API
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/prices')
        const data = await response.json()
        setCCPrice(data.CC)
        setBRONPrice(data.BRON)
        setETHPrice(data.ETH)
      } catch (error) {
        console.error('Error fetching prices:', error)
      }
    }
    
    // Initial fetch
    fetchPrices()
    
    // Poll every 10 seconds for price updates
    const interval = setInterval(fetchPrices, 10000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Calculate USD values and FDV when price changes
  useEffect(() => {
    // Update wallet USD values
    setWallets(prevWallets => 
      prevWallets.map(wallet => ({
        ...wallet,
        balance: {
          ...wallet.balance,
          usd: wallet.balance.cc * ccPrice
        }
      }))
    )
    
    // Calculate and format FDV
    const fdvValue = CC_TOTAL_SUPPLY * ccPrice
    setFdv(formatFDV(fdvValue))
  }, [ccPrice])

  const addWallet = (wallet: Wallet) => {
    setWallets([...wallets, wallet])
    setSelectedWalletIndex(wallets.length)
  }

  const updateWalletBalance = (index: number, balance: { cc: number; usd: number }) => {
    const updatedWallets = [...wallets]
    updatedWallets[index].balance = balance
    setWallets(updatedWallets)
  }

  const currentWallet = wallets[selectedWalletIndex]

  return (
    <WalletContext.Provider
      value={{
        wallets,
        selectedWalletIndex,
        setSelectedWalletIndex,
        addWallet,
        updateWalletBalance,
        currentWallet,
        fdv,
        ccPrice,
        bronPrice,
        ethPrice
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

