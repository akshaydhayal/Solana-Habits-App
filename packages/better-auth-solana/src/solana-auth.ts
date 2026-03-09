import { address, isAddress, isSignature, signature } from '@solana/kit'
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthEndpoint } from 'better-auth/api'
import { z } from 'zod'
import { solanaAuthSchema } from './schema'
import type { SolanaAuthOptions } from './types'
import { generateNonce, verifySolanaSignature } from './verify-signature'

export const solanaAuth = (options: SolanaAuthOptions): BetterAuthPlugin => {
  const {
    domain,
    emailDomainName = 'solana.local',
    anonymous = true,
    nonceExpirationMs = 15 * 60 * 1000, // 15 minutes
    cluster = 'mainnet-beta',
  } = options

  return {
    id: 'solana-auth',
    schema: solanaAuthSchema,
    endpoints: {
      // POST /solana-auth/nonce - Generate a nonce for wallet authentication
      getNonce: createAuthEndpoint(
        '/solana-auth/nonce',
        {
          method: 'POST',
          body: z.object({
            walletAddress: z
              .string()
              .refine((val) => isAddress(val), {
                message: 'Invalid Solana address',
              })
              .transform((val) => address(val)),
          }),
        },
        async (ctx) => {
          const { walletAddress } = ctx.body
          const nonce = generateNonce()

          // Store nonce in verification table
          await ctx.context.internalAdapter.createVerificationValue({
            identifier: `solana:${walletAddress}:${cluster}`,
            value: nonce,
            expiresAt: new Date(Date.now() + nonceExpirationMs),
          })

          return ctx.json({
            nonce,
            domain,
            uri: ctx.context.options.baseURL || `https://${domain}`,
            issuedAt: new Date().toISOString(),
            expirationTime: new Date(
              Date.now() + nonceExpirationMs,
            ).toISOString(),
            chainId: cluster,
          })
        },
      ),

      // POST /solana-auth/verify - Verify signature and create session
      verify: createAuthEndpoint(
        '/solana-auth/verify',
        {
          method: 'POST',
          body: z.object({
            walletAddress: z
              .string()
              .refine((val) => isAddress(val), {
                message: 'Invalid Solana address',
              })
              .transform((val) => address(val)),
            signature: z
              .string()
              .refine((val) => isSignature(val), {
                message: 'Invalid Solana signature',
              })
              .transform((val) => signature(val)),
            message: z.string().min(1),
            email: z.email().optional(),
          }),
        },
        async (ctx) => {
          const { walletAddress, signature, message, email } = ctx.body

          // Require email if not anonymous
          if (!anonymous && !email) {
            throw new APIError('BAD_REQUEST', {
              message: 'Email is required for authentication',
            })
          }

          // Retrieve and validate nonce
          const nonceRecord =
            await ctx.context.internalAdapter.findVerificationValue(
              `solana:${walletAddress}:${cluster}`,
            )

          if (!nonceRecord) {
            throw new APIError('UNAUTHORIZED', {
              message: 'Invalid or expired nonce. Please request a new nonce.',
            })
          }

          if (new Date(nonceRecord.expiresAt) < new Date()) {
            // Delete expired nonce
            await ctx.context.internalAdapter.deleteVerificationByIdentifier(
              nonceRecord.identifier,
            )
            throw new APIError('UNAUTHORIZED', {
              message: 'Nonce has expired. Please request a new nonce.',
            })
          }

          // Verify the signature
          const isValid = await verifySolanaSignature({
            address: walletAddress,
            message,
            signature,
          })

          if (!isValid) {
            throw new APIError('UNAUTHORIZED', {
              message: 'Invalid signature',
            })
          }

          // Delete the used nonce (single-use)
          await ctx.context.internalAdapter.deleteVerificationByIdentifier(
            nonceRecord.identifier,
          )

          // Find or create user
          const adapter = ctx.context.adapter
          const internal = ctx.context.internalAdapter

          // Check if wallet is already linked to a user
          console.log(`[SolanaAuth] Checking wallet: ${walletAddress} (cluster: ${cluster})`)
          const walletRecord = await adapter.findOne({
            model: 'walletAddress',
            where: [
              { field: 'address', value: walletAddress },
              { field: 'cluster', value: cluster },
            ],
          })
          
          let user: any = null
          let isNewUser = false
          const generatedEmail = email || `${walletAddress}@${emailDomainName}`

          if (walletRecord) {
            const userId = (walletRecord as any).userId
            console.log(`[SolanaAuth] Wallet link found. userId: ${userId}`)
            user = await internal.findUserById(userId)
            if (user) {
              console.log(`[SolanaAuth] Linked user found: ${user.id}`)
            } else {
              console.warn(`[SolanaAuth] Wallet points to user ${userId} but user record is missing!`)
            }
          }

          // Fallback: Check by email to prevent duplicate accounts
          if (!user) {
            console.log(`[SolanaAuth] Searching for user by email: ${generatedEmail}`)
            user = await internal.findUserByEmail(generatedEmail)
            if (user) {
              console.log(`[SolanaAuth] Found existing user by email: ${user.id}. Linking wallet...`)
              // Link this wallet to the existing user
              await adapter.create({
                model: 'walletAddress',
                data: {
                  id: crypto.randomUUID(),
                  userId: user.id,
                  address: walletAddress,
                  cluster,
                  isPrimary: true,
                  createdAt: new Date(),
                },
              })
            }
          }

          if (!user) {
            // Create new user
            console.log(`[SolanaAuth] No existing user found. Creating new user for ${generatedEmail}`)
            isNewUser = true
            user = await internal.createUser({
              email: generatedEmail,
              emailVerified: !email,
              name: walletAddress.slice(0, 8),
            })
            console.log(`[SolanaAuth] Created new user: ${user.id}`)

            // Link wallet
            await adapter.create({
              model: 'walletAddress',
              data: {
                id: crypto.randomUUID(),
                userId: user.id,
                address: walletAddress,
                cluster,
                isPrimary: true,
                createdAt: new Date(),
              },
            })
          }

          // Create session
          const session = await ctx.context.internalAdapter.createSession(
            user.id,
          )

          // Set session cookie
          await ctx.setSignedCookie(
            ctx.context.authCookies.sessionToken.name,
            session.token,
            ctx.context.secret,
            ctx.context.authCookies.sessionToken.attributes,
          )

          return ctx.json({
            user,
            session,
            isNewUser,
          })
        },
      ),

      // GET /solana-auth/wallets - Get user's linked wallets
      getWallets: createAuthEndpoint(
        '/solana-auth/wallets',
        {
          method: 'GET',
          requireHeaders: true,
        },
        async (ctx) => {
          // Get session from signed cookie
          const sessionToken = await ctx.getSignedCookie(
            ctx.context.authCookies.sessionToken.name,
            ctx.context.secret,
          )

          if (!sessionToken) {
            throw new APIError('UNAUTHORIZED', {
              message: 'Not authenticated',
            })
          }

          const sessionData =
            await ctx.context.internalAdapter.findSession(sessionToken)

          if (!sessionData) {
            throw new APIError('UNAUTHORIZED', {
              message: 'Invalid session',
            })
          }

          const wallets = await ctx.context.adapter.findMany({
            model: 'walletAddress',
            where: [{ field: 'userId', value: sessionData.user.id }],
          })

          return ctx.json({ wallets })
        },
      ),
    },
  }
}

export type { SolanaAuthOptions, SolanaAuthPlugin } from './types'
