import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { prisma } from './lib/prisma'

dotenv.config()

const app = express()
// Configure CORS to allow the frontend origin(s)
// const allowedOrigins = [
// 	process.env.FRONTEND_URL || 'http://localhost:3000',
// 	'https://localhost:3000',
// 	'http://localhost:3001',
// 	'https://localhost:3001',
// ]

// const corsOptions = {
// 	origin: function (origin, callback) {
// 		// allow requests with no origin (like curl, server-to-server)
// 		if (!origin) return callback(null, true)
// 		if (allowedOrigins.indexOf(origin) !== -1) {
// 			return callback(null, true)
// 		}
// 		return callback(new Error('CORS policy: This origin is not allowed'))
// 	},
// 	credentials: true,
// 	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// 	allowedHeaders: ['Content-Type', 'Authorization'],
// }

// app.use(cors(corsOptions))
// app.options('*', cors(corsOptions)) // preflight
// app.use(express.json())

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5000',
  'http://localhost:5000',
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Mobile devices on local network
  /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,  // Some local network IPs
  /^http:\/\/172\.\d+\.\d+\.\d+:\d+$/, // Docker/local network IPs
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // Still allow for mobile apps (they might not send origin)
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
	res.json({ ok: true })
})

// Get stats for an event (returns array of calendarStat objects)
app.get('/events/:id/stats', async (req, res) => {
	const { id } = req.params
	try {
		const stats = await prisma.calendarStat.findMany({ where: { eventId: id } })
		res.json({ eventId: id, stats })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Failed to fetch stats' })
	}
})

// Get aggregated counts for an event (per-platform totals)
// Optional query param: ?platform=google or ?platform=apple to filter by specific platform
app.get('/events/:id/counts', async (req, res) => {
	const { id } = req.params
	const { platform } = req.query
	try {
		const stats = await prisma.calendarStat.findMany({ where: { eventId: id } })
		const counts = stats.reduce(
			(acc, s) => {
				const p = s.platform || 'unknown'
				acc[p] = (acc[p] || 0) + (s.count || 0)
				return acc
			},
			{ google: 0, apple: 0 }
		)

		// If platform filter is specified, return only that platform's count
		if (platform && (platform === 'google' || platform === 'apple')) {
			return res.json({ eventId: id, platform, count: counts[platform] })
		}

		res.json({ eventId: id, counts })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Failed to fetch aggregated counts' })
	}
})

// Get global aggregated counts across all events (per-platform totals)
app.get('/stats/platforms', async (_req, res) => {
	try {
		const stats = await prisma.calendarStat.findMany()
		const counts = stats.reduce((acc, s) => {
			const p = s.platform || 'unknown'
			acc[p] = (acc[p] || 0) + (s.count || 0)
			return acc
		}, { google: 0, apple: 0 })

		res.json({ counts })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Failed to fetch global counts' })
	}
})

// Increment a specific platform counter for an event
app.post('/events/:id/click', async (req, res) => {
	const { id } = req.params
	const { platform } = req.body
	if (!platform || (platform !== 'google' && platform !== 'apple')) {
		return res.status(400).json({ error: 'platform is required and must be "google" or "apple"' })
	}

	try {
		// Ensure event exists (create minimal event if missing)
		await prisma.event.upsert({
			where: { id },
			update: {},
			create: { id, name: id },
		})

		// Upsert calendarStat by the composite unique (eventId, platform)
		const stat = await prisma.calendarStat.upsert({
			where: { eventId_platform: { eventId: id, platform } },
			update: { count: { increment: 1 } },
			create: { eventId: id, platform, count: 1 },
		})

		res.json(stat)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Failed to increment counter' })
	}
})

const port = process.env.PORT ? Number(process.env.PORT) : 5000
const server = app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`)
})

// Clean shutdown
const shutdown = async () => {
	console.log('Shutting down server...')
	server.close()
	await prisma.$disconnect()
	process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)





    // "start": "node src/server.ts",
    // "build": "prisma generate && prisma migrate deploy",
    // "dev": "tsx watch src/server.ts",
    // "vercel-build": "npm run build "
