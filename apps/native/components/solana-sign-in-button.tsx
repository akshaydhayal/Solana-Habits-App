import { Ionicons } from '@expo/vector-icons'
import { Button, Spinner, useThemeColor } from 'heroui-native'
import { Text, View } from 'react-native'
import { useSolanaSignIn } from '@/hooks/use-solana-sign-in'

export function SolanaSignInButton({ label = 'Connect Wallet' }: { label?: string }) {
  const { handleSignIn, isLoading } = useSolanaSignIn()

  return (
    <Button
      onPress={handleSignIn}
      isDisabled={isLoading}
      className="w-full bg-[#3b82f6] rounded-xl h-12 items-center justify-center active:opacity-80"
    >
      {isLoading ? (
        <Spinner size="sm" color="white" />
      ) : (
        <View className="flex-row items-center gap-2">
          <Ionicons name="wallet-outline" size={22} color="white" />
          <Text className="font-bold text-white text-lg">
            {label}
          </Text>
        </View>
      )}
    </Button>
  )
}
