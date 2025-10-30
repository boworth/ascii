import { NextResponse } from 'next/server'

// Force dynamic rendering - don't try to statically generate this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Import the price cache from the update endpoint
// This is a simple in-memory solution; for production, use a proper cache/database
async function getCachedPrices() {
  try {
    // Fetch from our own update endpoint which maintains the cache
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://ascii-gold.vercel.app'}/api/prices/update`, {
      method: 'GET',
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.prices
    }
  } catch (error) {
    console.error('Error fetching cached prices:', error)
  }
  
  // Return fallback prices
  return {
    CC: 0.1596,
    BRON: 0.07,
    ETH: 2500,
    lastUpdate: new Date().toISOString()
  }
}

export async function GET() {
  try {
    const prices = await getCachedPrices()
    
    return NextResponse.json({
      CC: prices.CC,
      BRON: prices.BRON,
      ETH: prices.ETH,
      timestamp: prices.lastUpdate || new Date().toISOString()
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

