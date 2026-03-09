import { Text, View, Pressable } from 'react-native'
import { Container } from '@/components/container'
import { authClient } from '@/lib/auth-client'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { queryClient } from '@/utils/orpc'

export default function SettingsScreen() {
  const { disconnect } = useMobileWallet()

  const handleSignOut = async () => {
    await authClient.signOut()
    await disconnect()
    queryClient.invalidateQueries()
  }

  return (
    <Container className="p-6">
      <Text className="text-white text-3xl font-bold mb-8">Settings</Text>
      
      <Pressable 
        onPress={handleSignOut}
        className="bg-red-500/10 p-4 rounded-xl border border-red-500/20"
      >
        <Text className="text-red-500 font-bold text-center text-lg">Disconnect Wallet</Text>
      </Pressable>
    </Container>
  )
}
