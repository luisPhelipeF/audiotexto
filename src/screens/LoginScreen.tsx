import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import GoogleIcon from '../components/GoogleIcon';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';

const isNativeGoogleConfigured = Platform.OS === 'android'
  ? Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID && process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID)
  : Platform.OS === 'ios'
    ? Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID && process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)
    : false;

// Configuração nativa do Google Sign-In (será ignorada na Web)
if (Platform.OS !== 'web' && isNativeGoogleConfigured) {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file'
    ],
  });
}

WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  // Configuração do Google Sign-In para Web
  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'COLOQUE_A_CHAVE_AQUI',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
    scopes: [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file'
    ],
  });

  // O useEffect abaixo fica apenas para tratar o retorno do popup na Web
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      
      if (access_token) {
        AsyncStorage.setItem('@google_access_token', access_token).catch(console.error);
      }

      if (id_token || access_token) {
        const credential = GoogleAuthProvider.credential(id_token || null, access_token || null);
        signInWithCredential(auth, credential)
          .then(() => {
            onLoginSuccess();
          })
          .catch((error) => {
            console.error('Firebase Auth Error:', error);
            Alert.alert('Aviso Firebase', 'Não foi possível conectar ao banco de dados, mas você pode usar o app offline.');
            onLoginSuccess();
          });
      } else {
        onLoginSuccess();
      }
    } else if (response?.type === 'error') {
      Alert.alert('Erro', 'O login do Google retornou um erro.');
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    if (Platform.OS === 'web') {
      if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
        Alert.alert('Simulado', 'Bypass ativado.', [{ text: 'OK', onPress: onLoginSuccess }]);
        return;
      }
      await promptAsync();
    } else {
      if (!isNativeGoogleConfigured) {
        Alert.alert(
          'Modo offline disponível',
          'O login nativo do Google ainda não foi configurado para este build. Você pode continuar usando o app localmente.',
          [{ text: 'OK', onPress: onLoginSuccess }]
        );
        return;
      }

      try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        
        if (isSuccessResponse(response)) {
          const { idToken } = response.data;
          if (!idToken) throw new Error('Falha ao obter ID Token do Google.');
          
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
          
          const tokens = await GoogleSignin.getTokens();
          if (tokens.accessToken) {
            import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
              AsyncStorage.setItem('@google_access_token', tokens.accessToken);
            });
          }
          
          onLoginSuccess();
        }
      } catch (error: any) {
        console.error('Google Sign-In Native Error:', error);
        Alert.alert(
          'Erro no Login Nativo',
          error.message || 'Falha ao conectar com o Google no celular. Você ainda pode usar o app em modo offline.'
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Audiotexto</Text>
        <Text style={styles.subtitle}>
          Entre com o Google para sincronizar com Firestore e exportar para o Docs. Se preferir, voce tambem pode usar tudo localmente.
        </Text>
        
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <View style={styles.iconContainer}>
            <GoogleIcon size={24} />
          </View>
          <Text style={styles.buttonText}>Entrar com o Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.offlineButton} onPress={onLoginSuccess}>
          <Text style={styles.offlineButtonText}>Continuar offline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 24 },
  content: { alignItems: 'center', backgroundColor: '#1E1E1E', padding: 32, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#E2E8F0', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#A0AEC0', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  googleButton: { flexDirection: 'row', backgroundColor: '#333333', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', width: '100%', justifyContent: 'center', borderWidth: 1, borderColor: '#4A5568' },
  iconContainer: { marginRight: 12 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  offlineButton: { marginTop: 12, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', width: '100%', justifyContent: 'center', borderWidth: 1, borderColor: '#4A90E2' },
  offlineButtonText: { color: '#63B3ED', fontSize: 16, fontWeight: '600' },
});
