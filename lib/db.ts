import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export async function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bronswap_wallet',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    })
  }
  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const pool = await getDbPool()
  const [results] = await pool.execute(sql, params)
  return results as T
}

