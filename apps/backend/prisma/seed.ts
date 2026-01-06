import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
console.log('Connecting to database...', process.env.DATABASE_URL)

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})
async function main() {
  console.log('Seeding database...')

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        customerId: 'cust-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@acme.com',
        extension: '101',
        role: 'customer_admin',
        status: 'active',
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          newLicenseAssigned: true,
          numberPortingUpdates: true,
        },
        department: 'Management',
        createdBy: 'system',
      },
    }),
    prisma.user.create({
      data: {
        customerId: 'cust-1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@acme.com',
        extension: '102',
        role: 'manager',
        status: 'active',
        preferences: {
          emailNotifications: true,
          smsNotifications: true,
          newLicenseAssigned: true,
          numberPortingUpdates: true,
        },
        department: 'Sales',
        createdBy: 'system',
      },
    }),
    prisma.user.create({
      data: {
        customerId: 'cust-1',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@acme.com',
        extension: '103',
        role: 'user',
        status: 'active',
        preferences: {
          emailNotifications: false,
          smsNotifications: false,
          newLicenseAssigned: true,
          numberPortingUpdates: false,
        },
        department: 'Support',
        createdBy: 'system',
      },
    }),
  ])

  console.log(`Created ${users.length} users`)
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
