import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Dimensions,
} from 'react-native'
import { useThemeColor } from 'heroui-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const foregroundColor = '#FFFFFF'
  const mutedColor = '#71717a'
  const accentColor = '#3b82f6'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopWidth: 1,
          borderTopColor: '#1A1A1A',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: mutedColor,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => (
            <View className="relative">
              <View className={focused ? 'bg-[#3b82f6]/20 px-6 py-1.5 rounded-3xl' : ''}>
                <Ionicons name={focused ? "reorder-two" : "reorder-two-outline"} size={26} color={color} />
              </View>
              <View className="absolute -top-1 -right-1 bg-red-500 h-4 w-4 rounded-full items-center justify-center border-2 border-[#0A0A0A]">
                <Text className="text-white text-[8px] font-bold">2</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
