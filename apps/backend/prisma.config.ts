import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// Load environment variables
config()

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:voxera_dev_password@localhost:5432/voxera_ucaas?schema=public'

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})
