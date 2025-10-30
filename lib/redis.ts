import { createClient } from 'redis'

let redisClient: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    
    redisClient.on('error', (err) => console.error('Redis Client Error', err))
    
    await redisClient.connect()
  }
  
  return redisClient
}

export interface MarketPrices {
  bid_price: string
  ask_price: string
  mid_price: string
  last_update?: string
}

function getMarketKey(baseToken: string, quoteToken: string = 'USD'): string {
  if (quoteToken === 'USD') {
    return `${baseToken.toLowerCase()}_market`
  } else {
    return `${baseToken.toLowerCase()}_${quoteToken.toLowerCase()}_market`
  }
}

export async function getMarketPrices(baseToken: string, quoteToken: string = 'USD'): Promise<MarketPrices | null> {
  try {
    const client = await getRedisClient()
    const key = `${getMarketKey(baseToken, quoteToken)}:prices`
    const data = await client.hGetAll(key)
    
    if (!data || Object.keys(data).length === 0) {
      console.warn(`No price data found for ${baseToken}/${quoteToken} at key: ${key}`)
      return null
    }
    
    return {
      bid_price: data.bid_price || '0',
      ask_price: data.ask_price || '0',
      mid_price: data.mid_price || '0',
      last_update: data.last_update
    }
  } catch (error) {
    console.error(`Error fetching market prices for ${baseToken}/${quoteToken}:`, error)
    return null
  }
}

export async function getCCPrice(): Promise<number> {
  try {
    const prices = await getMarketPrices('CC', 'USD')
    if (!prices) {
      console.warn('No CC price data, using fallback')
      return 0.1596 // Fallback price
    }
    
    // Use ask price since we're converting CC to USD (selling CC)
    return parseFloat(prices.ask_price)
  } catch (error) {
    console.error('Error fetching CC price:', error)
    return 0.1596 // Fallback price
  }
}

export async function getBRONPrice(): Promise<number> {
  try {
    const prices = await getMarketPrices('BRON', 'USD')
    if (!prices) {
      console.warn('No BRON price data, using fallback')
      return 0.07 // Fallback price
    }
    
    return parseFloat(prices.mid_price)
  } catch (error) {
    console.error('Error fetching BRON price:', error)
    return 0.07 // Fallback price
  }
}

export async function getETHPrice(): Promise<number> {
  try {
    // Try to get from asset_prices:ETH key (same format as price oracle uses)
    const client = await getRedisClient()
    const ethPriceStr = await client.get('asset_prices:ETH')
    
    if (ethPriceStr && ethPriceStr !== '0') {
      return parseFloat(ethPriceStr)
    }
    
    console.warn('No ETH price data, using fallback')
    return 2500 // Fallback price
  } catch (error) {
    console.error('Error fetching ETH price:', error)
    return 2500 // Fallback price
  }
}

