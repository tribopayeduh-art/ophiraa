const encoder = new TextEncoder();
const keyFormat = /^vk_live_[A-Za-z0-9_-]+$/;

export function canManageGateway(request, env) {
  const email = request.headers.get('oai-authenticated-user-email');
  return Boolean(request.headers.get('oai-authenticated-user-id') && email &&
    env.GATEWAY_ADMIN_EMAIL &&
    email.toLowerCase() === env.GATEWAY_ADMIN_EMAIL.trim().toLowerCase());
}

const json = (body, status = 200) => Response.json(body, {
  status, headers: { 'Cache-Control': 'private, no-store' }
});

export async function saveDotfyKey(request, env) {
  if (request.method !== 'POST') return json({ message: 'Método inválido.' }, 405);
  if (!canManageGateway(request, env) || request.headers.get('origin') !== new URL(request.url).origin) {
    return json({ message: 'Acesso restrito ao administrador.' }, 403);
  }
  if (!env.DB || !/^[a-f0-9]{64}$/.test(env.GATEWAY_ENCRYPTION_KEY || '')) {
    return json({ message: 'Armazenamento de credenciais indisponível.' }, 503);
  }
  try {
    const body = await request.text();
    if (body.length > 1024) return json({ message: 'Dados acima do limite.' }, 400);
    const value = JSON.parse(body)?.key;
    if (typeof value !== 'string' || value.length > 512 || !keyFormat.test(value)) {
      return json({ message: 'Informe uma chave Dotfy no formato vk_live_.' }, 400);
    }
    const rawKey = Uint8Array.from(env.GATEWAY_ENCRYPTION_KEY.match(/../g), hex => parseInt(hex, 16));
    const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: encoder.encode('dotfy') }, key, encoder.encode(value)
    ));
    await env.DB.prepare(
      'INSERT INTO gateway_secrets (provider,ciphertext,iv,updated_at) VALUES (?,?,?,?) ' +
      'ON CONFLICT(provider) DO UPDATE SET ciphertext=excluded.ciphertext,iv=excluded.iv,updated_at=excluded.updated_at'
    ).bind('dotfy', btoa(String.fromCharCode(...ciphertext)), btoa(String.fromCharCode(...iv)), new Date().toISOString()).run();
    return json({ message: 'Chave de produção salva.' });
  } catch (error) {
    if (error instanceof SyntaxError) return json({ message: 'Dados inválidos.' }, 400);
    return json({ message: 'Não foi possível salvar a chave.' }, 503);
  }
}

export async function generateDotfyConnectionCharge(request, env, transport = fetch) {
  if (request.method !== 'POST') return json({ message: 'Método inválido.' }, 405);
  if (!canManageGateway(request, env) || request.headers.get('origin') !== new URL(request.url).origin) {
    return json({ message: 'Acesso restrito ao administrador.' }, 403);
  }
  try {
    const saved = env.DB && await env.DB.prepare(
      "SELECT ciphertext, iv FROM gateway_secrets WHERE provider = 'dotfy'"
    ).first();
    let credential = env.DOTFY_LIVE_API_KEY;
    if (saved) {
      const raw = Uint8Array.from(env.GATEWAY_ENCRYPTION_KEY.match(/../g), hex => parseInt(hex, 16));
      const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
      const decode = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: decode(saved.iv), additionalData: encoder.encode('dotfy') },
        key, decode(saved.ciphertext)
      );
      credential = new TextDecoder().decode(plaintext);
    }
    if (!keyFormat.test(credential || '')) return json({ message: 'Salve a chave de produção primeiro.' }, 409);
    const response = await transport('https://app.dotfy.com.br/api/charges', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { Authorization: 'Bearer ' + credential, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 10, description: 'BLITZ.BET — verificação de conexão', expiresIn: 900 })
    });
    if (!response.ok) return json({ message: 'A Dotfy recusou a cobrança (HTTP ' + response.status + ').' }, 502);
    const result = await response.json();
    const code = result.data?.qrCode;
    if (!result.success || result.data?.value !== 1000 || typeof code !== 'string' ||
        !code.startsWith('00020') || code.length > 2048) {
      return json({ message: 'Resposta de cobrança inválida.' }, 502);
    }
    return json({ code, message: 'Cobrança de R$ 10 gerada. Pix copia e cola disponível abaixo.' }, 201);
  } catch {
    return json({ message: 'Não foi possível confirmar a geração da cobrança. Confira a Dotfy antes de tentar novamente.' }, 502);
  }
}
