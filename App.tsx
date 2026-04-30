import React, { useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Alert } from 'react-native';
import { Mic, FileText, User } from 'lucide-react-native';

import LoginScreen from './src/screens/LoginScreen';
import RecordingsScreen from './src/screens/RecordingsScreen';
import TranscriptionsScreen from './src/screens/TranscriptionsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Gravações') {
            return <Mic color={color} size={size + 4} />;
          } else if (route.name === 'Transcrições') {
            return <FileText color={color} size={size + 4} />;
          }
        },
        tabBarActiveTintColor: '#63B3ED', // Azul claro para destaque no dark
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarStyle: {
          backgroundColor: '#1A202C',
          borderTopColor: '#2D3748',
        },
        headerStyle: {
          backgroundColor: '#1A202C',
        },
        headerTintColor: '#E2E8F0',
        headerLeft: () => (
          <TouchableOpacity 
            style={{ marginLeft: 16 }} 
            onPress={() => {
              Alert.alert('Perfil', 'Deseja sair da sua conta?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', onPress: onLogout, style: 'destructive' }
              ]);
            }}
          >
            <User color="#4A90E2" size={24} />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Gravações" component={RecordingsScreen} />
      <Tab.Screen name="Transcrições" component={TranscriptionsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLoginSuccess={() => setIsAuthenticated(true)} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main">
            {(props) => <MainTabs {...props} onLogout={() => setIsAuthenticated(false)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
