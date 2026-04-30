# Audiotexto

Audiotexto e um app feito para ajudar professoras e professores a transformar aulas e notas de audio em texto organizado.

O foco do projeto e ser simples de usar, funcional no dia a dia e util tanto para aulas inteiras quanto para pequenos registros de voz.

## O que o app faz

- grava audio no celular
- importa arquivos de audio
- transcreve usando Deepgram
- organiza as transcricoes por data e sequencia
- permite login com Google
- exporta transcricoes para Google Docs
- salva os documentos de forma organizada no Google Drive

## Objetivo do projeto

O app foi pensado para uma professora poder registrar suas aulas em formato de texto com o minimo de atrito possivel.

Em vez de ficar presa a notas soltas, a ideia e ter um fluxo pratico para:

- gravar aulas completas
- registrar notas de voz curtas
- transformar tudo em texto
- guardar isso em um lugar facil de consultar depois

## Stack

- Expo
- React Native
- TypeScript
- Firebase Auth / Firestore
- Google Sign-In
- Deepgram
- Google Docs API

## Como rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Crie seu arquivo local de ambiente:

```bash
cp .env.example .env
```

3. Preencha as variaveis do `.env`.

4. Rode o projeto:

```bash
npm start
```

## Variaveis de ambiente

Use o arquivo [.env.example](./.env.example) como modelo.

As credenciais reais nao entram no GitHub.

## Android e iOS

As pastas nativas `android/` e `ios/` estao ignoradas neste repositorio.

Isso significa que:

- elas nao sao enviadas para o GitHub
- o repositorio fica mais limpo para um fluxo Expo
- quando precisar, elas podem ser regeneradas localmente

Exemplo:

```bash
npx expo prebuild
```

Para Android, existe um guia rapido em [ANDROID.md](./ANDROID.md).

Para gerar build Android com login Google/Firebase nativo, mantenha um `google-services.json` local na raiz do projeto. Esse arquivo nao faz parte do repositorio publico.

## Seguranca

- `.env` nao deve ser versionado
- `google-services.json` nao deve ser versionado
- chaves privadas, tokens e keystores nao devem ser versionados

Existe um checklist de publicacao em [PUBLIC_REPO_CHECKLIST.md](./PUBLIC_REPO_CHECKLIST.md).

## Observacao honesta

O app foi desenhado para ser util em transcricoes longas, como aulas inteiras, mas o tempo final ainda depende do tamanho do audio, da internet e dos servicos externos usados na transcricao.
