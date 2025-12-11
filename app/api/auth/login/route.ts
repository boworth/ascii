import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    { error: 'Authentication not configured' },
    { status: 503 }
  )
}
