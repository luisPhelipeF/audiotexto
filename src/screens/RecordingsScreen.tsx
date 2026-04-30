import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { Mic, Square, FileAudio, Pause, Play } from 'lucide-react-native';
import { transcribeAudioWithDeepgram } from '../services/deepgramService';
import { getAudioList, saveAudio, updateAudioTranscript, AudioItem } from '../services/storageService';
import { useIsFocused } from '@react-navigation/native';

type RecordingState = 'idle' | 'recording' | 'paused';

export default function RecordingsScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioList, setAudioList] = useState<AudioItem[]>([]);
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadAudios();
    }
  }, [isFocused]);

  async function loadAudios() {
    const list = await getAudioList();
    // Filtra apenas áudios que NÃO possuem transcrição
    setAudioList(list.filter(item => !item.transcript));
  }

  async function startRecording() {
    try {
      if (recordingState === 'paused' && recording) {
        await recording.startAsync();
        setRecordingState('recording');
        return;
      }

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setRecordingState('recording');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  }

  async function pauseRecording() {
    if (!recording) return;
    try {
      await recording.pauseAsync();
      setRecordingState('paused');
    } catch (error) {
      console.error('Failed to pause', error);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingState('idle');

      if (uri) {
        await saveAudio(uri);
        await loadAudios();
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Erro', 'Falha ao salvar a gravação.');
    }
  }

  async function pickAudioFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await saveAudio(result.assets[0].uri);
        await loadAudios();
      }
    } catch (err) {
      console.error('Error picking file', err);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  }

  async function handleTranscribe(item: AudioItem) {
    if (transcribingId) return;
    
    setTranscribingId(item.id);
    try {
      const rawTranscript = await transcribeAudioWithDeepgram(item.uri);
      
      // Gera o texto automático "aula X do dia DD de Mês de AAAA"
      const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const [index, day, month, year] = item.name.split('-');
      const monthName = monthNames[parseInt(month, 10) - 1] || "Mês";
      const headerText = `Aula ${index} do dia ${day} de ${monthName} de ${year}\n\n`;
      
      const finalTranscript = headerText + rawTranscript;

      await updateAudioTranscript(item.id, finalTranscript);
      await loadAudios(); // Isso fará o item sumir desta lista e ir para a outra aba
      Alert.alert('Sucesso', 'Transcrição concluída! O arquivo foi movido para a aba de Transcrições.');
    } catch (error: any) {
      Alert.alert('Erro na Transcrição', error.message || 'Falha ao processar o áudio com Deepgram.');
    } finally {
      setTranscribingId(null);
    }
  }

  const renderRecordingControls = () => {
    if (recordingState === 'idle') {
      return (
        <>
          <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={startRecording}>
            <Mic color="white" size={44} />
            <Text style={styles.actionText}>Gravar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={pickAudioFile}>
            <FileAudio color="#63B3ED" size={44} />
            <Text style={[styles.actionText, styles.secondaryText]}>Importar</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        {recordingState === 'recording' ? (
          <TouchableOpacity style={[styles.actionButton, styles.pauseButton]} onPress={pauseRecording}>
            <Pause color="white" size={44} />
            <Text style={styles.actionText}>Pausar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={startRecording}>
            <Play color="white" size={44} />
            <Text style={styles.actionText}>Continuar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionButton, styles.stopButton]} onPress={stopRecording}>
          <Square color="white" size={44} />
          <Text style={styles.actionText}>Parar</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {recordingState === 'recording' && (
          <View style={styles.recordingIndicator}>
            <View style={styles.redDot} />
            <Text style={styles.recordingText}>Gravando...</Text>
          </View>
        )}
        {recordingState === 'paused' && (
          <Text style={styles.pausedText}>Gravação Pausada</Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        {renderRecordingControls()}
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Áudios Pendentes</Text>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {audioList.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum áudio pendente.</Text>
          ) : (
            audioList.map((item) => (
              <View key={item.id} style={styles.audioCard}>
                <Text style={styles.audioName}>{item.name}</Text>
                
                {transcribingId === item.id ? (
                  <ActivityIndicator size="small" color="#4A90E2" />
                ) : (
                  <TouchableOpacity 
                    style={styles.transcribeBtn} 
                    onPress={() => handleTranscribe(item)}
                    disabled={!!transcribingId}
                  >
                    <Text style={styles.transcribeBtnText}>Transcrever</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 24 },
  header: { height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center' },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FC8181', marginRight: 8 },
  recordingText: { color: '#FC8181', fontWeight: '600' },
  pausedText: { color: '#F6E05E', fontWeight: '600' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 32 },
  actionButton: { width: 135, height: 135, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  primaryButton: { backgroundColor: '#4A90E2', shadowColor: '#4A90E2' },
  secondaryButton: { backgroundColor: '#2D3748', shadowColor: '#000' },
  pauseButton: { backgroundColor: '#D69E2E', shadowColor: '#D69E2E' },
  stopButton: { backgroundColor: '#E53E3E', shadowColor: '#E53E3E' },
  actionText: { color: 'white', marginTop: 8, fontSize: 16, fontWeight: '600' },
  secondaryText: { color: '#63B3ED' },
  listContainer: { flex: 1, backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  listTitle: { fontSize: 18, fontWeight: '600', color: '#E2E8F0', marginBottom: 12 },
  scrollView: { flex: 1 },
  emptyText: { color: '#A0AEC0', textAlign: 'center', marginTop: 20, fontSize: 16 },
  audioCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2D3748', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#4A5568' },
  audioName: { fontSize: 16, fontWeight: '600', color: '#E2E8F0' },
  transcribeBtn: { backgroundColor: '#4A5568', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  transcribeBtnText: { color: '#63B3ED', fontWeight: '600', fontSize: 14 },
});
