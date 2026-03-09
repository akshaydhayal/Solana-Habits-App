import '@/polyfills'
import '@/global.css'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  createSolanaDevnet,
  MobileWalletProvider,
} from '@wallet-ui/react-native-kit'
import { Stack, useRouter, useSegments } from 'expo-router'
import { HeroUINativeProvider } from 'heroui-native'
import { useEffect } from 'react'
import { ActivityIndicator, Image, View, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'

import { AppThemeProvider } from '@/contexts/app-theme-context'
import { authClient } from '@/lib/auth-client'
import { queryClient } from '@/utils/orpc'

export const unstable_settings = {
  initialRouteName: '(drawer)',
}

const cluster = createSolanaDevnet()
const identity = {
  name: 'HabitGo',
  uri: 'https://habitgo.app',
  icon: 'favicon.png',
}

function LoadingScreen() {
  return (
    <View className="flex-1 bg-[#0a0a0a] items-center justify-center">
      <Image 
        source={require('../assets/logo.png')} 
        style={{ width: 96, height: 96, borderRadius: 28 }}
        className="mb-8 shadow-2xl" 
        resizeMode="contain" 
      />
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-gray-400 font-medium text-lg">
        Loading app...
      </Text>
    </View>
  )
}

function StackLayout() {
  const { isPending, data: session } = authClient.useSession()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return

    const inAuthGroup = segments[0] === 'onboarding'
    const isAuthenticated = !!session

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/onboarding')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/')
    }
  }, [session, isPending, segments])

  if (isPending) {
    return <LoadingScreen />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="modal"
        options={{ title: 'Modal', presentation: 'modal' }}
      />
    </Stack>
  )
}

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <MobileWalletProvider cluster={cluster} identity={identity}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <AppThemeProvider>
              <HeroUINativeProvider>
                <StackLayout />
              </HeroUINativeProvider>
            </AppThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </MobileWalletProvider>
    </QueryClientProvider>
  )
}
