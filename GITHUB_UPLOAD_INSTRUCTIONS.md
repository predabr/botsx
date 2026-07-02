# Como subir no GitHub

Use a pasta `github-upload` que eu preparei.

## Pelo site do GitHub

1. Crie um repositorio novo no GitHub.
2. Clique em `uploading an existing file`.
3. Abra a pasta `github-upload`.
4. Selecione todos os arquivos e pastas de dentro dela.
5. Arraste para a tela do GitHub.
6. Clique em `Commit changes`.

Nao suba:

- `node_modules`
- `.env`
- arquivos `.zip`
- `.pnpm-store`
- backups

## Depois na Railway

Escolha `GitHub Repo` e selecione esse repositorio.

Variaveis obrigatorias na Railway:

```env
DISCORD_TOKEN=seu_token
CLIENT_ID=id_do_bot
GUILD_ID=id_do_servidor
OPENAI_API_KEY=sua_chave
NIXPACKS_NODE_VERSION=24
```

Start command:

```bash
pnpm run start:with-deploy
```
