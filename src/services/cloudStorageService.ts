import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { AudioItem } from './storageService';

// Sincroniza um único áudio na nuvem
export async function syncAudioToCloud(audio: AudioItem): Promise<void> {
  const user = auth.currentUser;
  if (!user) return; // Se não tiver usuário logado, salva só local

  try {
    const docRef = doc(db, 'users', user.uid, 'audios', audio.id);
    await setDoc(docRef, audio, { merge: true });
    console.log(`Áudio ${audio.id} sincronizado com a nuvem.`);
  } catch (error) {
    console.error('Erro ao sincronizar com a nuvem:', error);
  }
}

// Busca todos os áudios da nuvem do usuário logado
export async function fetchAudiosFromCloud(): Promise<AudioItem[]> {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'audios'));
    const cloudAudios: AudioItem[] = [];
    
    querySnapshot.forEach((doc) => {
      cloudAudios.push(doc.data() as AudioItem);
    });
    
    // Retorna ordenado do mais novo pro mais antigo
    return cloudAudios.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Erro ao buscar áudios da nuvem:', error);
    return [];
  }
}
