import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const DAILY_LIMIT = 10000 // CC

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
      // Wallet not found, return default
      return NextResponse.json({
        wallet_address: wallet,
        purchase_date: new Date().toISOString().split('T')[0],
        total_cc_purchased: 0,
        remaining_limit: DAILY_LIMIT,
        daily_limit: DAILY_LIMIT
      })
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    
    // Find today's purchase limit for this wallet
    const { data: limitData, error: limitError } = await supabase
      .from('daily_purchase_limits')
      .select('*')
      .eq('wallet_id', walletData.id)
      .eq('purchase_date', today)
      .single()
    
    if (limitError && limitError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching daily limit:', limitError)
    }
    
    if (limitData) {
      return NextResponse.json({
        wallet_address: wallet,
        purchase_date: limitData.purchase_date,
        total_cc_purchased: parseFloat(limitData.total_cc_purchased),
        remaining_limit: parseFloat(limitData.daily_limit) - parseFloat(limitData.total_cc_purchased),
        daily_limit: parseFloat(limitData.daily_limit)
      })
    } else {
      // No purchases today yet
      return NextResponse.json({
        wallet_address: wallet,
        purchase_date: today,
        total_cc_purchased: 0,
        remaining_limit: DAILY_LIMIT,
        daily_limit: DAILY_LIMIT
      })
    }
  } catch (error) {
    console.error('Error fetching daily limit:', error)
    
    // Return default limit on error
    return NextResponse.json({
      wallet_address: '',
      purchase_date: new Date().toISOString().split('T')[0],
      total_cc_purchased: 0,
      remaining_limit: DAILY_LIMIT,
      daily_limit: DAILY_LIMIT,
      error: 'Failed to fetch daily limit'
    }, { status: 500 })
  }
}
