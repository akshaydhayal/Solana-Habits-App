import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Button,
  Input,
  Spinner,
  Surface,
  TextField,
  useThemeColor,
} from 'heroui-native'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'

import { Container } from '@/components/container'
import { orpc } from '@/utils/orpc'

export default function HabitsScreen() {
  const [newHabitName, setNewHabitName] = useState('')
  const habits = useQuery(orpc.habits.getAll.queryOptions())

  const createMutation = useMutation(
    orpc.habits.create.mutationOptions({
      onSuccess: () => {
        habits.refetch()
        setNewHabitName('')
      },
      onError: (err) => Alert.alert('Error', err.message),
    }),
  )

  const toggleMutation = useMutation(
    orpc.habits.toggleDay.mutationOptions({
      onSuccess: () => habits.refetch(),
    }),
  )

  const deleteMutation = useMutation(
    orpc.habits.delete.mutationOptions({
      onSuccess: () => habits.refetch(),
    }),
  )

  const mutedColor = useThemeColor('muted')
  const dangerColor = useThemeColor('danger')
  const foregroundColor = useThemeColor('foreground')
  const successColor = useThemeColor('success')

  const todayStr = new Date().toISOString().split('T')[0]

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      createMutation.mutate({ name: newHabitName })
    }
  }

  const handleToggleToday = (habit: any) => {
    const todayRecord = habit.history?.find((h: any) => h.date === todayStr)
    const currentlyCompleted = todayRecord?.completed ?? false

    toggleMutation.mutate({
      id: habit.id,
      date: todayStr,
      completed: !currentlyCompleted,
    })
  }

  const handleDeleteHabit = (id: string) => {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate({ id }),
      },
    ])
  }

  const isLoading = habits?.isLoading

  return (
    <Container>
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <View className="mb-6 py-6">
          <Text className="font-bold text-3xl text-white tracking-tight">
            Daily Habits
          </Text>
          <Text className="text-gray-400 text-base mt-2">
            Small steps, remarkable progress.
          </Text>
        </View>

        <View className="mb-8 bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 shadow-sm">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-[#262626] rounded-xl px-4 py-1 border border-white/5">
              <TextField>
                <Input
                  value={newHabitName}
                  onChangeText={setNewHabitName}
                  placeholder="e.g. Morning Meditation"
                  placeholderTextColor="#71717a"
                  className="text-white h-12"
                  editable={!createMutation.isPending}
                  onSubmitEditing={handleAddHabit}
                  returnKeyType="done"
                />
              </TextField>
            </View>
            <Button
              isIconOnly
              onPress={handleAddHabit}
              isDisabled={createMutation.isPending || !newHabitName.trim()}
              className={`h-12 w-12 rounded-xl items-center justify-center ${
                !newHabitName.trim() ? 'bg-zinc-800' : 'bg-[#3b82f6]'
              }`}
            >
              {createMutation.isPending ? (
                <Spinner size="sm" color="white" />
              ) : (
                <Ionicons
                  name="add"
                  size={24}
                  color="white"
                />
              )}
            </Button>
          </View>
        </View>

        {isLoading && (
          <View className="items-center justify-center py-12">
            <Spinner size="lg" />
            <Text className="mt-3 text-muted text-sm">Loading habits...</Text>
          </View>
        )}

        {habits?.data && habits.data.length === 0 && !isLoading && (
          <View
            className="items-center justify-center rounded-3xl py-16 bg-[#1a1a1a] border border-white/5"
          >
            <View className="h-20 w-20 rounded-full bg-zinc-800 items-center justify-center mb-6">
              <Ionicons name="calendar-clear-outline" size={40} color="#71717a" />
            </View>
            <Text className="font-bold text-white text-xl">
              Start your journey
            </Text>
            <Text className="mt-2 text-gray-500 text-center px-12 leading-5">
              Establish a new routine by adding your first daily habit above.
            </Text>
          </View>
        )}

        {habits?.data && habits.data.length > 0 && (
          <View className="gap-4">
            {habits.data.map((habit: any) => {
              const todayRecord = habit.history?.find((h: any) => h.date === todayStr)
              const isCompletedToday = todayRecord?.completed ?? false

              return (
                <View
                  key={habit.id}
                  className={`rounded-2xl p-5 border ${
                    isCompletedToday 
                      ? 'bg-[#1a1a1a] border-[#3b82f6]/30 shadow-lg shadow-[#3b82f6]/5' 
                      : 'bg-[#1a1a1a] border-white/5'
                  }`}
                >
                  <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-1">
                      <Text className="font-bold text-xl text-white">
                        {habit.name}
                      </Text>
                      {habit.description && (
                        <Text className="text-gray-500 text-sm mt-1">{habit.description}</Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => handleDeleteHabit(habit.id)}
                      className="p-2 rounded-lg bg-red-500/10 active:opacity-60"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ef4444"
                      />
                    </Pressable>
                  </View>

                  <View className="flex-row justify-between items-center bg-black/20 -mx-5 -mb-5 p-5 rounded-b-2xl border-t border-white/5">
                    <View>
                      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Status
                      </Text>
                      <Text className={`text-sm font-medium mt-0.5 ${isCompletedToday ? 'text-[#3b82f6]' : 'text-gray-400'}`}>
                        {isCompletedToday ? 'Completed' : 'Pending'}
                      </Text>
                    </View>
                    
                    <Pressable
                      onPress={() => handleToggleToday(habit)}
                      className={`flex-row items-center gap-2 px-6 py-3 rounded-xl ${
                        isCompletedToday ? 'bg-[#3b82f6]' : 'bg-white/5'
                      } active:opacity-80`}
                    >
                      <Ionicons
                        name={isCompletedToday ? "checkmark-circle" : "add-circle-outline"}
                        size={20}
                        color="white"
                      />
                      <Text className="font-bold text-white">
                        {isCompletedToday ? 'Done' : 'Mark Done'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </Container>
  )
}
