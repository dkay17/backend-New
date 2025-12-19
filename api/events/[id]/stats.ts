
import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../src/lib/prisma.js';
import { apiHandler } from '../../../src/lib/apiHandler.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;

  const stats = await prisma.calendarStat.findMany({ where: { eventId: id } })
  return res.json({ eventId: id, stats })
}

export default apiHandler(handler)
