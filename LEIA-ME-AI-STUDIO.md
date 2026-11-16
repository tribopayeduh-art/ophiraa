# BLITZ.BET · edição para integrações

O ZIP preserva a interface, o painel, o catálogo e as capas. Os clientes locais dos jogos e seus recursos compartilhados foram excluídos. As rotas do motor demonstrativo local não estão ativas nesta edição.

## OKX

O módulo servidor `lib/okx-client.mjs` usa o contrato fornecido. Configure `OKX_HOUSE_TOKEN` e, se o painel OKX for privado, `OKX_SITE_TOKEN` como segredos do servidor. O módulo não é carregado no navegador.

O provedor de jogos precisa oferecer um endpoint de lançamento e um contrato de liquidação. Após liquidar a rodada na carteira, o backend pode chamar `reportSettledRound` com valores em unidades mínimas. Em nova tentativa, reutilize o mesmo roundId e os mesmos valores. `getRtp` consulta configuração e `getCommunications` consulta avisos. O módulo não inicia sessões nem altera a matemática dos jogos.

## Google AI Studio

Extraia na raiz de um repositório privado. Use a opção de importar do GitHub quando disponível. O código de servidor original usa Vinext, Workers e D1. A execução no AI Studio exige adaptação das funções ligadas à hospedagem original.

## Firebase Firestore

1. Crie ou selecione o banco no projeto Firebase. Copie o ID exato do banco, inclusive quando for `(default)`.
2. No servidor, configure o JSON da conta de serviço em `FIREBASE_SERVICE_ACCOUNT_JSON` e o ID em `FIRESTORE_DATABASE_ID`. A conta precisa de acesso IAM aos documentos do Firestore. Para operação de leitura e escrita, confirme a permissão de escrita no projeto de destino.
3. Para testar no computador com Node.js 22, copie `.env.example` para `.env`. Use `FIREBASE_SERVICE_ACCOUNT_FILE` com o caminho absoluto do JSON guardado fora do projeto. Execute `npm run firebase:check`. O teste só lê e não mostra credenciais nem documentos.
4. Para ativar taxas e funis no servidor, configure `ADMIN_SETTINGS_FIRESTORE=true`. Os documentos são `blitzAdminSettings/withdrawalFees` e `blitzAdminSettings/depositFunnels`. Quando existe D1 e o documento está ausente, a leitura inicial usa D1 e a primeira gravação válida cria o documento no Firestore.
5. Confirme a gravação pelo painel autenticado. O teste de conexão valida leitura. A migração de credenciais dos gateways e a autenticação dos usuários para Firebase Auth não fazem parte desta edição.

No AI Studio, cadastre as credenciais nos segredos do servidor. A importação do ZIP não provisiona banco, IAM, Cloudflare D1 ou autenticação.

## Prévia visual sem instalação de dependências

Execute `npm run preview:studio`. Abra a porta indicada pelo ambiente, ou http://localhost:3000. O painel está em `/admin/`. Use a prévia para editar a interface. Ela serve apenas os arquivos públicos e recusa chamadas de API. As rotas autenticadas, Pix e saques continuam no backend original. A prévia estática não deve ser usada como servidor de produção.

Se o ambiente permitir importar do GitHub, extraia este ZIP na raiz de um repositório privado antes de importar e indique ao Studio o comando `npm run preview:studio`. Para validar seu projeto Firebase separadamente, use `npm run firebase:check` com as variáveis descritas acima.
