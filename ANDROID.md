# Android

## Gerar um APK instalavel

1. Instale as dependencias:

```bash
npm install
```

2. Se a pasta `android/` nao existir na sua maquina, gere o nativo primeiro:

```bash
npx expo prebuild --platform android
```

3. Gere o APK release:

```bash
npm run build:android:apk
```

4. O arquivo final fica em:

```text
android/app/build/outputs/apk/release/app-release.apk
```

5. Para instalar com cabo e `adb`:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Alternativa com EAS Build

Para gerar um APK na nuvem:

```bash
npx eas build -p android --profile preview
```

## Observacoes

- O app agora permite `Continuar offline`, entao ele funciona no Android mesmo antes de concluir a configuracao do Google.
- Para o login nativo do Google funcionar em um APK instalado, o pacote `com.luisphelipe.audiotexto` e o SHA-1 da chave usada na assinatura precisam estar cadastrados no projeto Firebase/Google.
- Como o `release` local usa a `debug.keystore`, o SHA-1 que precisa ser cadastrado e o da chave de debug enquanto voce estiver instalando APKs locais.
