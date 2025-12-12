import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Slack configuration from environment variables
const SLACK_TOKEN = process.env.SLACK_TOKEN
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || 'trngle_outreach'

// Simple in-memory rate limiting (resets on serverless cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5 // max requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in ms

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  
  if (record.count >= RATE_LIMIT) {
    return true
  }
  
  record.count++
  return false
}

function sanitizeInput(text: string | undefined, maxLength: number = 1000): string {
  if (!text) return ''
  return text.slice(0, maxLength).replace(/[<>&]/g, (c) => {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c
  })
}

interface ContactRequest {
  accountType: 'company' | 'individual'
  email: string
  companyName?: string
  firstName?: string
  lastName?: string
  info: string
  telegram?: string
}

async function sendSlackMessage(message: string): Promise<boolean> {
  if (!SLACK_TOKEN) {
    console.error('SLACK_TOKEN not configured')
    return false
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SLACK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: SLACK_CHANNEL,
      text: message,
    }),
  })

  const result = await response.json()
  
  if (!result.ok) {
    console.error('Slack API error:', result.error)
    return false
  }
  
  return true
}

function formatSlackMessage(body: ContactRequest): string {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC'
  
  const nameLine = body.accountType === 'company'
    ? `🏢 *Company:* ${sanitizeInput(body.companyName, 100)}`
    : `👤 *Name:* ${sanitizeInput(body.firstName, 50)} ${sanitizeInput(body.lastName, 50)}`

  return `🔔 *New TRNG.le API Access Request*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${nameLine}
📧 *Email:* ${sanitizeInput(body.email, 100)}
💬 *Telegram:* ${sanitizeInput(body.telegram, 50) || 'Not provided'}

📝 *Use Case:*
${sanitizeInput(body.info, 2000)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Submitted at ${timestamp}_`
}

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body: ContactRequest = await request.json()
    
    // Validate required fields
    if (!body.email || !body.info) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate input lengths to prevent abuse
    if (body.email.length > 100 || body.info.length > 2000) {
      return NextResponse.json(
        { error: 'Input too long' },
        { status: 400 }
      )
    }

    if (body.accountType === 'company' && !body.companyName) {
      return NextResponse.json(
        { error: 'Company name is required for company accounts' },
        { status: 400 }
      )
    }

    if (body.accountType === 'individual' && (!body.firstName || !body.lastName)) {
      return NextResponse.json(
        { error: 'First and last name are required for individual accounts' },
        { status: 400 }
      )
    }

    // Format and send to Slack directly
    const message = formatSlackMessage(body)
    const sent = await sendSlackMessage(message)

    if (!sent) {
      console.error('Failed to send Slack notification')
      // Still return success to user - we don't want to expose internal errors
      // The request data is logged server-side
      console.log('Contact request (Slack failed):', JSON.stringify(body))
    } else {
      console.log('API Access Request sent to Slack:', body.email)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Request submitted successfully' 
    })

  } catch (error) {
    console.error('Error processing contact request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
