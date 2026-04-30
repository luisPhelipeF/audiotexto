# Audiotexto

Aplicativo de transcricao de audio para texto, pensado para ajudar professoras e professores a registrar aulas inteiras ou notas de voz curtas de forma organizada.

Audiotexto foi criado com uma meta bem pratica: transformar gravacoes em texto util, com um fluxo simples, rapido e pronto para consulta futura no Google Drive e no Google Docs.

## Visao Geral

O app permite:

- gravar audio no celular
- importar arquivos de audio
- transcrever com Deepgram
- organizar transcricoes por data e sequencia
- entrar com Google
- exportar para Google Docs
- guardar os documentos em uma pasta dedicada no Google Drive

## Para Quem Foi Feito

O caso de uso principal e uma professora registrar suas aulas em texto sem depender de um processo manual cansativo.

Na pratica, isso atende bem cenarios como:

- aula completa gravada em audio
- observacoes faladas ao longo do dia
- notas de voz rapidas para transformar em material consultavel depois

## Como o Fluxo Funciona

1. A pessoa grava ou importa um audio.
2. O app envia esse audio para transcricao.
3. O texto volta para o app e fica salvo localmente.
4. Se a pessoa estiver autenticada com Google, a transcricao tambem pode ser exportada para Google Docs.
5. Os documentos ficam organizados dentro do Google Drive do usuario.

## Filosofia do Projeto

O objetivo nao e ser um app cheio de enfeites. O objetivo e ser funcional e eficiente.

Ele foi pensado para trabalhar com conteudo real, incluindo aulas longas, e nao apenas com demos curtas. Ainda assim, existe uma observacao honesta importante: o tempo de transcricao e os limites praticos dependem de servicos externos, qualidade da internet, tamanho do arquivo e capacidade do dispositivo.

## Stack

- Expo
- React Native
- TypeScript
- Firebase Auth / Firestore
- Google Sign-In
- Deepgram
- Google Docs API

## Rodando Localmente

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

## Variaveis de Ambiente

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

## Releases

O passo a passo de novas versoes esta em [RELEASING.md](./RELEASING.md).

Esse guia cobre:

- checklist antes do release
- aumento de versao
- geracao de APK
- publicacao de tag e release no GitHub

## Seguranca

- `.env` nao deve ser versionado
- `google-services.json` nao deve ser versionado
- chaves privadas, tokens e keystores nao devem ser versionados

Existe um checklist de publicacao em [PUBLIC_REPO_CHECKLIST.md](./PUBLIC_REPO_CHECKLIST.md).

## Limites Praticos

Audiotexto foi desenhado para uso real com audios longos, inclusive aulas inteiras. Mas nao existe “sem limite” de forma absoluta, porque o app depende de APIs e infraestrutura externas.

Na pratica, o que mais influencia e:

- tamanho do audio
- velocidade de upload
- estabilidade da internet
- tempo de resposta do Deepgram
- configuracao do login Google e do Firebase

## Licenca

Este projeto esta licenciado sob a licenca MIT. Veja [LICENSE](./LICENSE).
