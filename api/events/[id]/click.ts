// import { VercelRequest, VercelResponse } from '@vercel/node';
// import { prisma } from '../../../src/lib/prisma';

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   const id = req.query.id as string;
//   const { platform } = req.body;

//   if (!platform || (platform !== 'google' && platform !== 'apple')) {
//     return res.status(400).json({ error: 'platform must be google or apple' });
//   }

//   try {
//     await prisma.event.upsert({
//       where: { id },
//       update: {},
//       create: { id, name: id },
//     });

//     const stat = await prisma.calendarStat.upsert({
//       where: { eventId_platform: { eventId: id, platform } },
//       update: { count: { increment: 1 } },
//       create: { eventId: id, platform, count: 1 },
//     });

//     return res.json(stat);
//   } catch (err) {
//     return res.status(500).json({ error: 'Failed to increment counter' });
//   }
// }





import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../../src/lib/prisma.js'
import { apiHandler } from '../../../src/lib/apiHandler.js'

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const id = req.query.id as string
  const { platform } = req.body

  if (!platform || (platform !== 'google' && platform !== 'apple')) {
    return res.status(400).json({ error: 'platform must be google or apple' })
  }

  await prisma.event.upsert({
    where: { id },
    update: {},
    create: { id, name: id },
  })

  const stat = await prisma.calendarStat.upsert({
    where: { eventId_platform: { eventId: id, platform } },
    update: { count: { increment: 1 } },
    create: { eventId: id, platform, count: 1 },
  })

  return res.json(stat)
}

export default apiHandler(handler)
