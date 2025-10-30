import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { getServiceRoleClient } from './supabase'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

interface User {
  id: string
  username: string
}

interface DbUser extends User {
  password_hash: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  // Store session in database
  const supabase = getServiceRoleClient()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

  await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      token: token,
      expires_at: expiresAt.toISOString()
    })

  return token
}

export async function verifySession(token: string): Promise<User | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const userId = verified.payload.userId as string

    const supabase = getServiceRoleClient()
    
    // Check if session exists and is valid
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .limit(1)

    if (sessionError || !sessions || sessions.length === 0) {
      return null
    }

    // Get user details
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', userId)
      .limit(1)

    if (userError || !users || users.length === 0) {
      return null
    }

    return {
      id: users[0].id,
      username: users[0].username
    }
  } catch {
    return null
  }
}

export async function deleteSession(token: string): Promise<void> {
  const supabase = getServiceRoleClient()
  await supabase
    .from('sessions')
    .delete()
    .eq('token', token)
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const supabase = getServiceRoleClient()
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, password_hash')
    .eq('username', username)
    .limit(1)

  if (error || !users || users.length === 0) {
    return null
  }

  const user = users[0] as DbUser
  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) {
    return null
  }

  // Update last login (optional - we don't have this field in schema yet)
  await supabase
    .from('users')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return {
    id: user.id,
    username: user.username
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    return null
  }

  return verifySession(token)
}

