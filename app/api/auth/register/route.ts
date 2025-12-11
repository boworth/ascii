import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    { error: 'Registration not configured' },
    { status: 503 }
  )
}
