import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// In-memory cache for prices (will reset on each deployment)
// In production, you'd want to use Redis or a database
let priceCache = {
  CC: 0.1596,
  BRON: 0.07,
  ETH: 2500,
  lastUpdate: new Date().toISOString()
}

export async function POST(request: Request) {
  try {
    // Simple API key authentication
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.PRICE_UPDATE_API_KEY || 'your-secret-key-here'
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { CC, BRON, ETH } = body
    
    // Validate the data
    if (typeof CC !== 'number' || typeof BRON !== 'number' || typeof ETH !== 'number') {
      return NextResponse.json(
        { error: 'Invalid price data. CC, BRON, and ETH must be numbers.' },
        { status: 400 }
      )
    }
    
    // Update the cache
    priceCache = {
      CC,
      BRON,
      ETH,
      lastUpdate: new Date().toISOString()
    }
    
    console.log('Price cache updated:', priceCache)
    
    return NextResponse.json({
      success: true,
      message: 'Prices updated successfully',
      prices: priceCache
    })
  } catch (error) {
    console.error('Error updating prices:', error)
    return NextResponse.json(
      { error: 'Failed to update prices' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve current cached prices
export async function GET() {
  return NextResponse.json({
    prices: priceCache,
    cached: true
  })
}

