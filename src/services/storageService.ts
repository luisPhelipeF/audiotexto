import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncAudioToCloud } from './cloudStorageService';

export interface AudioItem {
  id: string;
  name: string; // Formato: X-DD-MM-AAAA
  uri: string;
  transcript?: string;
  createdAt: number;
}

const STORAGE_KEY = '@audiotexto_files';
const COUNTER_KEY = '@audiotexto_counter';

export async function getNextAudioName(): Promise<string> {
  try {
    const counterStr = await AsyncStorage.getItem(COUNTER_KEY);
    let counter = counterStr ? parseInt(counterStr, 10) : 1;
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
    const year = now.getFullYear();

    const name = `${counter}-${day}-${month}-${year}`;
    
    // Incrementa para o próximo uso
    await AsyncStorage.setItem(COUNTER_KEY, String(counter + 1));
    
    return name;
  } catch (error) {
    console.error('Erro ao gerar nome do áudio:', error);
    return `Audio-${Date.now()}`;
  }
}

export async function getAudioList(): Promise<AudioItem[]> {
  try {
    const dataStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (!dataStr) return [];
    return JSON.parse(dataStr);
  } catch (error) {
    console.error('Erro ao carregar lista de áudios:', error);
    return [];
  }
}

export async function saveAudio(uri: string): Promise<AudioItem> {
  const name = await getNextAudioName();
  const newItem: AudioItem = {
    id: Date.now().toString(),
    name,
    uri,
    createdAt: Date.now(),
  };

  const currentList = await getAudioList();
  const updatedList = [newItem, ...currentList];
  
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  
  // Sincroniza com a nuvem
  await syncAudioToCloud(newItem);
  
  return newItem;
}

export async function updateAudioTranscript(id: string, transcript: string): Promise<void> {
  const currentList = await getAudioList();
  let updatedItem = null;

  const updatedList = currentList.map(item => {
    if (item.id === id) {
      updatedItem = { ...item, transcript };
      return updatedItem;
    }
    return item;
  });

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  // Sincroniza a transcrição com a nuvem
  if (updatedItem) {
    await syncAudioToCloud(updatedItem);
  }
}
