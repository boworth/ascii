-- Migration to add email verification and IP tracking to existing users table
-- Run this if you already have a users table

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS registration_ip INET;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- Create IP registration tracking table
CREATE TABLE IF NOT EXISTS ip_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_registrations_ip ON ip_registrations(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_registrations_created_at ON ip_registrations(created_at);

