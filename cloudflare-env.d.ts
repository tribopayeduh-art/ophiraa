declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
declare namespace Cloudflare {interface Env {FIREBASE_SERVICE_ACCOUNT_JSON:string;FIRESTORE_DATABASE_ID:string;PG_SESSION_SECRET:string;PG_ADMIN_EMAIL:string;}}
declare namespace Cloudflare { interface Env { ADMIN_SETTINGS_FIRESTORE?: string; } }
