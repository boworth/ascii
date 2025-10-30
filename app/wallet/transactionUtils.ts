export interface Transaction {
  id: string
  walletAddress: string // The wallet this transaction belongs to
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BUY'
  amount: number // Amount in CC
  usdValue: number // USD equivalent at time of transaction
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
  // For DEPOSIT/WITHDRAWAL
  toAddress?: string
  fromAddress?: string
  // For BUY
  paidWith?: 'USDC' | 'USDT'
  paidAmount?: number
}

// ========================================================================
// DATABASE SETUP
// ========================================================================
// 
// CURRENT (Demo): Using mock data below
// PRODUCTION: Will use MySQL/PostgreSQL with this schema:
// 
// CREATE TABLE transactions (
//   id VARCHAR(255) PRIMARY KEY,
//   wallet_address VARCHAR(255) NOT NULL,
//   type ENUM('DEPOSIT', 'WITHDRAWAL', 'BUY') NOT NULL,
//   amount DECIMAL(20, 8) NOT NULL,
//   usd_value DECIMAL(20, 2) NOT NULL,
//   timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   status ENUM('completed', 'pending', 'failed') NOT NULL DEFAULT 'pending',
//   to_address VARCHAR(255),
//   from_address VARCHAR(255),
//   paid_with VARCHAR(10),
//   paid_amount DECIMAL(20, 2),
//   INDEX idx_wallet_address (wallet_address),
//   INDEX idx_timestamp (timestamp)
// );
//
// Query to fetch transactions:
// SELECT * FROM transactions 
// WHERE wallet_address = ? 
// ORDER BY timestamp DESC 
// LIMIT 50;
//
// API endpoint would be: GET /api/transactions?wallet=bron::1220...
// ========================================================================

export const mockTransactions: Transaction[] = [
  // Trading Account transactions
  {
    id: 'txn_001',
    walletAddress: 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345',
    type: 'BUY',
    amount: 1250.5678,
    usdValue: 250.11,
    timestamp: new Date('2025-10-30T14:32:15'),
    status: 'completed',
    paidWith: 'USDC',
    paidAmount: 250.11
  },
  {
    id: 'txn_002',
    walletAddress: 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345',
    type: 'WITHDRAWAL',
    amount: 500.0,
    usdValue: 79.80,
    timestamp: new Date('2025-10-30T10:15:42'),
    status: 'completed',
    toAddress: 'bron::1220abc123def456789012345678901234567890123456789012345',
    fromAddress: 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345'
  },
  {
    id: 'txn_003',
    walletAddress: 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345',
    type: 'BUY',
    amount: 5000.0,
    usdValue: 1000.0,
    timestamp: new Date('2025-10-29T16:45:30'),
    status: 'completed',
    paidWith: 'USDT',
    paidAmount: 1000.0
  },
  {
    id: 'txn_004',
    walletAddress: 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345',
    type: 'DEPOSIT',
    amount: 2500.25,
    usdValue: 399.04,
    timestamp: new Date('2025-10-29T09:22:18'),
    status: 'completed',
    toAddress: 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345',
    fromAddress: 'bron::1220xyz789abc456def123456789012345678901234567890123'
  },
  {
    id: 'txn_005',
    walletAddress: 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345',
    type: 'BUY',
    amount: 750.8234,
    usdValue: 150.16,
    timestamp: new Date('2025-10-28T13:10:55'),
    status: 'completed',
    paidWith: 'USDC',
    paidAmount: 150.16
  },
  {
    id: 'txn_006',
    walletAddress: 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345',
    type: 'WITHDRAWAL',
    amount: 100.0,
    usdValue: 15.96,
    timestamp: new Date('2025-10-28T08:45:12'),
    status: 'completed',
    toAddress: 'bron::1220mno345678901234567890123456789012345678901234567',
    fromAddress: 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345'
  },
  {
    id: 'txn_007',
    walletAddress: 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345',
    type: 'BUY',
    amount: 3200.1234,
    usdValue: 640.02,
    timestamp: new Date('2025-10-27T11:20:33'),
    status: 'completed',
    paidWith: 'USDT',
    paidAmount: 640.02
  },
  
  // Main Wallet transactions
  {
    id: 'txn_008',
    walletAddress: 'bron::122067a3096266f3cbb9320eeacf64bd5bec8de8f94c1ae605fda3218d3424a16da3',
    type: 'DEPOSIT',
    amount: 1000.0,
    usdValue: 159.60,
    timestamp: new Date('2025-10-29T15:30:00'),
    status: 'completed',
    toAddress: 'bron::122067a3096266f3cbb9320eeacf64bd5bec8de8f94c1ae605fda3218d3424a16da3',
    fromAddress: 'bron::1220xyz789abc456def123456789012345678901234567890123'
  },
  {
    id: 'txn_009',
    walletAddress: 'bron::122067a3096266f3cbb9320eeacf64bd5bec8de8f94c1ae605fda3218d3424a16da3',
    type: 'WITHDRAWAL',
    amount: 250.0,
    usdValue: 39.90,
    timestamp: new Date('2025-10-28T11:00:00'),
    status: 'completed',
    toAddress: 'bron::1220abc123def456789012345678901234567890123456789012345',
    fromAddress: 'bron::122067a3096266f3cbb9320eeacf64bd5bec8de8f94c1ae605fda3218d3424a16da3'
  }
]

// Helper function to get transactions for a specific wallet
export function getTransactionsForWallet(walletAddress: string): Transaction[] {
  return mockTransactions.filter(tx => tx.walletAddress === walletAddress)
}

export function formatTransactionDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  // If less than 24 hours, show relative time
  if (diffHours < 1) {
    const minutes = Math.floor(diffMs / (1000 * 60))
    return `${minutes}m ago`
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h ago`
  } else if (diffDays < 7) {
    return `${Math.floor(diffDays)}d ago`
  } else {
    // Otherwise show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

export function formatAddress(address: string, length: number = 8): string {
  if (address.length <= length + 10) return address
  return `${address.slice(0, 10)}...${address.slice(-length)}`
}

export function getTransactionIconType(type: 'DEPOSIT' | 'WITHDRAWAL' | 'BUY'): 'arrow-down' | 'arrow-up' {
  if (type === 'DEPOSIT') return 'arrow-down'
  if (type === 'WITHDRAWAL') return 'arrow-up'
  return 'arrow-up' // BUY also uses arrow-up
}

