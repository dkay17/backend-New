import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../src/lib/prisma.js';
import { apiHandler } from '../../src/lib/apiHandler.js';

async function handler(_req: VercelRequest, res: VercelResponse) {
  const stats = await prisma.calendarStat.findMany();

  const counts = stats.reduce((acc, s) => {
    if (s.platform === 'google' || s.platform === 'apple') {
        acc[s.platform] += s.count ?? 0;
      }
    return acc;
  }, { google: 0, apple: 0 });

  return res.json({ counts });
}

export default apiHandler(handler)
