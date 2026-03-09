import { useChat } from '@ai-sdk/react'
import { Ionicons } from '@expo/vector-icons'
import { env } from '@my-app/env/native'
import { DefaultChatTransport } from 'ai'
import { fetch as expoFetch } from 'expo/fetch'
import {
  Button,
  FieldError,
  Input,
  Separator,
  Surface,
  TextField,
  useThemeColor,
} from 'heroui-native'
import { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native'

import { Container } from '@/components/container'

const generateAPIUrl = (relativePath: string) => {
  const serverUrl = env.EXPO_PUBLIC_SERVER_URL
  if (!serverUrl) {
    throw new Error(
      'EXPO_PUBLIC_SERVER_URL environment variable is not defined',
    )
  }
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  return serverUrl.concat(path)
}

export default function AIScreen() {
  const [input, setInput] = useState('')
  const { messages, error, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl('/ai'),
    }),
    onError: (error) => console.error(error, 'AI Chat Error'),
  })
  const scrollViewRef = useRef<ScrollView>(null)
  const foregroundColor = useThemeColor('foreground')
  const mutedColor = useThemeColor('muted')

  useEffect(() => {
    const messagesCount = messages.length
    if (messagesCount === 0) return
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }, [messages.length])

  const onSubmit = () => {
    const value = input.trim()
    if (value) {
      sendMessage({ text: value })
      setInput('')
    }
  }

  if (error) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center px-4">
          <Surface variant="secondary" className="rounded-lg p-4">
            <FieldError isInvalid className="mb-2">
              {error.message}
            </FieldError>
            <Text className="text-center text-muted text-xs">
              Please check your connection and try again.
            </Text>
          </Surface>
        </View>
      </Container>
    )
  }

  return (
    <Container>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 px-4 py-4">
          <View className="mb-6 py-6">
            <Text className="font-bold text-3xl text-white tracking-tight">
              HabitGo AI
            </Text>
            <Text className="mt-2 text-gray-400 text-base">
              Your personal habit coach, powered by AI.
            </Text>
          </View>

          <ScrollView
            ref={scrollViewRef}
            className="mb-4 flex-1"
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <View className="h-20 w-20 rounded-full bg-zinc-800 items-center justify-center mb-6">
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={36}
                    color="#71717a"
                  />
                </View>
                <Text className="font-bold text-white text-xl">
                  Ready to chat?
                </Text>
                <Text className="mt-2 text-gray-500 text-center px-12 leading-5">
                  Ask me about your habits, streaks, or tips for better consistency.
                </Text>
              </View>
            ) : (
              <View className="gap-4">
                {messages.map((message) => (
                  <View
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      message.role === 'user' 
                        ? 'bg-[#3b82f6] self-end' 
                        : 'bg-zinc-800 self-start border border-white/5'
                    }`}
                  >
                    <View className="gap-1">
                      {message.parts.map((part, i) =>
                        part.type === 'text' ? (
                          <Text
                            key={`${message.id}-${i}`}
                            className="text-white text-[15px] leading-6"
                          >
                            {part.text}
                          </Text>
                        ) : null
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View className="flex-row items-center gap-3 bg-[#1a1a1a] p-3 rounded-2xl border border-white/5 mb-2">
            <View className="flex-1 bg-[#262626] rounded-xl px-4 py-1 border border-white/5">
              <TextField>
                <Input
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask anything..."
                  placeholderTextColor="#71717a"
                  className="text-white h-12"
                  onSubmitEditing={onSubmit}
                  autoFocus
                />
              </TextField>
            </View>
            <Button
              isIconOnly
              onPress={onSubmit}
              isDisabled={!input.trim()}
              className={`h-12 w-12 rounded-xl items-center justify-center ${
                !input.trim() ? 'bg-zinc-800' : 'bg-[#3b82f6]'
              }`}
            >
              <Ionicons
                name="arrow-up"
                size={22}
                color="white"
              />
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>
  )
}
