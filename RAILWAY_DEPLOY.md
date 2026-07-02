# Deploy na Railway

Railway e a proxima opcao sem cartao. Ela oferece trial gratis com creditos por 30 dias; depois disso, para continuar, normalmente precisa do plano pago mais barato.

## Arquivo certo

Use o projeto completo do GameWallPro. Para backup/local, tambem sera gerado:

```text
gamewallpro-railway.zip
```

Na Railway, o jeito mais facil e subir por GitHub ou Railway CLI. Ela nao e um painel de upload de ZIP igual hosts de bot.

## Variaveis

Configure no painel da Railway:

```env
DISCORD_TOKEN=seu_token
CLIENT_ID=id_do_bot
GUILD_ID=id_do_servidor_de_teste
DATA_DIR=./data
DEFAULT_AI_PROVIDER=openai
OPENAI_API_KEY=sua_chave
NIXPACKS_NODE_VERSION=24
```

Opcional:

```env
PORT=3000
AI_REPLY_ON_MENTION=true
```

## Config ja incluida

O projeto inclui:

```text
railway.json
.nvmrc
```

O start command esta como:

```bash
pnpm run start:with-deploy
```

Isso registra os comandos slash e inicia o bot.

## Passo rapido pelo GitHub

1. Crie um repositorio no GitHub.
2. Envie os arquivos do projeto para ele.
3. Entre em https://railway.com/.
4. New Project -> Deploy from GitHub repo.
5. Escolha o repositorio.
6. Adicione as variaveis acima.
7. Abra os logs e confira se apareceu `Online como ...`.

## Passo rapido pela CLI

Se preferir pelo terminal:

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

Depois configure as variaveis pelo painel.

## Observacao importante

Railway nao e gratis para sempre. A vantagem e que nao pede cartao no trial e e mais estavel que host gratuito lotado.
