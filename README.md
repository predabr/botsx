# GameWallPro Discord Bot

Bot modular para Discord com IA, memoria persistente, musica, moderacao, XP, lembretes, utilidades e comandos de diversao.

## Comandos principais

### IA

- `/ask prompt` pergunta rapido para a IA.
- `/ai prompt provider` usa um provedor especifico.
- `/remember text` salva uma memoria sobre voce.
- `/memory` mostra as memorias salvas.
- `/forgetmemory` apaga suas memorias.
- `/resetai` limpa o historico da conversa no canal.
- `/summarize text` resume textos longos.
- `/aiproviders` mostra quais provedores estao configurados.
- `/wiki query` pesquisa na Wikipedia.
- `/research question` pesquisa na Wikipedia e usa IA para responder com fontes.
- `/websearch query` pesquisa web/wiki e responde com fontes.
- `/learnserver` ensina regras/conhecimento do servidor para a IA.
- `/commands` ou `/help` mostra todos os comandos carregados.

### Configuracao

- `/config view` mostra a configuracao do servidor.
- `/config logs` define canal de logs.
- `/config welcome` define boas-vindas.
- `/config autorole` define cargo automatico.
- `/config ai` define canal da IA, canal de regras/wiki e persona.
- `/config freegames` define canal de jogos gratis.
- `/config music` define volume padrao.

### Jogos gratis

- `/freegames now` mostra jogos gratis ativos agora.
- `/freegames watch` ativa aviso automatico em um canal.
- `/freegames status` mostra onde o aviso esta ligado.
- `/freegames off` desativa o aviso automatico.
- O bot filtra DLC/cupom/item por padrao e mostra botoes de link rapido.

### Musica

- `/play song` toca por nome, link do YouTube, playlist ou link direto de audio.
- `/pause`, `/resume`, `/skip`, `/stop`.
- `/queue`, `/now`, `/volume value`, `/repeat`, `/shuffle`, `/leave`.
- `/favorite` salva e toca musicas favoritas.
- `/playlist` cria e toca playlists pessoais.

### Servidor

- `/rank`, `/top` para XP e levels.
- `/remind time text`, `/reminders`, `/cancelreminder id`.

### Moderacao

- `/clear amount`.
- `/slowmode seconds`.
- `/lock`, `/unlock`.
- `/timeout user minutes reason`.
- `/warn user reason`, `/warnings user`.
- `/kick user reason`, `/ban user reason delete_days`.

### Utilidades e diversao

- `/ping`, `/botinfo`, `/invite`, `/say`.
- `/serverinfo`, `/userinfo`, `/avatar`.
- `/roll`, `/coin`, `/poll`.

## Como ligar

1. Instale Node.js 22.12 ou mais novo. Para musica, use Node 24.
2. Rode:

```bash
pnpm install
```

3. Copie `.env.example` para `.env`.
4. Preencha `DISCORD_TOKEN`, `CLIENT_ID` e, para teste rapido, `GUILD_ID`.
5. Preencha pelo menos uma chave de IA, como `OPENAI_API_KEY`, `OPENROUTER_API_KEY` ou `GROQ_API_KEY`.
6. Registre os comandos:

```bash
pnpm run deploy
```

7. Inicie:

```bash
pnpm start
```

Tambem funciona com `npm install`, `npm run deploy` e `npm start`.

## Deploy na Daki

Para Daki, veja o passo a passo em [DAKI_DEPLOY.md](C:/Users/preda/Downloads/gamewallpro/DAKI_DEPLOY.md).

Resumo:

```bash
npm install --omit=dev
npm run deploy
npm start
```

No painel da Daki, use `npm start` como startup command. Crie o `.env` na raiz do servidor e mantenha `DATA_DIR=./data`.
Depois de atualizar comandos, rode `npm run deploy` de novo na Daki.

## Deploy na Railway

Para Railway, veja o passo a passo em [RAILWAY_DEPLOY.md](C:/Users/preda/Downloads/gamewallpro/RAILWAY_DEPLOY.md).

Resumo:

```bash
pnpm run start:with-deploy
```

No painel da Railway, configure `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `OPENAI_API_KEY` e `NIXPACKS_NODE_VERSION=24`.

## Intents no Discord Developer Portal

Ative:

- Server Members Intent.
- Message Content Intent.

O bot tambem usa voice states para musica, mas isso vem do gateway intent normal no codigo.

## Permissoes recomendadas

No invite do bot, use as scopes:

- `bot`
- `applications.commands`

Permissoes:

- Send Messages
- Use Slash Commands
- Manage Messages
- Manage Channels
- Moderate Members
- Kick Members
- Ban Members
- Connect
- Speak
- Read Message History

## IA multi-provedor

O bot usa endpoints compativeis com `/v1/chat/completions`. Da para alternar entre OpenAI, OpenRouter, Groq, Together e modelos locais como Ollama/LM Studio.

A memoria da IA fica em `data/ai-memory.json`. O historico curto de conversa fica em `data/conversations.json`.

Para resposta ao mencionar o bot, ative:

```env
AI_REPLY_ON_MENTION=true
```

Para pesquisa com fontes, use `/wiki` ou `/research`. O `/research` busca paginas na Wikipedia, passa as fontes para a IA e responde com links numerados. Se usar `save:true`, ele salva um resumo na memoria da IA.

Para IA mais avancada no servidor:

```text
/config ai persona:"Responda como suporte oficial do servidor, curto e claro."
/config ai rules_channel:#regras
/learnserver add text:"Aqui no servidor nao pode flood nem divulgar links sem permissao."
```

A IA passa a usar a persona, memorias do usuario, memorias do servidor e mensagens recentes do canal de regras/wiki configurado.

## Jogos gratis

O `/freegames now` consulta APIs publicas de jogos/promocoes gratis. Para avisar automaticamente em um canal:

```text
/freegames watch channel:#jogos-gratis platform:Todas
```

O bot salva essa configuracao em `data/free-games-watchers.json`.

## Musica

Musica usa `@discordjs/voice` e `play-dl`.

O comando mais simples e:

```text
/play song: nome ou link
```

Depois use `/skip`, `/pause`, `/resume`, `/queue`, `/repeat`, `/shuffle`, `/volume`, `/favorite`, `/playlist` e `/leave`.

## Dados persistentes

Arquivos gerados automaticamente em `data/`:

- `ai-memory.json`
- `conversations.json`
- `warnings.json`
- `xp.json`
- `reminders.json`
- `free-games-watchers.json`
- `guild-settings.json`
- `music-library.json`

Eles ficam fora do Git pelo `.gitignore`.

## Estrutura

```text
src/
  commands/
    ai/
    config/
    fun/
    games/
    leveling/
    moderation/
    music/
    research/
    reminders/
    utility/
  events/
  lib/
```

Cada comando exporta `data` e `execute`. Para criar comando novo, coloque um arquivo `.js` em `src/commands/<categoria>/`.
