import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const DAILY_LIMIT = 10000 // CC

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get('wallet')
  
  return NextResponse.json({
    wallet_address: wallet || '',
    purchase_date: new Date().toISOString().split('T')[0],
    total_cc_purchased: 0,
    remaining_limit: DAILY_LIMIT,
    daily_limit: DAILY_LIMIT
  })
}
