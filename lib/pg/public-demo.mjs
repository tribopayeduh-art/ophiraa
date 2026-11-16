// Public, fictitious-credit demonstrations only. No player identifiers, wallet or integration tokens accepted.
export const demoAllowedOrigins=new Set(['https://blitz-casino-studio.eduhhotmart.chatgpt.site','http://127.0.0.1:4173']);
const demoBuckets=new Map();
export async function publicDemo(request,{catalog,launch}){
 const u=new URL(request.url),origin=request.headers.get('origin');
 const headers={'Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
 if(origin&&demoAllowedOrigins.has(origin))headers['Access-Control-Allow-Origin']=origin;
 const response=(data,status=200)=>Response.json(data,{status,headers});
 if(origin&&!demoAllowedOrigins.has(origin)&&origin!==u.origin)return response({message:'Origem não autorizada.'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(u.pathname==='/api/public/demo/games'&&request.method==='GET')return response({mode:'demo',real_money:false,games:catalog.map(g=>({id:g.code.replace('local-pg-',''),name:g.name}))});
 if(u.pathname!=='/api/public/demo/launch'||request.method!=='POST')return response({message:'Rota não encontrada.'},404);
 const ip=request.headers.get('cf-connecting-ip')||'local',now=Date.now();let b=demoBuckets.get(ip);if(!b||b.until<now){b={count:0,until:now+60000};if(demoBuckets.size>10000)demoBuckets.clear();demoBuckets.set(ip,b)}if(++b.count>30)return response({message:'Aguarde um minuto para abrir outra demonstração.'},429);
 const raw=await request.text();if(raw.length>256)return response({message:'Pedido muito grande.'},413);
 let body;try{body=JSON.parse(raw)}catch{return response({message:'Pedido inválido.'},400)}
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>k!=='game_id'))return response({message:'Apenas game_id é aceito no modo de demonstração.'},400);
 const game=catalog.find(g=>g.code==='local-pg-'+String(body.game_id));if(!game)return response({message:'Jogo não encontrado.'},404);
 try{const result=await launch(String(body.game_id));return response({mode:'demo',real_money:false,launch_url:new URL(result.launch_url,u.origin).href})}catch{return response({message:'A demonstração está temporariamente indisponível.'},503)}
}
