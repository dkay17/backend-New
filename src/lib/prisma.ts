import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
// @ts-ignore
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }


// import { PrismaClient } from '@prisma/client'
// import { withAccelerate } from '@prisma/extension-accelerate'

// const globalForPrisma = global as unknown as { 
//   prisma: ReturnType<typeof prismaClientSingleton> 
// }

// const prismaClientSingleton = () => {
//   return new PrismaClient({}).$extends(withAccelerate({}))
// }

// export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// // Always cache in global for serverless (Vercel reuses containers)
// if (!globalForPrisma.prisma) {
//   globalForPrisma.prisma = prisma
// }
