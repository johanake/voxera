import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { config } from 'dotenv'

// Load environment variables
config()

// Parse DATABASE_URL
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:voxera_dev_password@localhost:5432/voxera_ucaas?schema=public'
const url = new URL(databaseUrl)

const dbConfig = {
  host: url.hostname,
  port: parseInt(url.port || '5432'),
  database: url.pathname.slice(1).split('?')[0],
  user: url.username,
  password: url.password,
}

const pool = new pg.Pool(dbConfig)
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Creating test data for PSTN integration...')

  const customerId = 'cust_001'

  // Try to find any existing user with an extension
  let user = await prisma.user.findFirst({
    where: {
      extension: { not: null }
    }
  })

  if (!user) {
    console.log('Creating test user...')
    user = await prisma.user.create({
      data: {
        customerId: customerId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+15551111111',
        extension: '101',
        role: 'user',
        status: 'active',
        preferences: {
          email: true,
          sms: false,
          push: true,
        },
        department: 'Sales',
        createdBy: 'system',
      }
    })
    console.log(`Created user: ${user.firstName} ${user.lastName}`)
  } else {
    console.log(`Found existing user: ${user.firstName} ${user.lastName} (${user.email})`)
  }

  console.log(`User Extension: ${user.extension}`)

  // Create a test phone number
  const phoneNumber = await prisma.phoneNumber.create({
    data: {
      customerId: user.customerId,
      number: '+15551234567', // Test number
      type: 'geographic',
      status: 'active',
      country: 'US',
      region: 'California',
      assignmentType: 'user',
      assignedToId: user.id,
      assignedToName: `${user.firstName} ${user.lastName}`,
      monthlyFee: 1.50,
      currency: 'USD',
      purchasedAt: new Date(),
      activatedAt: new Date(),
    }
  })

  console.log(`Created phone number: ${phoneNumber.number} (ID: ${phoneNumber.id})`)

  // Create a routing rule for the phone number
  const routingRule = await prisma.pBXRoutingRule.create({
    data: {
      customerId: user.customerId,
      name: `Default Route to ${user.firstName}`,
      phoneNumberId: phoneNumber.id,
      priority: 1,
      targetType: 'user',
      targetUserId: user.id,
      enabled: true,
      conditions: {
        timeRanges: [{ start: '00:00', end: '23:59' }], // Always active
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // All days
        callerIdPatterns: ['*'], // Any caller
      }
    }
  })

  console.log(`Created routing rule (Priority: ${routingRule.priority}) for ${user.firstName} ${user.lastName}`)

  console.log('\n✅ Test data created successfully!')
  console.log(`\nPhone Number: ${phoneNumber.number}`)
  console.log(`Assigned To: ${user.firstName} ${user.lastName} (${user.email})`)
  console.log(`Extension: ${user.extension}`)
  console.log(`\nYou can now configure this number in Twilio and test incoming calls.`)
}

main()
  .catch((e) => {
    console.error('Error creating test data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
    await prisma.$disconnect()
  })
