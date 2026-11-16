# Ophiraa para Google AI Studio

Esta edição contém a interface pública e o painel visual do ZIP original.

| Etapa | Comando ou caminho |
| --- | --- |
| Instalação | `npm ci` |
| Prévia | `npm run dev` |
| Build | `npm run build` |
| Saída do build | `dist` |
| Servir o build | `npm start` |
| Painel | `/admin/` |

Use a raiz deste pacote como raiz do projeto importado. O servidor usa a variável
`PORT` ou a porta 3000. O build copia os arquivos estáticos, incluindo as rotas
por diretório e os recursos da interface.

Login, Firestore, Pix, saques e jogos integrados precisam do backend original.
As chamadas locais a `/api/` retornam HTTP 503 na prévia.
