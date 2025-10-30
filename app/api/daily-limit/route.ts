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
    
    // Get today's date in YYYY-MM-DD format
    // For demo purposes, we use 2025-10-30 as "today" to match the JSON database
    // In production, this would be: new Date().toISOString().split('T')[0]
    const today = '2025-10-30'
    
    // Find today's purchase limit for this wallet
    const todayLimit = db.daily_purchase_limits.find(
      (limit: any) => limit.wallet_address === wallet && limit.purchase_date === today
    )
    
    if (todayLimit) {
      return NextResponse.json({
        wallet_address: wallet,
        purchase_date: todayLimit.purchase_date,
        total_cc_purchased: todayLimit.total_cc_purchased,
        remaining_limit: todayLimit.remaining_limit,
        daily_limit: 10000
      })
    } else {
      // No purchases today yet
      return NextResponse.json({
        wallet_address: wallet,
        purchase_date: today,
        total_cc_purchased: 0,
        remaining_limit: 10000,
        daily_limit: 10000
      })
    }
  } catch (error) {
    console.error('Error fetching daily limit:', error)
    
    // Return default limit on error
    return NextResponse.json({
      wallet_address: '',
      purchase_date: new Date().toISOString().split('T')[0],
      total_cc_purchased: 0,
      remaining_limit: 10000,
      daily_limit: 10000,
      error: 'Failed to fetch daily limit'
    }, { status: 500 })
  }
}

