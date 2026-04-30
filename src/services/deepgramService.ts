import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export async function transcribeAudioWithDeepgram(audioUri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY;
  
  if (!apiKey || apiKey === 'sua_chave_aqui') {
    throw new Error('Chave da API do Deepgram não configurada no arquivo .env');
  }

  try {
    let data;

    if (Platform.OS === 'web') {
      // Lógica específica para Web
      const audioData = await fetch(audioUri);
      const blob = await audioData.blob();
      
      const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=pt-BR&smart_format=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/webm', // Expo AV na web grava em WebM
        },
        body: blob,
      });

      if (!response.ok) {
        throw new Error(`Erro na API do Deepgram: ${response.status}`);
      }
      data = await response.json();
    } else {
      // Lógica robusta para Celular
      const response = await FileSystem.uploadAsync(
        'https://api.deepgram.com/v1/listen?model=nova-2&language=pt-BR&smart_format=true',
        audioUri,
        {
          headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'audio/m4a',
          },
          httpMethod: 'POST',
          uploadType: 0, // 0 = BINARY_CONTENT
        }
      );
      
      if (response.status !== 200) {
        throw new Error(`Erro na API do Deepgram: ${response.status}`);
      }
      data = JSON.parse(response.body);
    }
    
    // O retorno da API do Deepgram tem essa estrutura
    const transcript = data.results?.channels[0]?.alternatives[0]?.transcript;

    return transcript || 'Nenhuma transcrição encontrada.';
  } catch (error) {
    console.error('Erro na transcrição:', error);
    throw error;
  }
}
