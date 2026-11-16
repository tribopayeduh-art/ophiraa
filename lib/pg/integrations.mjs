import crypto from 'node:crypto';
import net from 'node:net';
import {games,tables} from './games.js';
import {handle} from './api.js';
import {PgError,localPgCatalog} from './wallet.mjs';
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const money=x=>{const n=Math.round(Number(x)*100);if(!Number.isSafeInteger(n)||n<0)throw new PgError('Saldo inválido na carteira.',502);return n;};
const publicIP=ip=>{if(net.isIP(ip)!==4)return false;const [a,b]=ip.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19));};
export function callbackURL(value){let u;try{u=new URL(value);}catch{throw new PgError('Informe uma URL HTTPS válida.',400);}if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||u.hash||u.hostname==='localhost'||u.hostname.includes(':')||net.isIP(u.hostname)&&!publicIP(u.hostname))throw new PgError('A carteira exige HTTPS em um endereço público.',400);return u;}
export async function walletCallback(integration,payload){
 const u=callbackURL(integration.callbackUrl);
 const lookup=await fetch('https://dns.google/resolve?name='+encodeURIComponent(u.hostname)+'&type=A',{signal:AbortSignal.timeout(5000)});
 const resolved=await lookup.json();const addresses=(resolved.Answer||[]).filter(x=>x.type===1).map(x=>x.data);
 if(!addresses.length||addresses.some(ip=>!publicIP(ip)))throw new PgError('Endereço da carteira não permitido.',502);
 const body=JSON.stringify(payload),timestamp=String(Date.now());
 const signature=crypto.createHmac('sha256',integration.callbackSecret).update(timestamp+'.'+body).digest('hex');
 const response=await fetch(u.href,{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),headers:{'Content-Type':'application/json','X-PG-Timestamp':timestamp,'X-PG-Signature':signature,'X-PG-Integration':integration.id},body});
 if(response.status!==200)throw new PgError('Carteira HTTP '+response.status,502);
 const raw=await response.text();if(raw.length>65536)throw new PgError('Resposta da carteira muito grande.',502);return JSON.parse(raw);
}
export function createIntegrationService({db,ready=()=>true,callback=walletCallback,now=Date.now}){
 let pg;
 const database=()=>{if(!db||!ready())throw new PgError('Firebase Admin deve estar conectado para gerenciar a API.',503);return db;};
 const load=async id=>{const doc=await database().collection('pg_integrations').doc(id).get();if(!doc.exists||doc.data().revoked)throw new PgError('Integração revogada ou inexistente.',401);return {id,...doc.data()};};
 async function authenticate(token){if(!/^pg_live_[a-f0-9]{64}$/.test(token||''))throw new PgError('Token inválido.',401);const doc=await database().collection('pg_integration_tokens').doc(digest(token)).get();if(!doc.exists)throw new PgError('Token inválido.',401);return load(doc.data().integrationId);}
 async function create(input,actorUid){
  const name=String(input.name||'').trim();if(!name||name.length>100)throw new PgError('Nome obrigatório, até 100 caracteres.',400);
  const mode=input.mode==='callback'?'callback':'firebase';const url=mode==='callback'?callbackURL(input.callbackUrl).href:'';
  const token='pg_live_'+crypto.randomBytes(32).toString('hex'),id=crypto.randomUUID(),secret=crypto.randomBytes(32).toString('hex');
  const record={name,mode,callbackUrl:url,callbackSecret:secret,tokenLast4:token.slice(-4),revoked:false,pendingRounds:0,createdAt:new Date(now()).toISOString(),createdBy:actorUid};
  await database().runTransaction(async tx=>{tx.set(database().collection('pg_integrations').doc(id),record);tx.set(database().collection('pg_integration_tokens').doc(digest(token)),{integrationId:id});});
  return {id,token,callbackSecret:mode==='callback'?secret:undefined,name,mode};
 }
 async function list(){const rows=await database().collection('pg_integrations').limit(100).get();return rows.docs.map(d=>{const {callbackSecret,...safe}=d.data();return {id:d.id,...safe};});}
 async function revoke(id){const ref=database().collection('pg_integrations').doc(id);await database().runTransaction(async tx=>{const doc=await tx.get(ref);if(!doc.exists)throw new PgError('Integração inexistente.',404);if(doc.data().pendingRounds>0)throw new PgError('Confirme as rodadas pendentes antes de revogar a integração.',409);tx.set(ref,{revoked:true,revokedAt:new Date(now()).toISOString()},{merge:true});});}
 async function balance(integration,playerId){
  if(integration.mode==='firebase'){const doc=await database().collection('users').doc(playerId).get();if(!doc.exists)throw new PgError('Jogador não encontrado.',404);const profile=doc.data();if(profile.disabled||profile.blocked||/BLOCKED|BANNED|SUSPENDED|DISABLED|INACTIVE/i.test(String(profile.status||'')))throw new PgError('Conta indisponível.',403);return {balance:money(profile.walletBalance??profile.balance??0)/100,currency:'BRL'};}
  const response=await callback(integration,{action:'balance',player_id:playerId,currency:'BRL'});if(response.status!=='ok')throw new PgError('Carteira recusou a consulta.',502);return {balance:money(response.balance)/100,currency:'BRL'};
 }
 function player(value){const id=String(value||'');if(!/^[a-zA-Z0-9_.@:-]{1,128}$/.test(id))throw new PgError('player_id inválido.',400);return id;}
 async function launch(integration,input){const playerId=player(input.player_id);const game=games.find(g=>String(input.game_code)===`local-pg-${g.id}`);if(!game)throw new PgError('Jogo não encontrado.',404);if(integration.mode==='firebase')return pg.launch(playerId,input.game_code,integration.id);await balance(integration,playerId);return pg.launchExternal(playerId,game.id,integration.id);}
 async function settle(integration,opRef,stateRef,prepared){
  let response;try{response=await callback(integration,{action:'settle',player_id:prepared.playerId,currency:'BRL',round_id:prepared.id,bet:prepared.bet,win:prepared.win,game_code:prepared.gameCode});}catch{throw new PgError('Confirmação da carteira pendente. Reabra o jogo para recuperar; não faça débito manual.',503);}
  if(response.status==='declined'){
   await database().runTransaction(async tx=>{const op=await tx.get(opRef),state=await tx.get(stateRef),ref=database().collection('pg_integrations').doc(integration.id),owner=await tx.get(ref);if(op.data()?.status!=='prepared')return;if(state.data()?.pending===prepared.id)tx.set(stateRef,{pending:null},{merge:true});tx.set(ref,{pendingRounds:Math.max(0,(owner.data()?.pendingRounds||0)-1)},{merge:true});tx.set(opRef,{status:'declined'},{merge:true});});throw new PgError('Carteira recusou a aposta.',409);
  }
  if(response.status!=='ok')throw new PgError('Resposta inválida; confirmação da carteira pendente.',502);
  const before=money(response.balance_before),after=money(response.balance);if(before<Math.round(prepared.bet*100)||before-Math.round(prepared.bet*100)+Math.round(prepared.win*100)!==after)throw new PgError('Resposta da carteira inconsistente; rodada pendente.',502);
  const result=JSON.parse(prepared.responseJson),state=JSON.parse(prepared.nextStateJson);state.balance=after;Object.assign(state.last,{bl:after/100,blb:before/100,blab:(before-Math.round(prepared.bet*100))/100});Object.assign(result.dt.si,{bl:after/100,blb:before/100,blab:state.last.blab});
  return database().runTransaction(async tx=>{const op=await tx.get(opRef),current=await tx.get(stateRef),ref=database().collection('pg_integrations').doc(integration.id),owner=await tx.get(ref);if(op.data()?.status==='committed')return JSON.parse(op.data().responseJson);if(current.data()?.pending!==prepared.id)throw new PgError('Estado da rodada incompatível.',409);tx.set(ref,{pendingRounds:Math.max(0,(owner.data()?.pendingRounds||0)-1)},{merge:true});tx.set(stateRef,{stateJson:JSON.stringify(state),pending:null,updatedAt:new Date(now()).toISOString()},{merge:true});tx.set(opRef,{status:'committed',responseJson:JSON.stringify(result),balanceAfter:after/100,updatedAt:new Date(now()).toISOString()},{merge:true});return result;});
 }
 async function externalRequest({pathname,body={},session,requestId}){
  const integration=await load(session.iid),playerId=player(session.uid),game=games.find(g=>g.id===session.gid);if(integration.mode!=='callback')throw new PgError('Sessão incompatível.',403);
  if(pathname.startsWith('/game-api/')&&pathname.split('/')[2]!==game.slug)throw new PgError('Jogo incompatível.',403);
  const spin=pathname.endsWith('/Spin');if(spin&&!/^[a-zA-Z0-9_.:-]{1,200}$/.test(requestId||''))throw new PgError('Identificador de giro obrigatório.',400);
  const override=await database().collection('game_overrides').doc(`PGSOFT__local-pg-${game.id}`).get();if(override.exists&&override.data().enabled===false)throw new PgError('Jogo indisponível.',403);
  const stateRef=database().collection('pg_external_states').doc(digest(`${integration.id}:${playerId}:${game.id}`));
  if(!spin){const existing=await stateRef.get();if(existing.data()?.pending){const pendingRef=database().collection('pg_external_rounds').doc(existing.data().pending);const op=await pendingRef.get();await settle(integration,pendingRef,stateRef,op.data());}}
  const currentBalance=money((await balance(integration,playerId)).balance);const id=digest(`${integration.id}:${playerId}:${game.id}:${session.sid}:${requestId}`);const opRef=database().collection('pg_external_rounds').doc(id);
  const random=[crypto.randomInt(2**32)/2**32,crypto.randomInt(2**32)/2**32];
  const prepared=await database().runTransaction(async tx=>{
   const old=spin?await tx.get(opRef):null;if(old?.exists)return {operation:old.data()};const doc=await tx.get(stateRef);const ownerRef=database().collection('pg_integrations').doc(integration.id),owner=await tx.get(ownerRef);if(owner.data()?.revoked)throw new PgError('Integração revogada.',401);const saved=doc.data();if(saved?.pending)throw new PgError('Uma rodada está pendente. Reabra o jogo para confirmar a carteira.',409);
   const state=saved?.stateJson?JSON.parse(saved.stateJson):{balance:currentBalance,last:{...structuredClone(tables[game.slug].initial),cs:game.cs[0],ml:1,tb:0,tbb:0,tw:0,np:0,aw:0},pending:null};state.balance=currentBalance;Object.assign(state.last,{bl:currentBalance/100,blb:currentBalance/100,blab:currentBalance/100});
   let nextState,index=0;const result=await(await handle(new Request('https://pg.local'+pathname,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...body,gi:game.id})}),{state,rng:()=>random[index++%2],onState:value=>nextState=value})).json();
   if(!spin||result.err)return {result};const operation={id,integrationId:integration.id,playerId,gameCode:`local-pg-${game.id}`,status:'prepared',bet:result.dt.si.tb,win:result.dt.si.tw,responseJson:JSON.stringify(result),nextStateJson:JSON.stringify(nextState),createdAt:new Date(now()).toISOString()};tx.set(opRef,operation);tx.set(stateRef,{pending:id},{merge:true});tx.set(ownerRef,{pendingRounds:(owner.data()?.pendingRounds||0)+1},{merge:true});return {operation};
  });
  if(prepared.result)return prepared.result;if(prepared.operation.status==='committed')return JSON.parse(prepared.operation.responseJson);if(prepared.operation.status==='declined')throw new PgError('Rodada recusada pela carteira.',409);return settle(integration,opRef,stateRef,prepared.operation);
 }
 function register(app,{requireAdmin,wallet}){
  pg=wallet;const wrap=fn=>async(req,res)=>{try{res.setHeader('Cache-Control','no-store');await fn(req,res);}catch(e){res.status(e.status||503).json({error:'PG_INTEGRATION_ERROR',message:e instanceof PgError?e.message:'Falha na integração. Consulte o terminal.'});if(!(e instanceof PgError))console.error('[pg-integrations]',e.code||e.message);}};
  app.get('/api/admin/pg-integrations',requireAdmin,wrap(async(_req,res)=>res.json({items:await list()})));
  app.post('/api/admin/pg-integrations',requireAdmin,wrap(async(req,res)=>res.json(await create(req.body,req.user.uid))));
  app.delete('/api/admin/pg-integrations/:id',requireAdmin,wrap(async(req,res)=>{await revoke(req.params.id);res.json({success:true});}));
  const auth=wrap(async(req,res)=>{const token=String(req.headers.authorization||'').replace(/^Bearer /,'');req.pgIntegration=await authenticate(token);req.pgNext();});
  const route=fn=>[(req,res,next)=>{req.pgNext=next;auth(req,res);},wrap(fn)];
  app.get('/api/pg/v1/games',...route(async(_req,res)=>res.json({games:localPgCatalog,currency:'BRL'})));
  app.post('/api/pg/v1/balance',...route(async(req,res)=>res.json(await balance(req.pgIntegration,player(req.body.player_id)))));
  app.post('/api/pg/v1/launch',...route(async(req,res)=>{const result=await launch(req.pgIntegration,req.body);res.json({...result,launch_url:new URL(result.launch_url,req.protocol+'://'+req.get('host')).href});}));
 }
 return {bindWallet:wallet=>{pg=wallet;},register,authenticate,create,list,revoke,balance,launch,externalRequest,authorizeIntegration:load};
}
