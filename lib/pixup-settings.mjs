import { canManageGateway } from './gateway-secrets.mjs';
import { pixupAccessToken } from './pix-deposits.mjs';

const json = (payload, status = 200) => Response.json(payload, {
  status, headers: { 'Cache-Control': 'private, no-store' }
});
const encoder = new TextEncoder();
const context = encoder.encode('pixup');
const fromBase64 = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
const validId = value => typeof value === 'string' && /^[!-~]{1,256}$/.test(value) && !value.includes(':');
const validSecret = value => typeof value === 'string' && /^[!-~]{1,512}$/.test(value);

export async function handlePixupSettings(request, env, transport = fetch) {
  if (!canManageGateway(request, env) ||
      (request.method !== 'GET' && request.headers.get('origin') !== new URL(request.url).origin)) {
    return json({ message: 'Acesso restrito ao administrador.' }, 403);
  }
  if (!env.DB || !/^[a-f0-9]{64}$/.test(env.GATEWAY_ENCRYPTION_KEY || '')) {
    return json({ message: 'Armazenamento de credenciais indisponível.' }, 503);
  }
  try {
    const row = await env.DB.prepare("SELECT ciphertext, iv, updated_at FROM gateway_secrets WHERE provider = 'pixup'").first();
    const fallback = validId(env.PIXUP_CLIENT_ID) && validSecret(env.PIXUP_CLIENT_SECRET);
    if (request.method === 'GET') return json({ configured: Boolean(row) || fallback, updatedAt: row?.updated_at ?? null });
    const rawKey = Uint8Array.from(env.GATEWAY_ENCRYPTION_KEY.match(/../g), hex => parseInt(hex, 16));
    if (request.method === 'PUT') {
      const raw = await request.text();
      if (raw.length > 2048) return json({ message: 'Dados acima do limite.' }, 413);
      let form;
      try { form = JSON.parse(raw); } catch { return json({ message: 'Dados inválidos.' }, 400); }
      if (!validId(form?.id) || !validSecret(form?.secret)) {
        return json({ message: 'Informe o Client ID e o Client Secret da Pixup.' }, 400);
      }
      const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, additionalData: context }, key, encoder.encode(JSON.stringify({ id: form.id, secret: form.secret }))
      ));
      await env.DB.prepare(
        "INSERT INTO gateway_secrets (provider,ciphertext,iv,updated_at) VALUES ('pixup',?,?,?) " +
        'ON CONFLICT(provider) DO UPDATE SET ciphertext=excluded.ciphertext,iv=excluded.iv,updated_at=excluded.updated_at'
      ).bind(btoa(String.fromCharCode(...ciphertext)), btoa(String.fromCharCode(...iv)), new Date().toISOString()).run();
      return json({ message: 'Credenciais Pixup salvas.' });
    }
    if (request.method !== 'POST') return json({ message: 'Método inválido.' }, 405);
    if (!row && !fallback) return json({ message: 'Salve as credenciais primeiro.' }, 409);
    let credentials = { id: env.PIXUP_CLIENT_ID, secret: env.PIXUP_CLIENT_SECRET };
    if (row) {
      const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']);
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(row.iv), additionalData: context }, key, fromBase64(row.ciphertext)
      );
      credentials = JSON.parse(new TextDecoder().decode(plaintext));
    }
    const token = await pixupAccessToken(credentials, transport);
    const response = await transport('https://api.pixupbr.com/v2/account/balance', {
      headers: { Authorization: 'Bearer ' + token }, redirect: 'error', signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error('Balance unavailable');
    const data = await response.json();
    if (data.success !== true || !Array.isArray(data.data?.balances)) throw new Error('Invalid balance response');
    const available = data.data.balances.find(balance => balance.currency === 'BRL')?.available;
    return json({ message: 'Conexão Pixup validada.', availableBRL: typeof available === 'string' && /^\d+(\.\d+)?$/.test(available) ? available : null });
  } catch {
    return json({ message: request.method === 'POST' ? 'A Pixup não confirmou a conexão. Confira as credenciais e permissões.' : 'Configuração Pixup indisponível.' }, 502);
  }
}
