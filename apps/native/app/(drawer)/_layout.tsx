import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { useThemeColor } from 'heroui-native'
import { useCallback } from 'react'
import { Pressable, Text } from 'react-native'

import { authClient } from '@/lib/auth-client'

function DrawerLayout() {
  const { data: session } = authClient.useSession()
  const isFullyOnboarded = session?.user && (session.user as any).dob

  return (
    <Drawer
      screenOptions={{
        headerTintColor: '#FFFFFF',
        headerStyle: { backgroundColor: '#0A0A0A' },
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerShadowVisible: false,
        drawerStyle: { 
          backgroundColor: '#0A0A0A',
          width: 280,
        },
        drawerActiveTintColor: '#3b82f6',
        drawerInactiveTintColor: '#71717a',
        drawerLabelStyle: {
          fontWeight: '600',
          fontSize: 16,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: 'Dashboard',
          drawerLabel: 'Dashboard',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="habits"
        options={{
          headerTitle: 'My Habits',
          drawerItemStyle: isFullyOnboarded ? undefined : { display: 'none' },
          drawerLabel: 'My Habits',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="ai"
        options={{
          headerTitle: 'AI Coach',
          drawerLabel: 'AI Coach',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Internal/HIDDEN Routes */}
      <Drawer.Screen
        name="(tabs)"
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="solana"
        options={{ drawerItemStyle: { display: 'none' } }}
      />
    </Drawer>
  )
}

export default DrawerLayout
