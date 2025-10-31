import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/authSupabase'
import { getServiceRoleClient } from '@/lib/supabase'
import crypto from 'crypto'

const MAX_ACCOUNTS_PER_IP = 3 // Maximum accounts allowed per IP address
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24

// Get client IP address
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return 'unknown'
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate username
function isValidUsername(username: string): boolean {
  // Username must be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

// Validate password
function isValidPassword(password: string): boolean {
  // Password must be at least 8 characters
  return password.length >= 8
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, passwordConfirm } = body

    // Validation
    if (!email || !username || !password || !passwordConfirm) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (password !== passwordConfirm) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const clientIp = getClientIp(request)

    // Check IP registration limit
    if (clientIp !== 'unknown') {
      const { data: ipRegistrations, error: ipError } = await supabase
        .from('ip_registrations')
        .select('id')
        .eq('ip_address', clientIp)

      if (ipError) {
        console.error('Error checking IP registrations:', ipError)
      } else if (ipRegistrations && ipRegistrations.length >= MAX_ACCOUNTS_PER_IP) {
        return NextResponse.json(
          { error: 'Maximum number of accounts reached from this IP address' },
          { status: 429 }
        )
      }
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1)

    if (existingUsername && existingUsername.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (existingEmail && existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date()
    verificationExpiry.setHours(verificationExpiry.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS)

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires_at: verificationExpiry.toISOString(),
        registration_ip: clientIp !== 'unknown' ? clientIp : null
      })
      .select('id, username, email')
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    // Track IP registration
    if (clientIp !== 'unknown') {
      await supabase
        .from('ip_registrations')
        .insert({
          ip_address: clientIp,
          user_id: newUser.id
        })
    }

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${verificationToken}`
    
    try {
      await sendVerificationEmail(email, username, verificationUrl)
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // Don't fail registration if email fails - user can request resend
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      userId: newUser.id
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Email sending function (placeholder - you'll need to implement with your email service)
async function sendVerificationEmail(email: string, username: string, verificationUrl: string) {
  // TODO: Implement email sending using a service like:
  // - SendGrid
  // - AWS SES
  // - Resend
  // - Postmark
  
  console.log('='.repeat(80))
  console.log('VERIFICATION EMAIL')
  console.log('='.repeat(80))
  console.log(`To: ${email}`)
  console.log(`Username: ${username}`)
  console.log(`Verification URL: ${verificationUrl}`)
  console.log('='.repeat(80))
  
  // For now, just log the verification URL
  // In production, replace this with actual email sending logic
  
  /* Example with Resend:
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  await resend.emails.send({
    from: 'noreply@ascii.com',
    to: email,
    subject: 'Verify your Ascii account',
    html: `
      <h1>Welcome to Ascii, ${username}!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  })
  */
}

