import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  Text,
  View,
  Pressable,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native'

const { width } = Dimensions.get('window')

const UNITS = ['times', 'hours', 'minutes', 'steps', 'litres', 'cups', 'km', 'meter', 'kcal', 'cal']
const FREQUENCIES = ['per day', 'per week', 'per month', 'per year']
const VALUES = Array.from({ length: 100 }, (_, i) => (i + 1).toString())

export default function HabitLimitScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  
  const [val, setVal] = useState(params.goalValue?.toString() || '1')
  const [unit, setUnit] = useState(params.goalUnit?.toString() || 'times')
  const [freq, setFreq] = useState(params.goalFrequency?.toString() || 'per week')

  const handleSave = () => {
    router.navigate({
      pathname: '/habit-config',
      params: { 
        ...params, 
        badHabitType: 'limit',
        goalValue: val,
        goalUnit: unit,
        goalFrequency: freq
      }
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-white/5">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Goal</Text>
        </View>
        <Pressable onPress={handleSave}>
          <Text className="text-[#3b82f6] font-bold text-lg">Save</Text>
        </Pressable>
      </View>

      <View className="px-5 pt-8 gap-4 border-b border-white/5 pb-8">
        <View className="flex-row items-center gap-4">
          <Ionicons name="arrow-down-outline" size={24} color="#71717a" />
          <Text className="text-white text-lg font-medium">No More Than</Text>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Value Picker */}
        <View className="flex-1 border-r border-white/5">
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
             <View className="py-20">
               {VALUES.map((v) => (
                 <Pressable 
                   key={v} 
                   onPress={() => setVal(v)}
                   className="py-4 items-center"
                 >
                   <Text className={`text-xl font-bold ${val === v ? 'text-white' : 'text-[#71717a] opacity-40'}`}>
                     {v}
                   </Text>
                 </Pressable>
               ))}
             </View>
          </ScrollView>
        </View>

        {/* Unit Picker */}
        <View className="flex-1 border-r border-white/5">
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
             <View className="py-20">
               {UNITS.map((u) => (
                 <Pressable 
                   key={u} 
                   onPress={() => setUnit(u)}
                   className="py-4 items-center"
                 >
                   <Text className={`text-xl font-bold ${unit === u ? 'text-white' : 'text-[#71717a] opacity-40'}`}>
                     {u}
                   </Text>
                 </Pressable>
               ))}
             </View>
          </ScrollView>
        </View>

        {/* Frequency Picker */}
        <View className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
             <View className="py-20">
               {FREQUENCIES.map((f) => (
                 <Pressable 
                   key={f} 
                   onPress={() => setFreq(f)}
                   className="py-4 items-center"
                 >
                   <Text className={`text-xl font-bold ${freq === f ? 'text-white' : 'text-[#71717a] opacity-40'}`}>
                     {f}
                   </Text>
                 </Pressable>
               ))}
             </View>
          </ScrollView>
        </View>
      </View>
      
      <View className="absolute bottom-0 left-0 right-0 h-1 bg-[#3b82f6] opacity-20" />
    </SafeAreaView>
  )
}
