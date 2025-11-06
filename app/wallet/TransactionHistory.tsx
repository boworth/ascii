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
    <div className={`p-4 rounded-lg transition-all border ${
      theme === 'dark' ? 'bg-transparent border-[#3a3a3a] hover:border-[#4a4a4a]' : 'bg-transparent border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left: Type and Date */}
        <div className="flex flex-col">
          <p className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{transaction.type}</p>
          <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-[#666]' : 'text-gray-400'}`}>{formatTransactionDate(transaction.timestamp)}</p>
        </div>
        
        {/* Right: Amount */}
        <div className="text-right">
          <p className={`font-bold text-base font-mono ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {(transaction.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} CC
          </p>
          <p className={`text-xs font-mono mt-0.5 ${theme === 'dark' ? 'text-[#666]' : 'text-gray-400'}`}>
            ${(transaction.usdValue || 0).toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Details */}
      {((isDeposit || isWithdrawal) || (isWithdrawal && transaction.toAddress) || (isDeposit && transaction.fromAddress) || (isBuy && transaction.paidWith && transaction.paidAmount)) && (
        <div className={`mt-3 pt-3 border-t space-y-2 ${theme === 'dark' ? 'border-[#2a2a2a]' : 'border-gray-100'}`}>
          {/* Transaction ID for Deposits and Withdrawals */}
          {(isDeposit || isWithdrawal) && (
            <div className="flex items-center justify-between gap-2">
              <a
                href={`https://ccview.io/transfers/${transaction.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs font-mono hover:underline truncate flex-1 ${
                  theme === 'dark' ? 'text-[#666] hover:text-[#888]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {transaction.id.slice(0, 16)}...
              </a>
              <button 
                onClick={handleCopyTxId}
                className={`transition-colors flex-shrink-0 ${
                  theme === 'dark' ? 'text-[#666] hover:text-white' : 'text-gray-400 hover:text-black'
                }`}
                title="Copy transaction ID"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  {copiedTxId ? (
                    <polyline points="20 6 9 17 4 12"></polyline>
                  ) : (
                    <>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </>
                  )}
                </svg>
              </button>
            </div>
          )}
          
          {isWithdrawal && transaction.toAddress && (
            <div className="flex items-center justify-between">
              <p className={`text-xs ${theme === 'dark' ? 'text-[#666]' : 'text-gray-400'}`}>To</p>
              <p className={`text-xs font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-gray-500'}`}>
                {formatAddress(transaction.toAddress, 8)}
              </p>
            </div>
          )}
          {isDeposit && transaction.fromAddress && (
            <div className="flex items-center justify-between">
              <p className={`text-xs ${theme === 'dark' ? 'text-[#666]' : 'text-gray-400'}`}>From</p>
              <p className={`text-xs font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-gray-500'}`}>
                {formatAddress(transaction.fromAddress, 8)}
              </p>
            </div>
          )}
          {isBuy && transaction.paidWith && transaction.paidAmount && (
            <div className="flex items-center justify-between">
              <p className={`text-xs ${theme === 'dark' ? 'text-[#666]' : 'text-gray-400'}`}>Paid with {transaction.paidWith}</p>
              <p className={`text-xs font-mono ${theme === 'dark' ? 'text-[#888]' : 'text-gray-500'}`}>
                ${(transaction.paidAmount || 0).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}
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
    <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-[#2a2a2a]' : 'border-gray-200'
        }`}>
          <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Transactions</h2>
          <button 
            onClick={onClose}
            className={`transition-colors ${theme === 'dark' ? 'text-[#666] hover:text-white' : 'text-gray-400 hover:text-black'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  )
}
