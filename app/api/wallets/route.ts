import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ wallets: [] })
}

export async function POST() {
  return NextResponse.json(
    { error: 'Wallet creation not configured' },
    { status: 503 }
  )
}
