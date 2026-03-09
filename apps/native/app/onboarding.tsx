import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Pressable, SafeAreaView, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'

import { HabitBarChart } from '@/components/habit-bar-chart'
import { SolanaSignInButton } from '@/components/solana-sign-in-button'

export default function Onboarding() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <View className="flex-1 px-6 justify-between py-10">
        
        {/* Logo Section */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          className="items-center"
        >
          <Image 
            source={require('../assets/logo.png')} 
            style={{ width: 80, height: 80, borderRadius: 20 }}
            className="mb-6 shadow-xl" 
            resizeMode="contain"
          />
          
          <Text className="text-[#3b82f6] font-semibold text-lg mb-2">
            Welcome to HabitGo!
          </Text>
          <Text className="text-white font-bold text-3xl text-center leading-tight mb-4 px-2">
            Tiny changes,{"\n"}remarkable results
          </Text>
          <Text className="text-gray-400 text-center text-base leading-5 px-1">
            Let's start building a happier, healthier you,{"\n"}one small step at a time.
          </Text>
        </Animated.View>

        {/* Visual Element Section */}
        <View className="flex-1 justify-center items-center">
            <HabitBarChart />
        </View>

        {/* Action Section */}
        <Animated.View 
          entering={FadeInUp.delay(500)}
          className="items-center w-full"
        >
          <View className="w-full mb-2">
            <SolanaSignInButton label="Connect Wallet" />
          </View>

          <Pressable onPress={() => router.replace('/')} className="pb-8">
             <Text className="text-gray-500 text-base">
               Connect Wallet to get started <Text className="text-gray-400 font-medium"></Text>
             </Text>
          </Pressable>
        </Animated.View>

      </View>
    </SafeAreaView>
  )
}
