'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatTransactionDate, formatAddress, Transaction } from './transactionUtils'
import { useWallet } from './WalletContext'
import { useTheme } from './ThemeContext'

interface TransactionHistoryProps {
  isOpen: boolean
  onClose: () => void
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const { theme } = useTheme()
  const isDeposit = transaction.type === 'DEPOSIT'
  const isWithdrawal = transaction.type === 'WITHDRAWAL'
  const isBuy = transaction.type === 'BUY'
  const [copiedTxId, setCopiedTxId] = useState(false)
  
  const handleCopyTxId = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(transaction.id)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = transaction.id
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      setCopiedTxId(true)
      setTimeout(() => setCopiedTxId(false), 2000)
    } catch (err) {
      console.error('Failed to copy transaction ID:', err)
    }
  }
  
  return (
    <div className={`p-4 rounded-lg hover:shadow-md transition-shadow ${
      theme === 'dark' ? 'bg-[#2a2a2a] border border-[#3a3a3a]' : 'bg-white border border-gray-300'
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon and Type */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            isBuy ? 'bg-green-100 text-green-600' : 
            isDeposit ? 'bg-blue-100 text-blue-600' : 
            'bg-orange-100 text-orange-600'
          }`}>
            {isDeposit ? (
              // Arrow pointing down (into wallet)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            ) : isWithdrawal ? (
              // Arrow pointing up (out of wallet)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 5 5 12"></polyline>
              </svg>
            ) : (
              // Arrow pointing up (buy/purchase)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 5 5 12"></polyline>
              </svg>
            )}
          </div>
          <div>
            <p className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{transaction.type}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>{formatTransactionDate(transaction.timestamp)}</p>
          </div>
        </div>
        
        {/* Right: Amount */}
        <div className="text-right">
          <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {(transaction.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} CC
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>
            ${(transaction.usdValue || 0).toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Details */}
      <div className={`mt-3 pt-3 border-t space-y-3 ${theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-200'}`}>
        {/* Transaction ID for Deposits and Withdrawals */}
        {(isDeposit || isWithdrawal) && (
          <div className="space-y-1">
            <p className={`text-xs ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>Transaction ID</p>
            <div className="flex items-center gap-2">
              <a
                href={`https://ccview.io/transfers/${transaction.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-mono hover:underline break-all flex-1 ${
                  theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                {transaction.id}
              </a>
              <button 
                onClick={handleCopyTxId}
                className={`transition-colors flex-shrink-0 ${
                  theme === 'dark' ? 'text-[#999] hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
                title="Copy transaction ID"
              >
                <div className="relative w-5 h-5">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className={`absolute inset-0 transition-all duration-300 ${copiedTxId ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className={`absolute inset-0 transition-all duration-300 ${copiedTxId ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}
        
        {isWithdrawal && transaction.toAddress && (
          <div className="space-y-1">
            <p className={`text-xs ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>To</p>
            <p className={`text-sm font-mono break-all ${theme === 'dark' ? 'text-[#ccc]' : 'text-gray-700'}`}>
              {formatAddress(transaction.toAddress, 8)}
            </p>
          </div>
        )}
        {isDeposit && transaction.fromAddress && (
          <div className="space-y-1">
            <p className={`text-xs ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>From</p>
            <p className={`text-sm font-mono break-all ${theme === 'dark' ? 'text-[#ccc]' : 'text-gray-700'}`}>
              {formatAddress(transaction.fromAddress, 8)}
            </p>
          </div>
        )}
        {isBuy && transaction.paidWith && transaction.paidAmount && (
          <div className="flex items-center justify-between">
            <p className={`text-xs ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>Paid with {transaction.paidWith}</p>
            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-[#ccc]' : 'text-gray-700'}`}>
              ${(transaction.paidAmount || 0).toFixed(2)}
            </p>
          </div>
        )}
      </div>
      
      {/* Status Badge */}
      <div className="mt-2">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
          transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {transaction.status.toUpperCase()}
        </span>
      </div>
    </div>
  )
}

export default function TransactionHistory({ isOpen, onClose }: TransactionHistoryProps) {
  const { currentWallet } = useWallet()
  const { theme } = useTheme()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  
  // Fetch transactions from API when wallet changes or panel opens
  useEffect(() => {
    if (isOpen && currentWallet.address) {
      fetchTransactions()
    }
  }, [isOpen, currentWallet.address])
  
  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/transactions?wallet=${encodeURIComponent(currentWallet.address)}`)
      const data = await response.json()
      
      if (data.transactions) {
        // Convert timestamp strings to Date objects
        const txs = data.transactions.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        }))
        setTransactions(txs)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-1/3 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out rounded-l-3xl ${
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-200'
    } ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-300'
        }`}>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Transaction History</h2>
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className={`text-6xl font-bold flex font-mono ${theme === 'dark' ? 'text-[#ccc]' : 'text-gray-800'}`}>
                <motion.span
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0
                  }}
                >
                  =
                </motion.span>
                <motion.span
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2
                  }}
                >
                  +
                </motion.span>
                <motion.span
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4
                  }}
                >
                  #
                </motion.span>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className={`text-2xl ${theme === 'dark' ? 'text-[#999]' : 'text-gray-500'}`}>Wow so empty!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
