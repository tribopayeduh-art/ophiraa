# BLITZ.BET — jogos no mesmo domínio

A plataforma está em `public/`, com os clientes dos 11 jogos enviados e os recursos compartilhados. O servidor Vinext atende as páginas e as rotas de demonstração no mesmo domínio.

- `GET /api/public/demo/games`: catálogo de demonstração.
- `POST /api/public/demo/launch`: aceita apenas `game_id`, retorna URL local.
- `/web-api/`, `/game-api/` e `/local-api/`: motor de créditos fictícios do pacote enviado.
- Não existem rotas de carteira real, administração ou liquidação financeira no servidor unificado.
- `public/pg-games.js` usa `location.origin`, sem dependência da publicação separada pg-api-eduh.

Validação: build concluído; 11 rotas de lançamento verificadas; catálogo, iframe no mesmo domínio e retorno ao catálogo conferidos no navegador.

Limitação conhecida: o cliente Fortune Tiger ainda falha em 32% com G1006. A unificação da hospedagem não resolveu a falha interna do cliente. Não foi validada uma rodada jogável. A interface mantém o estado “Em validação”.

Build: `node /home/agent/.codex/plugins/cache/openai-curated-remote/sites/1.1.4/scripts/build-site.mjs` no ambiente Sites. Alterações de UI agora são feitas em `public/`, não no antigo `dist/` estático.
