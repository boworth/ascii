import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }
    
    // Read the JSON database file
    const dbPath = join(process.cwd(), 'database', 'transactions.json')
    const dbData = readFileSync(dbPath, 'utf-8')
    const db = JSON.parse(dbData)
    
    // Filter transactions for the specified wallet
    const transactions = db.transactions
      .filter((tx: any) => tx.wallet_address === wallet)
      .sort((a: any, b: any) => {
        // Sort by timestamp descending (newest first)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })
      .slice(0, 50) // Limit to 50 transactions
      .map((tx: any) => ({
        // Transform snake_case to camelCase for frontend
        id: tx.id,
        walletAddress: tx.wallet_address,
        type: tx.type,
        amount: tx.amount,
        usdValue: tx.usd_value,
        timestamp: tx.timestamp,
        status: tx.status,
        toAddress: tx.to_address,
        fromAddress: tx.from_address,
        paidWith: tx.paid_with,
        paidAmount: tx.paid_amount
      }))
    
    return NextResponse.json({
      wallet_address: wallet,
      transactions,
      count: transactions.length
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    
    // Return empty array on error so UI doesn't break
    return NextResponse.json({
      wallet_address: '',
      transactions: [],
      count: 0,
      error: 'Failed to fetch transactions'
    }, { status: 500 })
  }
}

