# Email Verification Setup

The registration system includes email verification functionality. To enable email sending in production, you need to integrate an email service provider.

## Recommended Email Service Providers

### 1. Resend (Recommended - Easy Setup)
- **Website:** https://resend.com
- **Free Tier:** 3,000 emails/month
- **Setup:**
  ```bash
  npm install resend
  ```
- **Environment Variables:**
  ```env
  RESEND_API_KEY=re_your_api_key
  ```

### 2. SendGrid
- **Website:** https://sendgrid.com
- **Free Tier:** 100 emails/day
- **Setup:**
  ```bash
  npm install @sendgrid/mail
  ```
- **Environment Variables:**
  ```env
  SENDGRID_API_KEY=SG.your_api_key
  ```

### 3. AWS SES (Amazon Simple Email Service)
- **Website:** https://aws.amazon.com/ses/
- **Free Tier:** 62,000 emails/month (if sent from EC2)
- **Setup:**
  ```bash
  npm install @aws-sdk/client-ses
  ```
- **Environment Variables:**
  ```env
  AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=your_access_key
  AWS_SECRET_ACCESS_KEY=your_secret_key
  AWS_SES_FROM_EMAIL=noreply@yourdomain.com
  ```

## Implementation Example (Resend)

Update `app/api/auth/register/route.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendVerificationEmail(email: string, username: string, verificationUrl: string) {
  await resend.emails.send({
    from: 'Ascii <noreply@yourdomain.com>', // Must be a verified domain
    to: email,
    subject: 'Verify your Ascii account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Ascii!</h1>
            </div>
            <div class="content">
              <h2>Hi ${username},</h2>
              <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link in your browser:<br>
                <a href="${verificationUrl}">${verificationUrl}</a>
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Ascii. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
}
```

## Domain Verification

Most email providers require you to verify your domain:

1. **Add DNS Records:** Your email provider will give you DNS records to add
2. **Common Records:**
   - SPF (Sender Policy Framework)
   - DKIM (DomainKeys Identified Mail)
   - DMARC (Domain-based Message Authentication)
3. **Verification Time:** Usually takes 24-48 hours

## Development Mode

During development, verification emails are logged to the console:
```
================================================================================
VERIFICATION EMAIL
================================================================================
To: user@example.com
Username: testuser
Verification URL: http://localhost:6969/api/auth/verify-email?token=abc123...
================================================================================
```

You can click these URLs in the console to test the verification flow.

## Production Checklist

- [ ] Choose and sign up for email service provider
- [ ] Install required npm packages
- [ ] Add API keys to environment variables
- [ ] Verify your domain
- [ ] Update sendVerificationEmail function in `app/api/auth/register/route.ts`
- [ ] Test with real email addresses
- [ ] Set up email templates (optional but recommended)
- [ ] Configure bounce/complaint handling
- [ ] Monitor email sending limits and usage

## IP Blocking Configuration

The system prevents users from creating multiple accounts from the same IP address.

**Current Settings (in `app/api/auth/register/route.ts`):**
- `MAX_ACCOUNTS_PER_IP = 3` - Maximum accounts per IP address
- `VERIFICATION_TOKEN_EXPIRY_HOURS = 24` - Verification link expiry time

Adjust these values based on your needs.

## Database Setup

Make sure to run the database migration:

```sql
-- Run this SQL in your Supabase SQL editor
-- File: supabase/migration_add_email_verification.sql
```

This adds the necessary fields for email verification and IP tracking.

