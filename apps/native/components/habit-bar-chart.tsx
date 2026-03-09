import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'

const HABIT_ICONS = [
  'walk-outline',
  'fitness-outline',
  'water-outline',
  'bicycle-outline',
  'boat-outline',
  'book-outline',
  'analytics-outline',
  'barbell-outline',
  'navigate-outline',
]

const BARS = [
  { height: 40, color: '#3b82f6', tilted: true },
  { height: 50, color: '#FFFFFF', tilted: false },
  { height: 60, color: '#FFFFFF', tilted: false },
  { height: 70, color: '#FFFFFF', tilted: false },
  { height: 75, color: '#FFFFFF', tilted: false },
  { height: 85, color: '#FFFFFF', tilted: false },
  { height: 100, color: '#FFFFFF', tilted: false },
  { height: 120, color: '#FFFFFF', tilted: false },
  { height: 140, color: '#FFFFFF', tilted: false },
  { height: 160, color: '#FFFFFF', tilted: false },
]

export const HabitBarChart = () => {
  return (
    <View className="items-center justify-center py-10 scale-110">
      {/* Bars Row */}
      <View className="flex-row items-end gap-2 px-4 h-40">
        {BARS.map((bar, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(index * 100)}
            style={{
              height: bar.height,
              width: 20,
              backgroundColor: bar.color,
              borderRadius: 4,
              transform: bar.tilted ? [{ rotate: '-15deg' }, { translateY: 10 }] : [],
            }}
          />
        ))}
      </View>

      {/* Icons Row */}
      <View className="flex-row items-center gap-2.5 px-4 mt-2">
        {BARS.map((bar, index) => (
          <View key={index} style={{ width: 18 }} className="items-center">
             {!bar.tilted && HABIT_ICONS[index - 1] && (
               <Ionicons name={HABIT_ICONS[index - 1] as any} size={18} color="#FFFFFF" />
             )}
          </View>
        ))}
      </View>
    </View>
  )
}
