export const mockTranscribeAudio = async (audioUri: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        "Esta é uma transcrição simulada. Como ainda não conectamos uma API real de IA (como Whisper ou Google Speech-to-Text), este texto de exemplo é exibido para o arquivo selecionado ou gravado.\n\nVocê pode editar este texto se quiser testar a interface de edição."
      );
    }, 2500); // Simulando 2.5 segundos de processamento
  });
};
