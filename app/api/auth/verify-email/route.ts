import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    { error: 'Email verification not configured' },
    { status: 503 }
  )
}
