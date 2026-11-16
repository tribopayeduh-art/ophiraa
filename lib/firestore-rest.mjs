import crypto from 'node:crypto';
const encode=value=>value===null?{nullValue:null}:typeof value==='string'?{stringValue:value}:typeof value==='boolean'?{booleanValue:value}:typeof value==='number'?(Number.isInteger(value)?{integerValue:String(value)}:{doubleValue:value}):Array.isArray(value)?{arrayValue:{values:value.map(encode)}}:{mapValue:{fields:fields(value)}};
const fields=obj=>Object.fromEntries(Object.entries(obj||{}).filter(([,v])=>v!==undefined).map(([k,v])=>[k,encode(v)]));
const decode=value=>'nullValue'in value?null:'stringValue'in value?value.stringValue:'booleanValue'in value?value.booleanValue:'integerValue'in value?Number(value.integerValue):'doubleValue'in value?value.doubleValue:'timestampValue'in value?value.timestampValue:'arrayValue'in value?(value.arrayValue.values||[]).map(decode):'mapValue'in value?Object.fromEntries(Object.entries(value.mapValue.fields||{}).map(([k,v])=>[k,decode(v)])):null;
export function createFirestoreRest({serviceAccount,databaseId,fetcher=fetch}){
 const account=typeof serviceAccount==='string'?JSON.parse(serviceAccount):serviceAccount;
 const database=`projects/${account.project_id}/databases/${databaseId}`,base='https://firestore.googleapis.com/v1/'+database+'/documents';
 let cached=null,flight;
 async function token(){
  if(cached&&cached.expires>Date.now()+60000)return cached.value;if(flight)return flight;
  flight=(async()=>{const now=Math.floor(Date.now()/1000),part=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
   const input=part({alg:'RS256',typ:'JWT',kid:account.private_key_id})+'.'+part({iss:account.client_email,scope:'https://www.googleapis.com/auth/datastore',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
   const jwt=input+'.'+crypto.sign('RSA-SHA256',Buffer.from(input),account.private_key).toString('base64url');
   const r=await fetcher('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:jwt}),signal:AbortSignal.timeout(12000)});
   const data=await r.json();if(!r.ok||!data.access_token)throw new Error('FIREBASE_CREDENTIAL_INVALID');cached={value:data.access_token,expires:Date.now()+(data.expires_in||3600)*1000};return cached.value;
  })();try{return await flight;}finally{flight=null;}
 }
 async function api(url,method='GET',body){const r=await fetcher(url,{method,headers:{Authorization:'Bearer '+await token(),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.error?.message||'Firestore HTTP '+r.status);e.code=data.error?.status||r.status;throw e;}return data;}
 function ref(collection,id=crypto.randomUUID()){
  if(!collection||!id||collection.includes('/')||String(id).includes('/'))throw new Error('INVALID_DOCUMENT_PATH');
  const name=database+'/documents/'+collection+'/'+id,url=base+'/'+encodeURIComponent(collection)+'/'+encodeURIComponent(id);
  return {name,id,url,async get(transaction){try{const doc=await api(url+(transaction?'?transaction='+encodeURIComponent(transaction):''));return {exists:true,id,data:()=>Object.fromEntries(Object.entries(doc.fields||{}).map(([k,v])=>[k,decode(v)]))};}catch(e){if(e.code==='NOT_FOUND'||e.code===404)return {exists:false,id,data:()=>undefined};throw e;}},async set(data,options){const write=makeWrite({name},data,options);await api(base+':commit','POST',{writes:[write]});}};
 }
 function makeWrite(ref,data,options){return {update:{name:ref.name,fields:fields(data)},...(options?.merge?{updateMask:{fieldPaths:Object.keys(data).filter(k=>data[k]!==undefined).map(k=>'`'+k.replace(/`/g,'\\`')+'`')}}:{})};}
 async function runTransaction(callback){for(let attempt=0;attempt<4;attempt++){
  const {transaction}=await api(base+':beginTransaction','POST',{options:{readWrite:{}}});const writes=[];let writing=false;
  try{const output=await callback({get:r=>{if(writing)throw new Error('Transaction reads must precede writes');return r.get(transaction);},set:(r,data,options)=>{writing=true;writes.push(makeWrite(r,data,options));}});await api(base+':commit','POST',{transaction,writes});return output;}catch(e){await api(base+':rollback','POST',{transaction}).catch(()=>{});if(e.code==='ABORTED'&&attempt<3)continue;throw e;}
 }throw new Error('Firestore transaction retry exhausted');}
 return {runTransaction,collection:name=>({doc:id=>ref(name,id),limit:n=>({get:async()=>{const result=await api(base+'/'+encodeURIComponent(name)+'?pageSize='+Math.min(n,1000));return {docs:(result.documents||[]).map(doc=>({id:doc.name.split('/').at(-1),data:()=>Object.fromEntries(Object.entries(doc.fields||{}).map(([k,v])=>[k,decode(v)]))}))};}})})};
}
