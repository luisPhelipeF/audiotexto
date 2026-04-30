# Releasing Audiotexto

Este guia serve para gerar novas versoes do app com seguranca, sem subir arquivos sensiveis e sem esquecer passos importantes.

## Antes de Tudo

Confirme estes pontos:

- `.env` existe so localmente
- `google-services.json` existe so localmente
- `.env` e `google-services.json` nao aparecem em `git status --short`
- o app esta abrindo e funcionando no fluxo principal
- login Google, gravacao e exportacao estao testados

Comando rapido:

```bash
git status --short
```

## 1. Atualizar a Versao

Atualize estes arquivos:

- `package.json`
- `app.json`

### Em `package.json`

Atualize:

- `version`

### Em `app.json`

Atualize:

- `expo.version`
- `expo.android.versionCode`

Regras praticas:

- `expo.version`: muda de `1.0.0` para `1.0.1`, `1.1.0`, `2.0.0` e assim por diante
- `expo.android.versionCode`: sempre sobe em numero inteiro, por exemplo `1`, `2`, `3`

## 2. Validar o Projeto

Rode:

```bash
npx tsc --noEmit
```

Se quiser uma checagem extra:

```bash
npx expo-doctor
```

## 3. Regenerar o Nativo se Necessario

Como `android/` e `ios/` nao ficam no GitHub, em uma maquina nova ou depois de limpar o projeto pode ser necessario recriar as pastas nativas:

```bash
npx expo prebuild
```

Se quiser somente Android:

```bash
npx expo prebuild --platform android
```

## 4. Gerar APK Android

Se a pasta `android/` nao existir ainda, rode primeiro o `prebuild`.

Depois:

```bash
npm run build:android:apk
```

O APK final costuma ficar em:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## 5. Testar o APK

Antes de divulgar:

- instale no seu proprio celular
- teste login Google
- teste gravacao
- teste importacao de audio
- teste transcricao
- teste exportacao para Google Docs

Se quiser instalar por cabo:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## 6. Commitar e Criar Tag

Depois de validar:

```bash
git add .
git commit -m "chore: release v1.0.1"
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

Troque `v1.0.1` pela versao real.

## 7. Publicar Release no GitHub

No GitHub:

1. Abra a aba `Releases`
2. Clique em `Draft a new release`
3. Escolha a tag criada
4. Use um titulo como `v1.0.1`
5. Escreva um resumo do que mudou
6. Anexe o `app-release.apk` se quiser distribuir manualmente
7. Publique

## 8. Checklist Curto de Fechamento

- versao atualizada
- `versionCode` incrementado
- TypeScript validado
- APK gerado
- APK testado
- commit feito
- tag criada
- push enviado
- release publicada

## Dica Honesta

Se o foco for distribuicao manual para poucas pessoas, o APK local resolve bem.

Se o foco virar distribuicao recorrente ou mais organizada, vale migrar o processo para:

- EAS Build
- GitHub Releases com changelog por versao
- ou futuramente Play Store, se fizer sentido
