import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/authSupabase'
import { getServiceRoleClient } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get current authenticated user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const supabase = getServiceRoleClient()
    
    // Get wallets for this user
    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching wallets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch wallets' },
        { status: 500 }
      )
    }
    
    // Transform to frontend format
    const formattedWallets = (wallets || []).map((wallet: any) => ({
      label: wallet.label,
      address: wallet.address,
      balance: {
        cc: parseFloat(wallet.cc_balance || '0'),
        usd: 0 // Will be calculated on frontend with current price
      }
    }))
    
    return NextResponse.json({
      wallets: formattedWallets
    })
  } catch (error) {
    console.error('Error in wallets API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new wallet
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { label, address } = await request.json()
    
    if (!label || !address) {
      return NextResponse.json(
        { error: 'Label and address are required' },
        { status: 400 }
      )
    }
    
    const supabase = getServiceRoleClient()
    
    // Check wallet limit (max 10 per user)
    const { data: existingWallets, error: countError } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
    
    if (countError) {
      console.error('Error checking wallet count:', countError)
      return NextResponse.json(
        { error: 'Failed to check wallet limit' },
        { status: 500 }
      )
    }
    
    if (existingWallets && existingWallets.length >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 wallets per user' },
        { status: 400 }
      )
    }
    
    // Create new wallet
    const { data: newWallet, error: insertError } = await supabase
      .from('wallets')
      .insert({
        user_id: user.id,
        label,
        address,
        cc_balance: 0
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error creating wallet:', insertError)
      return NextResponse.json(
        { error: 'Failed to create wallet' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      wallet: {
        label: newWallet.label,
        address: newWallet.address,
        balance: {
          cc: parseFloat(newWallet.cc_balance || '0'),
          usd: 0
        }
      }
    })
  } catch (error) {
    console.error('Error creating wallet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

