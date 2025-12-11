import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get('wallet')
  
  return NextResponse.json({
    wallet_address: wallet || '',
    transactions: [],
    count: 0
  })
}
