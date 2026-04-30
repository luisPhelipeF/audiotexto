import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { Mic, Square, FileAudio, Pause, Play, FileText } from 'lucide-react-native';
import { transcribeAudioWithDeepgram } from '../services/deepgramService';
import { getAudioList, saveAudio, updateAudioTranscript, AudioItem } from '../services/storageService';

type RecordingState = 'idle' | 'recording' | 'paused';

export default function HomeScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioList, setAudioList] = useState<AudioItem[]>([]);
  const [transcribingId, setTranscribingId] = useState<string | null>(null);

  useEffect(() => {
    loadAudios();
  }, []);

  async function loadAudios() {
    const list = await getAudioList();
    setAudioList(list);
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
      const transcript = await transcribeAudioWithDeepgram(item.uri);
      await updateAudioTranscript(item.id, transcript);
      await loadAudios();
      Alert.alert('Sucesso', 'Transcrição concluída!');
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
            <Mic color="white" size={32} />
            <Text style={styles.actionText}>Gravar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={pickAudioFile}>
            <FileAudio color="#4A90E2" size={32} />
            <Text style={[styles.actionText, styles.secondaryText]}>Importar</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        {recordingState === 'recording' ? (
          <TouchableOpacity style={[styles.actionButton, styles.pauseButton]} onPress={pauseRecording}>
            <Pause color="white" size={32} />
            <Text style={styles.actionText}>Pausar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={startRecording}>
            <Play color="white" size={32} />
            <Text style={styles.actionText}>Continuar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionButton, styles.stopButton]} onPress={stopRecording}>
          <Square color="white" size={32} />
          <Text style={styles.actionText}>Parar</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Audiotexto</Text>
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
        <Text style={styles.listTitle}>Meus Áudios</Text>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {audioList.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum áudio salvo ainda.</Text>
          ) : (
            audioList.map((item) => (
              <View key={item.id} style={styles.audioCard}>
                <View style={styles.audioHeader}>
                  <Text style={styles.audioName}>{item.name}</Text>
                  
                  {transcribingId === item.id ? (
                    <ActivityIndicator size="small" color="#4A90E2" />
                  ) : !item.transcript && (
                    <TouchableOpacity 
                      style={styles.transcribeBtn} 
                      onPress={() => handleTranscribe(item)}
                      disabled={!!transcribingId}
                    >
                      <Text style={styles.transcribeBtnText}>Transcrever</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {item.transcript ? (
                  <View style={styles.transcriptBox}>
                    <FileText color="#718096" size={16} />
                    <Text style={styles.transcriptText} numberOfLines={3}>
                      {item.transcript}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 24,
  },
  header: {
    marginTop: 48,
    marginBottom: 24,
    alignItems: 'center',
    height: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53E3E',
    marginRight: 8,
  },
  recordingText: {
    color: '#E53E3E',
    fontWeight: '600',
  },
  pausedText: {
    color: '#D69E2E',
    fontWeight: '600',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  actionButton: {
    width: 110,
    height: 110,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    shadowColor: '#4A90E2',
  },
  secondaryButton: {
    backgroundColor: 'white',
    shadowColor: '#CBD5E0',
  },
  pauseButton: {
    backgroundColor: '#D69E2E',
    shadowColor: '#D69E2E',
  },
  stopButton: {
    backgroundColor: '#E53E3E',
    shadowColor: '#E53E3E',
  },
  actionText: {
    color: 'white',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#4A90E2',
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  emptyText: {
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  audioCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  audioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  transcribeBtn: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  transcribeBtnText: {
    color: '#4A90E2',
    fontWeight: '600',
    fontSize: 14,
  },
  transcriptBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 8,
  },
  transcriptText: {
    flex: 1,
    color: '#4A5568',
    fontSize: 14,
    lineHeight: 20,
  },
});
