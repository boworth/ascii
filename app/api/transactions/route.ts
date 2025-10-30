import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/lib/supabase'

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
    
    const supabase = getServiceRoleClient()
    
    // Get wallet ID from address
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('id')
      .eq('address', wallet)
      .single()
    
    if (walletError || !walletData) {
      return NextResponse.json({
        wallet_address: wallet,
        transactions: [],
        count: 0
      })
    }
    
    // Get transactions for this wallet
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_id', walletData.id)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (txError) {
      console.error('Error fetching transactions:', txError)
      return NextResponse.json({
        wallet_address: wallet,
        transactions: [],
        count: 0,
        error: 'Failed to fetch transactions'
      }, { status: 500 })
    }
    
    // Transform to frontend format
    const transactions = (txData || []).map((tx: any) => ({
      id: tx.transaction_hash || tx.id,
      walletAddress: wallet,
      type: tx.type,
      amount: parseFloat(tx.amount),
      usdValue: tx.usd_value ? parseFloat(tx.usd_value) : null,
      timestamp: tx.created_at,
      status: tx.status,
      toAddress: tx.to_address,
      fromAddress: tx.from_address,
      paidWith: tx.paid_with,
      paidAmount: tx.paid_amount ? parseFloat(tx.paid_amount) : null
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
