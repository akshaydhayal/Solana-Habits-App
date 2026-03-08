import { expo } from '@better-auth/expo'
import { solanaAuth } from '@my-app/better-auth-solana'
import { mongoDb } from '@my-app/db'
import { env } from '@my-app/env/server'
import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'

export const auth = betterAuth({
  database: mongodbAdapter(mongoDb),
  user: {
    additionalFields: {
      dob: {
        type: 'string',
        required: false,
      },
    },
  },
  trustedOrigins: [
    ...env.CORS_ORIGINS,
    ...(env.NODE_ENV === 'development'
      ? [
          'exp://',
          'exp://**',
          'my-app://**',
          'exp://192.168.*.*:*/**',
          'http://localhost:8081',
        ]
      : []),
  ],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    expo(),
    solanaAuth({
      domain: new URL(env.BETTER_AUTH_URL).hostname,
      anonymous: true,
      cluster: env.SOLANA_CLUSTER,
      emailDomainName: env.SOLANA_EMAIL_DOMAIN,
    }),
  ],
})
