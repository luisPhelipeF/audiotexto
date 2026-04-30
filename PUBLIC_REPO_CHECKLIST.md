# Checklist Para GitHub Publico

## O que NAO deve entrar no GitHub

- `.env`
- `google-services.json`
- `GoogleService-Info.plist`
- chaves privadas, `.pem`, `.p8`, `.jks`, `.keystore`
- APKs e builds gerados
- qualquer arquivo com token, segredo, senha ou credencial de admin

## O que eu encontrei neste projeto

- Existe um `.env` local com credenciais reais. Nao subir.
- Existe `google-services.json` local. Nao subir.
- Existe `android/app/debug.keystore` local. Nao subir.
- O codigo ja usa variaveis de ambiente, o que e bom para repositorio publico.

## Checklist antes do primeiro push

1. Confirme que `git status --short` nao mostra `.env`.
2. Confirme que `git status --short` nao mostra `google-services.json`.
3. Confirme que voce vai subir `.env.example`, e nao `.env`.
4. Revise o codigo procurando chaves coladas direto em arquivos `.ts`, `.tsx`, `.json` e `.md`.
5. Revise screenshots, PDFs e docs para garantir que nao mostram chaves.
6. Se alguma chave ja foi compartilhada em lugar inseguro, faca a rotacao antes de publicar.
7. Confira regras do Firebase:
   - Firestore/Storage nao devem aceitar acesso aberto sem autenticacao.
   - Authorized domains do Firebase Auth devem estar corretos.
8. Confira o Google Cloud OAuth:
   - clientes Web, Android e iOS devem existir
   - SHA-1 do Android deve estar cadastrado no Firebase/Google
9. Faça um ultimo `git diff --cached` antes do commit.

## Sobre confidencialidade

- `Deepgram API key`: confidencial. Nunca subir.
- `Service account`, private keys e keystores: confidenciais. Nunca subir.
- `google-services.json`: nao e um segredo de servidor, mas contem identificadores do projeto. Se voce quer higiene mais conservadora para repo publico, nao suba.
- `Firebase web config` com `EXPO_PUBLIC_*`: tecnicamente e configuracao cliente, nao segredo de servidor. Mesmo assim, se seu objetivo e manter o repo o mais limpo possivel, deixe fora do GitHub e use `.env.example`.

## Comandos uteis

Ver status:

```bash
git status --short
```

Ver o que sera commitado:

```bash
git diff --cached
```

Buscar suspeitas no codigo:

```bash
rg -n --hidden --glob '!node_modules' --glob '!.git' 'API_KEY|SECRET|TOKEN|AIza|BEGIN PRIVATE KEY'
```
