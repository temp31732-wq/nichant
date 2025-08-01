import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Smart Investment Calculator',
            headerStyle: {
              backgroundColor: '#667eea',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerShadowVisible: true,
          }} 
        />
      </Stack>
    </>
  );
}