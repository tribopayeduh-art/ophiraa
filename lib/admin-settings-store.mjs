import { createFirestoreRest } from './firestore-rest.mjs';

const settings = {
  rules: { table: 'withdrawal_fee_settings', document: 'withdrawalFees' },
  funnels: { table: 'deposit_funnel_settings', document: 'depositFunnels' },
};

let cached;
export function adminSettingsStore(env, field) {
  const { table, document } = settings[field];
  const legacy = async () => {
    const row = await env.DB?.prepare(`SELECT ${field}, updated_at FROM ${table} WHERE id = 'default'`).first();
    return row ? { [field]: JSON.parse(row[field]), updatedAt: row.updated_at } : { [field]: [], updatedAt: null };
  };
  if (env.ADMIN_SETTINGS_FIRESTORE !== 'true') {
    if (!env.DB) throw new Error('Admin storage unavailable');
    return {
      get: legacy,
      async save(values, expected, updatedAt) {
        const payload = JSON.stringify(values);
        const result = expected === null
          ? await env.DB.prepare(`INSERT OR IGNORE INTO ${table} VALUES ('default', ?, ?)`).bind(payload, updatedAt).run()
          : await env.DB.prepare(`UPDATE ${table} SET ${field} = ?, updated_at = ? WHERE id = 'default' AND updated_at = ?`)
            .bind(payload, updatedAt, expected).run();
        return Boolean(result.meta.changes);
      }
    };
  }

  const { FIREBASE_SERVICE_ACCOUNT_JSON: account, FIRESTORE_DATABASE_ID: databaseId } = env;
  if (!account || !databaseId) throw new Error('Firebase admin storage unavailable');
  if (cached?.account !== account || cached?.databaseId !== databaseId) {
    cached = { account, databaseId, db: createFirestoreRest({ serviceAccount: account, databaseId }) };
  }
  const db = cached.db;
  const ref = db.collection('blitzAdminSettings').doc(document);
  return {
    async get() {
      const current = await ref.get();
      return current.exists ? current.data() : legacy();
    },
    async save(values, expected, updatedAt) {
      const fallback = await legacy();
      return db.runTransaction(async tx => {
        const doc = await tx.get(ref);
        const current = doc.exists ? doc.data() : fallback;
        if (current.updatedAt !== expected) return false;
        tx.set(ref, { [field]: values, updatedAt });
        return true;
      });
    }
  };
}
