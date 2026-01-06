import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Parse DATABASE_URL or use explicit connection parameters
function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL

  if (databaseUrl) {
    // Parse the connection string
    const url = new URL(databaseUrl)
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.slice(1).split('?')[0],
      user: url.username,
      password: url.password,
    }
  }

  // Fallback to individual env vars
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'voxera_ucaas',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'voxera_dev_password',
  }
}

// Create PostgreSQL connection pool with explicit config
const dbConfig = getDatabaseConfig()

// Log connection info in development (without password)
if (process.env.NODE_ENV === 'development') {
  console.log('Database connection config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password ? '[CONFIGURED]' : '[MISSING]',
  })
}

const pool = new pg.Pool(dbConfig)

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err)
})

// Create Prisma adapter
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown
export async function disconnectDatabase() {
  await pool.end()
  await prisma.$disconnect()
}
