import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { query } from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

interface User {
  id: number
  username: string
  email: string
}

interface DbUser extends User {
  password_hash: string
  is_active: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  // Store session in database
  await query(
    'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
    [userId, token]
  )

  return token
}

export async function verifySession(token: string): Promise<User | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const userId = verified.payload.userId as number

    // Check if session exists and is valid
    const sessions = await query<any[]>(
      'SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW()',
      [token]
    )

    if (sessions.length === 0) {
      return null
    }

    // Get user details
    const users = await query<DbUser[]>(
      'SELECT id, username, email FROM users WHERE id = ? AND is_active = TRUE',
      [userId]
    )

    if (users.length === 0) {
      return null
    }

    return {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email
    }
  } catch {
    return null
  }
}

export async function deleteSession(token: string): Promise<void> {
  await query('DELETE FROM user_sessions WHERE session_token = ?', [token])
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const users = await query<DbUser[]>(
    'SELECT id, username, email, password_hash, is_active FROM users WHERE username = ? AND is_active = TRUE',
    [username]
  )

  if (users.length === 0) {
    return null
  }

  const user = users[0]
  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) {
    return null
  }

  // Update last login
  await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id])

  return {
    id: user.id,
    username: user.username,
    email: user.email
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

