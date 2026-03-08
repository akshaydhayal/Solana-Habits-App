import type { RouterClient } from '@orpc/server'

import { protectedProcedure, publicProcedure } from '../index'
import { habitsRouter } from './habits'
import { solanaRouter } from './solana'

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return 'OK'
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: 'This is private',
      user: context.session?.user,
    }
  }),
  habits: habitsRouter,
  solana: solanaRouter,
}
export type AppRouter = typeof appRouter
export type AppRouterClient = RouterClient<typeof appRouter>
