import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useState, useEffect } from 'react'
import {
  Text,
  View,
  Pressable,
  SafeAreaView,
  StyleSheet,
} from 'react-native'
import { orpc } from '@/utils/orpc'
import { useQueryClient, useMutation } from '@tanstack/react-query'

export default function HabitConfigScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const queryClient = useQueryClient()
  
  const [name, setName] = useState(params.name as string || '')
  const [color, setColor] = useState(params.color as string || '#3b82f6')
  const [icon, setIcon] = useState(params.icon as string || 'flame')
  const [type, setType] = useState(params.type as 'good' | 'bad' || 'bad')
  
  // Goal state
  const [badHabitType, setBadHabitType] = useState<'stop' | 'limit'>(params.badHabitType as any || 'stop')
  const [goalValue, setGoalValue] = useState(Number(params.goalValue) || 1)
  const [goalUnit, setGoalUnit] = useState(params.goalUnit as string || 'times')
  const [goalFrequency, setGoalFrequency] = useState(params.goalFrequency as string || 'per week')
  
  // Date state
  const [startDate, setStartDate] = useState(params.startDate as string || new Date().toISOString().split('T')[0])

  const createHabit = useMutation({
    ...orpc.habits.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(orpc.habits.getAll.queryOptions())
      router.dismissAll()
      router.replace('/(tabs)')
    }
  })

  // Update state when params change (from sub-screens)
  useEffect(() => {
    if (params.badHabitType) setBadHabitType(params.badHabitType as any)
    if (params.goalValue) setGoalValue(Number(params.goalValue))
    if (params.goalUnit) setGoalUnit(params.goalUnit as string)
    if (params.goalFrequency) setGoalFrequency(params.goalFrequency as string)
    if (params.startDate) setStartDate(params.startDate as string)
  }, [params])

  const handleSave = () => {
    createHabit.mutate({
      name,
      type,
      badHabitType,
      goalValue: badHabitType === 'limit' ? goalValue : undefined,
      goalUnit: badHabitType === 'limit' ? goalUnit : undefined,
      goalFrequency: badHabitType === 'limit' ? goalFrequency : undefined,
      startDate,
      color,
      frequency: ['Daily'], // Default for now
    })
  }

  const goalText = badHabitType === 'stop' 
    ? 'Quit This Habit' 
    : `No more than ${goalValue} ${goalUnit} ${goalFrequency}`

  const dateText = startDate === new Date().toISOString().split('T')[0]
    ? 'Start from Today'
    : `Starts on ${startDate}`

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-white/5">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="white" />
        </Pressable>
        <Pressable 
          onPress={handleSave}
          disabled={createHabit.isPending}
          className="bg-[#3b82f6] px-6 py-2 rounded-lg"
        >
          <Text className="text-white font-bold text-base">
            {createHabit.isPending ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <View className="px-5 pt-8">
        <View className="flex-row items-center gap-4 mb-10">
          <View 
            style={{ backgroundColor: `${color}20` }} 
            className="h-14 w-14 rounded-2xl items-center justify-center"
          >
            <Ionicons name={icon as any} size={32} color={color} />
          </View>
          <Text className="text-white text-2xl font-bold">{name}</Text>
        </View>

        <View className="gap-2">
          <Pressable 
            onPress={() => router.push({
              pathname: '/habit-goal',
              params: { badHabitType, goalValue, goalUnit, goalFrequency }
            })}
            className="flex-row items-center justify-between py-6 border-b border-white/5"
          >
            <View className="flex-row items-center gap-4">
              <Ionicons name="locate" size={24} color="#71717a" />
              <Text className="text-white text-lg font-medium">{goalText}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#71717a" />
          </Pressable>

          <Pressable 
            onPress={() => {
              // For now simpler date selection or just navigate to a placeholder calendat
              // In production we'd use a real calendar, but here we can just mock it or use an alert
              // Let's stick to the flow and use a placeholder
              router.push({
                pathname: '/habit-date',
                params: { startDate }
              })
            }}
            className="flex-row items-center justify-between py-6 border-b border-white/5"
          >
            <View className="flex-row items-center gap-4">
              <Ionicons name="calendar-outline" size={24} color="#71717a" />
              <Text className="text-white text-lg font-medium">{dateText}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#71717a" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
