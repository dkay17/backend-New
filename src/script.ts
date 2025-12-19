import { prisma } from './lib/prisma'

async function main() {
  // Create a new event
  const event = await prisma.event.create({
    data: {
      id: 'lumenfest-2025',
      name: 'LümenFest 2025',
      description: 'An unforgettable experience',
      calendarStats: {
        create: [
          {
            platform: 'google',
            count: 0,
          },
          {
            platform: 'apple',
            count: 0,
          },
        ],
      },
    },
    include: {
      calendarStats: true,
    },
  })
  console.log('Created event:', JSON.stringify(event, null, 2))

  // Increment Google Calendar counter
  const updatedGoogleStat = await prisma.calendarStat.update({
    where: {
      eventId_platform: {
        eventId: 'lumenfest-2025',
        platform: 'google',
      },
    },
    data: {
      count: {
        increment: 1,
      },
    },
  })
  console.log('Updated Google Calendar stat:', updatedGoogleStat)

  // Increment Apple Calendar counter
  const updatedAppleStat = await prisma.calendarStat.update({
    where: {
      eventId_platform: {
        eventId: 'lumenfest-2025',
        platform: 'apple',
      },
    },
    data: {
      count: {
        increment: 1,
      },
    },
  })
  console.log('Updated Apple Calendar stat:', updatedAppleStat)

  // Fetch event with all stats
  const eventWithStats = await prisma.event.findUnique({
    where: { id: 'lumenfest-2025' },
    include: { calendarStats: true },
  })
  console.log('Final event stats:', JSON.stringify(eventWithStats, null, 2))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
