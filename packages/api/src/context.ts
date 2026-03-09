import { auth } from '@my-app/auth'
import { mongoDb } from '@my-app/db'
import { env } from '@my-app/env/server'
import { createSolanaClient } from '@my-app/solana-client'
import type { Context as HonoContext } from 'hono'

export type CreateContextOptions = {
  context: HonoContext
}

export async function createContext({ context }: CreateContextOptions) {
  const authHeader = context.req.header('Authorization')
  const cookieHeader = context.req.header('Cookie')
  
  // Exhaustive logging for debugging
  console.log('[Context] All Incoming Header Keys:', Array.from(context.req.raw.headers.keys()).join(', '))
  if (cookieHeader) {
    const keys = cookieHeader.split(';').map(c => c.split('=')[0].trim())
    console.log(`[Context] Received Cookie Keys: ${keys.join(', ')}`)
  }

  let session = await auth.api.getSession({
    headers: context.req.raw.headers,
  })

  // MANUAL TOKEN RESCUE
  // If getSession fails but we HAVE an Authorization header, try to manually find the session
  if (!session && authHeader?.startsWith('Bearer ')) {
    console.log('[Context] getSession failed. Attempting Manual Token Rescue...')
    try {
      const token = authHeader.split(' ')[1]
      if (token) {
        // Find session in MongoDB manually
        const sessionRecord = await mongoDb.collection('session').findOne({ sessionToken: token })
        if (sessionRecord && sessionRecord.expiresAt > new Date()) {
          // Find user for this session
          const userRecord = await mongoDb.collection('user').findOne({ _id: sessionRecord.userId })
          if (userRecord) {
            console.log(`[Context] Manual Rescue SUCCESS! Authenticated user: ${userRecord._id}`)
            session = {
              session: {
                id: sessionRecord._id.toString(),
                userId: sessionRecord.userId.toString(),
                token: sessionRecord.sessionToken,
                expiresAt: sessionRecord.expiresAt,
                ipAddress: sessionRecord.ipAddress,
                userAgent: sessionRecord.userAgent,
                createdAt: sessionRecord.createdAt,
                updatedAt: sessionRecord.updatedAt,
              },
              user: {
                id: userRecord._id.toString(),
                email: userRecord.email,
                emailVerified: userRecord.emailVerified,
                name: userRecord.name,
                image: userRecord.image,
                createdAt: userRecord.createdAt,
                updatedAt: userRecord.updatedAt,
                dob: userRecord.dob,
              }
            } as any
          }
        }
      }
    } catch (e) {
      console.warn('[Context] Manual token rescue failed', e)
    }
  }

  if (session) {
    console.log(`[Context] Session found for user: ${session.user.id}`)
  } else {
    console.log(`[Context] No session found. Auth present: ${!!authHeader}, Cookie present: ${!!cookieHeader}`)
  }

  const solana = createSolanaClient({
    url: env.SOLANA_ENDPOINT,
  })

  return {
    session,
    solana,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
