import crypto from 'node:crypto';
import {createFirestoreRest} from './firestore-rest.mjs';
import {createIntegrationService} from './pg/integrations.mjs';
import {createPgWallet} from './pg/wallet.mjs';
let runtime;
export function getRuntime(env){
 if(runtime)return runtime;
 if(!env.FIREBASE_SERVICE_ACCOUNT_JSON||!env.FIRESTORE_DATABASE_ID||!env.PG_SESSION_SECRET)throw new Error('Configuração Firebase do servidor incompleta.');
 const db=createFirestoreRest({serviceAccount:env.FIREBASE_SERVICE_ACCOUNT_JSON,databaseId:env.FIRESTORE_DATABASE_ID});
 const service=createIntegrationService({db});const wallet=createPgWallet({db,secret:env.PG_SESSION_SECRET,authorizeIntegration:service.authorizeIntegration,externalRequest:service.externalRequest});service.bindWallet(wallet);
 const demoLaunch=gid=>{const data=Buffer.from(JSON.stringify({uid:'demo',gid,sid:crypto.randomUUID(),wm:'demo',exp:Date.now()+6*60*60*1000})).toString('base64url');const token=data+'.'+crypto.createHmac('sha256',env.PG_SESSION_SECRET).update(data).digest('base64url');return {launch_url:`/${gid}/play.html?gi=${gid}&operator_token=local-demo&t=local-demo&btt=1&l=pt&pg_ticket=${encodeURIComponent(token)}`};};
 runtime={db,service,wallet,demoLaunch};return runtime;
}
