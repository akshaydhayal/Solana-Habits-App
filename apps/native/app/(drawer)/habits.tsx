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
        <View className="mb-4 py-4">
          <Text className="font-semibold text-2xl text-foreground tracking-tight">
            Daily Habits
          </Text>
          <Text className="text-muted text-sm mt-1">
            Build consistency by checking off your habits every day.
          </Text>
        </View>

        <Surface variant="secondary" className="mb-6 rounded-lg p-3">
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <TextField>
                <Input
                  value={newHabitName}
                  onChangeText={setNewHabitName}
                  placeholder="e.g. Read 10 pages..."
                  editable={!createMutation.isPending}
                  onSubmitEditing={handleAddHabit}
                  returnKeyType="done"
                />
              </TextField>
            </View>
            <Button
              isIconOnly
              variant={
                createMutation.isPending || !newHabitName.trim()
                  ? 'secondary'
                  : 'primary'
              }
              isDisabled={createMutation.isPending || !newHabitName.trim()}
              onPress={handleAddHabit}
              size="sm"
            >
              {createMutation.isPending ? (
                <Spinner size="sm" color="default" />
              ) : (
                <Ionicons
                  name="add"
                  size={20}
                  color={
                    createMutation.isPending || !newHabitName.trim()
                      ? mutedColor
                      : foregroundColor
                  }
                />
              )}
            </Button>
          </View>
        </Surface>

        {isLoading && (
          <View className="items-center justify-center py-12">
            <Spinner size="lg" />
            <Text className="mt-3 text-muted text-sm">Loading habits...</Text>
          </View>
        )}

        {habits?.data && habits.data.length === 0 && !isLoading && (
          <Surface
            variant="secondary"
            className="items-center justify-center rounded-lg py-12"
          >
            <Ionicons name="calendar-clear-outline" size={48} color={mutedColor} />
            <Text className="mt-4 font-medium text-foreground text-lg">
              No habits yet
            </Text>
            <Text className="mt-1 text-muted text-sm text-center px-6">
              Establish a new routine by adding your first daily habit above.
            </Text>
          </Surface>
        )}

        {habits?.data && habits.data.length > 0 && (
          <View className="gap-3">
            {habits.data.map((habit: any) => {
              const todayRecord = habit.history?.find((h: any) => h.date === todayStr)
              const isCompletedToday = todayRecord?.completed ?? false

              return (
                <Surface
                  key={habit.id}
                  variant="secondary"
                  className={`rounded-xl p-4 border border-transparent ${isCompletedToday ? 'bg-success/10 border-success/30' : ''}`}
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-1">
                      <Text className="font-semibold text-lg text-foreground">
                        {habit.name}
                      </Text>
                      {habit.description && (
                        <Text className="text-muted text-sm mt-1">{habit.description}</Text>
                      )}
                    </View>
                    <Button
                      isIconOnly
                      variant="ghost"
                      onPress={() => handleDeleteHabit(habit.id)}
                      size="sm"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={dangerColor}
                      />
                    </Button>
                  </View>

                  <View className="flex-row justify-between items-center mt-2 border-t border-muted/20 pt-4">
                    <Text className="text-sm font-medium text-muted">
                      Today's Goal
                    </Text>
                    
                    <Pressable
                      onPress={() => handleToggleToday(habit)}
                      className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${isCompletedToday ? 'bg-success' : 'bg-muted/20'}`}
                    >
                      <Ionicons
                        name={isCompletedToday ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={isCompletedToday ? '#fff' : foregroundColor}
                      />
                      <Text className={`font-semibold ${isCompletedToday ? 'text-white' : 'text-foreground'}`}>
                        {isCompletedToday ? 'Completed' : 'Mark Done'}
                      </Text>
                    </Pressable>
                  </View>
                </Surface>
              )
            })}
          </View>
        )}
      </ScrollView>
    </Container>
  )
}
