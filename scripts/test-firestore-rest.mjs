import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createFirestoreRest} from '../lib/firestore-rest.mjs';
const {privateKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});
let commits=0,begins=0,oauth=0;
const db=createFirestoreRest({serviceAccount:{project_id:'test',private_key_id:'test-key',client_email:'test@example.test',private_key:privateKey},databaseId:'test-db',fetcher:async(url,options)=>{
 if(url==='https://oauth2.googleapis.com/token'){oauth++;assert.ok(new URLSearchParams(options.body).get('assertion').split('.').length===3);return Response.json({access_token:'test-only',expires_in:3600});}
 assert.equal(options.headers.Authorization,'Bearer test-only');
 if(url.endsWith(':beginTransaction')){begins++;return Response.json({transaction:'test-transaction'});}
 if(url.endsWith(':rollback'))return Response.json({});
 if(url.endsWith(':commit')){const body=JSON.parse(options.body);commits++;assert.equal(body.transaction,'test-transaction');assert.equal(body.writes[0].update.fields.walletBalance.doubleValue,12.34);assert.deepEqual(body.writes[0].updateMask.fieldPaths,['`walletBalance`']);if(commits===1)return Response.json({error:{status:'ABORTED',message:'retry'}},{status:409});return Response.json({commitTime:'2026-10-11T00:00:00Z'});}
 if(url.includes('/users/missing'))return Response.json({error:{status:'NOT_FOUND'}},{status:404});
 return Response.json({name:'projects/test/databases/test-db/documents/users/player',fields:{walletBalance:{doubleValue:10.5},status:{stringValue:'ACTIVE'}}});
}});
assert.equal((await db.collection('users').doc('missing').get()).exists,false);
const result=await db.runTransaction(async tx=>{const ref=db.collection('users').doc('player'),snap=await tx.get(ref);assert.equal(snap.data().walletBalance,10.5);tx.set(ref,{walletBalance:12.34},{merge:true});return true;});assert.equal(result,true);assert.equal(commits,2);assert.equal(begins,2);assert.equal(oauth,1);
console.log('PASS: OAuth, leitura, ausência de documento, máscara de atualização e repetição de transação ABORTED; dados simulados.');
