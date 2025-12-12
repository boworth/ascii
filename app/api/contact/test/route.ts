import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Slack configuration from environment variables
const SLACK_TOKEN = process.env.SLACK_TOKEN
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || 'bo_test_slackbot'

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

// GET /api/contact/test - Send a test message to verify Slack integration
export async function GET(request: Request) {
  // Only allow with secret key to prevent abuse
  const authHeader = request.headers.get('authorization')
  const testKey = process.env.SLACK_TEST_KEY || 'test-slack-connection'
  
  if (authHeader !== `Bearer ${testKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC'
  const message = `🚀 *TRNG.le Contact Form Service Online*\n_Deployment verified at ${timestamp}_`
  
  const sent = await sendSlackMessage(message)
  
  if (sent) {
    return NextResponse.json({ 
      success: true, 
      message: 'Test message sent to Slack',
      channel: SLACK_CHANNEL
    })
  } else {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send test message',
      configured: !!SLACK_TOKEN
    }, { status: 500 })
  }
}
