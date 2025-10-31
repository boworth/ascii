import { NextRequest, NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()

    // Find user with this verification token
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, username, email_verified, verification_token_expires_at')
      .eq('verification_token', token)
      .limit(1)

    if (fetchError || !users || users.length === 0) {
      // Redirect to error page or return HTML error
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Verification Link</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #e53e3e; margin-bottom: 1rem; }
              p { color: #4a5568; margin-bottom: 1.5rem; line-height: 1.6; }
              a { 
                display: inline-block;
                padding: 12px 24px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
              }
              a:hover { background: #5568d3; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Invalid Verification Link</h1>
              <p>This verification link is invalid or has already been used.</p>
              <a href="/">Return to Home</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    const user = users[0]

    // Check if already verified
    if (user.email_verified) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Already Verified</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #48bb78; margin-bottom: 1rem; }
              p { color: #4a5568; margin-bottom: 1.5rem; line-height: 1.6; }
              a { 
                display: inline-block;
                padding: 12px 24px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 0.5rem;
              }
              a:hover { background: #5568d3; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✓ Email Already Verified</h1>
              <p>Your email address has already been verified.</p>
              <a href="/">Login to Your Account</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Check if token has expired
    const expiresAt = new Date(user.verification_token_expires_at)
    const now = new Date()

    if (now > expiresAt) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verification Link Expired</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #ed8936; margin-bottom: 1rem; }
              p { color: #4a5568; margin-bottom: 1.5rem; line-height: 1.6; }
              a { 
                display: inline-block;
                padding: 12px 24px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
              }
              a:hover { background: #5568d3; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⏰ Verification Link Expired</h1>
              <p>This verification link has expired. Please request a new verification email.</p>
              <a href="/">Return to Home</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Verify the email
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error verifying email:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      )
    }

    // Success - return HTML page with success message
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verified Successfully</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
              animation: slideIn 0.5s ease-out;
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            h1 { 
              color: #48bb78; 
              margin-bottom: 1rem; 
              font-size: 2.5rem;
            }
            p { 
              color: #4a5568; 
              margin-bottom: 1.5rem; 
              line-height: 1.6;
              font-size: 1.1rem;
            }
            .username {
              font-weight: 600;
              color: #667eea;
            }
            a { 
              display: inline-block;
              padding: 14px 32px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 1.1rem;
              transition: all 0.3s ease;
            }
            a:hover { 
              background: #5568d3; 
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
            }
            .checkmark {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✓</div>
            <h1>Email Verified!</h1>
            <p>Welcome, <span class="username">${user.username}</span>! Your email has been successfully verified.</p>
            <p>You can now log in to your account and start using Ascii.</p>
            <a href="/">Login to Your Account</a>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    )

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

