// src/lib/apiHandler.ts
import { VercelRequest, VercelResponse } from '@vercel/node'

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<any> | any

function extractIdFromPath(req: VercelRequest): string | undefined {
  try {
    const raw = req.url ?? ''
    // Ensure we have an absolute URL for the URL parser
    const u = new URL(raw, 'http://localhost')
    const parts = u.pathname.split('/').filter(Boolean)
    // parts for /api/events/<id>/click -> ["api","events","<id>","click"]
    const eventsIndex = parts.indexOf('events')
    if (eventsIndex >= 0 && parts.length > eventsIndex + 1) {
      return parts[eventsIndex + 1]
    }
  } catch (err) {
    // ignore parse errors
  }
  return undefined
}

export function apiHandler(handler: Handler): Handler {
  return async (req, res) => {
    try {
      // If the route framework didn't populate `req.query.id`, try extracting from the path.
      const currentId = (req.query as any)?.id as string | undefined
      if (!currentId) {
        const id = extractIdFromPath(req)
        if (id) {
          ;(req.query as any) = { ...(req.query as any), id }
        }
      }

      const result = await handler(req, res)
      return result
    } catch (error) {
      console.error('API Error:', error)
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      })
    }
    // Note: Do NOT disconnect Prisma in serverless functions
    // Vercel reuses containers and Prisma Accelerate handles connection pooling automatically
  }
}
