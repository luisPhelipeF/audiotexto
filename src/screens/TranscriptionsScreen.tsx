import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Share, Alert, ActivityIndicator } from 'react-native';
import { FileText, Share2, CloudUpload } from 'lucide-react-native';
import { getAudioList, AudioItem } from '../services/storageService';
import { createGoogleDoc } from '../services/googleDocsService';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TranscriptionsScreen() {
  const [audioList, setAudioList] = useState<AudioItem[]>([]);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadTranscriptions();
    }
  }, [isFocused]);

  async function loadTranscriptions() {
    const list = await getAudioList();
    setAudioList(list.filter(item => !!item.transcript));
  }

  const handleShare = async (item: AudioItem) => {
    try {
      await Share.share({
        message: `Transcrição de ${item.name}:\n\n${item.transcript}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportDocs = async (item: AudioItem) => {
    try {
      setExportingId(item.id);
      const token = await AsyncStorage.getItem('@google_access_token');
      
      if (!token) {
        Alert.alert('Erro', 'Você precisa fazer o login real com o Google para ter permissão de criar documentos no Drive.');
        return;
      }

      if (!item.transcript) return;

      const docUrl = await createGoogleDoc(token, `Transcrição: ${item.name}`, item.transcript);
      Alert.alert('Sucesso!', `Documento criado com sucesso no seu Google Drive!\n\nLink: ${docUrl}`);
    } catch (error: any) {
      console.error('Export Error:', error);
      Alert.alert('Erro no Google', error.message || 'Falha ao salvar no Google Docs. Tente fazer o login novamente.');
    } finally {
      setExportingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Transcrições</Text>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {audioList.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transcrição concluída ainda.</Text>
        ) : (
          audioList.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.audioName}>{item.name}</Text>
                
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(item)}>
                    <Share2 color="#4A90E2" size={20} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.docsBtn]} 
                    onPress={() => handleExportDocs(item)}
                    disabled={!!exportingId}
                  >
                    {exportingId === item.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <CloudUpload color="#fff" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.transcriptBox}>
                <FileText color="#718096" size={16} />
                <Text style={styles.transcriptText}>
                  {item.transcript}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#E2E8F0', marginBottom: 20, marginTop: 10 },
  scrollView: { flex: 1 },
  emptyText: { color: '#A0AEC0', textAlign: 'center', marginTop: 40, fontSize: 16 },
  card: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  audioName: { fontSize: 16, fontWeight: '600', color: '#E2E8F0', flex: 1 },
  headerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: '#2D3748' },
  docsBtn: { backgroundColor: '#34A853' }, // Cor do Google Docs mantida para identidade visual
  transcriptBox: { flexDirection: 'row', gap: 8, backgroundColor: '#2D3748', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#4A5568' },
  transcriptText: { flex: 1, color: '#E2E8F0', fontSize: 14, lineHeight: 22 },
});
