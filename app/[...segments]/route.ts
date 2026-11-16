import admin from '../../public/admin/index.html?raw';
import slots from '../../public/slots/index.html?raw';
import bonus from '../../public/bonus-buy/index.html?raw';
import live from '../../public/cassino-ao-vivo/index.html?raw';
import blackjack from '../../public/blackjack/index.html?raw';
import baccarat from '../../public/baccarat/index.html?raw';
import promotions from '../../public/promocoes/index.html?raw';
const pages:Record<string,string>={'/slots':slots,'/bonus-buy':bonus,'/cassino-ao-vivo':live,'/blackjack':blackjack,'/baccarat':baccarat,'/promocoes':promotions};
async function execute(request:Request){const url=new URL(request.url),path=url.pathname;
 if(request.method==='GET' && /^\/admin\/?$/.test(path))return new Response(admin,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
 if(request.method==='GET'&&pages[path.replace(/\/$/,'')])return new Response(pages[path.replace(/\/$/,'')],{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
 if(path.startsWith('/api/public/demo/')||/^\/(web-api|game-api|local-api)\//.test(path))return Response.json({message:'Disponível após configurar o provedor de jogos.'},{status:404});
 if(request.method==='GET')return new Response('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Página não encontrada | BLITZ.BET</title><meta name="robots" content="noindex,follow"></head><body style="background:#17111f;color:#fff;font-family:Arial;padding:40px"><main><h1>Página não encontrada</h1><p>O endereço pode ter mudado.</p><a href="/" style="color:#ffb13b">Voltar à BLITZ.BET</a></main></body></html>',{status:404,headers:{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, follow'}});
 return Response.json({message:'Rota não encontrada.'},{status:404,headers:{'X-Robots-Tag':'noindex, nofollow'}});
}
export const GET=execute;export const POST=execute;export const OPTIONS=execute;
