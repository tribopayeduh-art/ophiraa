import { canManageGateway } from './gateway-secrets.mjs';

const json = (body, status = 200) => Response.json(body, {
  status, headers: { 'Cache-Control': 'private, no-store' }
});

async function providerRequest(url, options, transport) {
  const response = await transport(url, {
    ...options, redirect: 'error', signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error('Gateway recusou a solicitação.');
  return response.json();
}

export async function pixupAccessToken(credentials, transport = fetch) {
  const token = await providerRequest('https://api.pixupbr.com/v2/oauth/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + btoa(credentials.id + ':' + credentials.secret), 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials' })
  }, transport);
  if (typeof token.access_token !== 'string') throw new Error('Token Pixup ausente.');
  return token.access_token;
}

export async function createPixupCharge({ amount, reference, credentials, transport = fetch }) {
  const token = await pixupAccessToken(credentials, transport);
  const charge = await providerRequest('https://api.pixupbr.com/v2/transactions/cashin', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: 'BRL', external_id: reference })
  }, transport);
  const code = charge.data?.payment_info?.qrcode;
  if (typeof code !== 'string' || !code.startsWith('00020')) throw new Error('Código Pixup inválido.');
  return { code, reference };
}

export async function handlePixDeposit(request, env) {
  if (request.method !== 'GET') return json({ message: 'Geração de Pix indisponível.' }, 405);
  const stored = env.DB ? await env.DB.prepare(
    "SELECT updated_at FROM gateway_secrets WHERE provider = 'dotfy'"
  ).first() : null;
  const dotfyProductionConfigured = Boolean(stored) || /^vk_live_[A-Za-z0-9_-]+$/.test(env.DOTFY_LIVE_API_KEY || '');
  return json({
    currency: 'BRL', live: false, walletCredit: false, dotfyProductionConfigured,
    dotfyUpdatedAt: stored?.updated_at ?? null,
    canManageDotfy: canManageGateway(request, env) && Boolean(env.DB && env.GATEWAY_ENCRYPTION_KEY),
    providers: [
      { name: 'Pixup', status: 'Adaptador preparado' },
      { name: 'Dotfy', status: dotfyProductionConfigured ? 'Chave de produção cadastrada' : 'Aguardando chave de produção' }
    ]
  });
}
