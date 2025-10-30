import { NextResponse } from 'next/server'
import { getCCPrice, getBRONPrice, getETHPrice } from '@/lib/redis'

// Force dynamic rendering - don't try to statically generate this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const [ccPrice, bronPrice, ethPrice] = await Promise.all([
      getCCPrice(),
      getBRONPrice(),
      getETHPrice()
    ])
    
    return NextResponse.json({
      CC: ccPrice,
      BRON: bronPrice,
      ETH: ethPrice,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching prices:', error)
    
    // Return fallback prices on error
    return NextResponse.json({
      CC: 0.1596,
      BRON: 0.07,
      ETH: 2500,
      timestamp: new Date().toISOString(),
      error: 'Using fallback prices'
    }, { status: 200 }) // Still return 200 with fallback data
  }
}

