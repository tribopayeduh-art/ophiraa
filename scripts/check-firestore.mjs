import { readFile } from 'node:fs/promises';
import { createFirestoreRest } from '../lib/firestore-rest.mjs';

try {
  const file = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || (file && await readFile(file, 'utf8'));
  if (!raw) throw new Error('MISSING_CREDENTIAL');
  const serviceAccount = JSON.parse(raw);
  const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(serviceAccount.project_id ?? '') ||
      serviceAccount.type !== 'service_account' ||
      !serviceAccount.client_email?.includes('@') ||
      !serviceAccount.private_key?.startsWith('-----BEGIN PRIVATE KEY-----') ||
      !/^(\(default\)|[a-z][a-z0-9-]{2,62})$/.test(databaseId)) {
    throw new Error('INVALID_CONFIG');
  }
  const db = createFirestoreRest({ serviceAccount, databaseId });
  await db.collection('blitzAdminSettings').limit(1).get();
  console.log('Firestore acessível. Leitura validada no banco ' + databaseId + '.');
} catch (error) {
  const messages = {
    MISSING_CREDENTIAL: 'Configure FIREBASE_SERVICE_ACCOUNT_JSON ou FIREBASE_SERVICE_ACCOUNT_FILE.',
    INVALID_CONFIG: 'Confira o JSON da conta de serviço e o ID do banco.',
    FIREBASE_CREDENTIAL_INVALID: 'O Google recusou a conta de serviço. Confira a chave e se ela está ativa.',
    PERMISSION_DENIED: 'A conta de serviço não tem permissão de leitura no Firestore.',
    NOT_FOUND: 'Confira se o banco existe e se o ID informado pertence ao projeto.',
    ENOENT: 'O arquivo da conta de serviço não foi encontrado.',
  };
  console.error(messages[error.code || error.message] || 'Falha ao consultar o Firestore. Confira o JSON, a rede e a configuração do projeto.');
  process.exitCode = 1;
}
