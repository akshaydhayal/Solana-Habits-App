import type { AppRouterClient } from '@my-app/api/routers/index'
import { env } from '@my-app/env/native'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

import { authClient } from '@/lib/auth-client'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.log(error)
    },
  }),
})

export const link = new RPCLink({
  url: `${env.EXPO_PUBLIC_SERVER_URL}/rpc`,
  fetch:
    Platform.OS !== 'web'
      ? undefined
      : (url, options) =>
          fetch(url, {
            ...options,
            credentials: 'include',
          }),
  headers: async () => {
    if (Platform.OS === 'web') return {}

    const headers = new Map<string, string>()
    
    try {
      // Use the official getCookie method from the expo plugin if available
      const cookieString = (authClient as any).getCookie?.() || ""
      console.log('[ORPC] Official getCookie found:', !!cookieString)
      
      const prefix = Constants.expoConfig?.scheme || 'my-app' 
      
      // 1. Set the Cookie header
      if (cookieString) {
        console.log('[ORPC] Cookie Header set (first 10 chars):', cookieString.substring(0, 10) + '...')
        headers.set('Cookie', cookieString)
      }

      // 2. Set the Authorization header (Raw Token)
      // Look into the stored cookie JSON FIRST for the raw token value
      const rawCookieData = await SecureStore.getItemAsync(`${prefix}_cookie`)
      if (rawCookieData) {
        try {
          const parsed = JSON.parse(rawCookieData)
          // Look for any key that looks like a session token (e.g. "better-auth.session_token" or "__Secure-better-auth.session_token")
          const sessionKey = Object.keys(parsed).find(k => k.includes('session_token'))
          if (sessionKey && parsed[sessionKey]?.value) {
            console.log('[ORPC] Authorization Header set from JSON lookup')
            headers.set('Authorization', `Bearer ${parsed[sessionKey].value}`)
          }
        } catch (e) {
          console.warn('[ORPC] Failed to parse cookie JSON for token', e)
        }
      } 
      
      // Fallback: Better-Auth Expo plugin caches the raw session data in _session_data
      if (!headers.has('Authorization')) {
        const sessionCache = await SecureStore.getItemAsync(`${prefix}_session_data`)
        if (sessionCache) {
          try {
            const parsed = JSON.parse(sessionCache)
            const token = parsed?.session?.token
            if (token) {
              console.log('[ORPC] Authorization Header set from session_data cache')
              headers.set('Authorization', `Bearer ${token}`)
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('[ORPC] Failed to retrieve session headers', e)
    }

    headers.set('expo-origin', 'my-app://')
    headers.set('Origin', 'my-app://')
    headers.set('x-skip-oauth-proxy', 'true')

    const result = Object.fromEntries(headers)
    console.log('[ORPC] Sending Headers:', JSON.stringify({
      ...result,
      Authorization: result.Authorization ? result.Authorization.substring(0, 15) + '...' : 'none',
      Cookie: result.Cookie ? result.Cookie.substring(0, 15) + '...' : 'none'
    }))
    return result
  },
})

export const client: AppRouterClient = createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
