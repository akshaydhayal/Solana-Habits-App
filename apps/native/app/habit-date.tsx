import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React from 'react'
import {
  Text,
  View,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native'

export default function HabitDateScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  
  const currentDate = params.startDate as string
  
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      value: d.toISOString().split('T')[0]
    }
  })

  const selectDate = (date: string) => {
    router.navigate({
      pathname: '/habit-config',
      params: { ...params, startDate: date }
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center border-b border-white/5">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Start Date</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        {dates.map((d) => (
          <Pressable 
            key={d.value} 
            onPress={() => selectDate(d.value)}
            className="flex-row items-center justify-between py-5 border-b border-white/5"
          >
            <Text className={`text-lg ${currentDate === d.value ? 'text-[#3b82f6] font-bold' : 'text-white'}`}>
              {d.label}
            </Text>
            {currentDate === d.value && <Ionicons name="checkmark" size={24} color="#3b82f6" />}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
