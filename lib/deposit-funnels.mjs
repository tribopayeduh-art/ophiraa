import { adminSettingsStore } from './admin-settings-store.mjs';
import { canManageGateway } from './gateway-secrets.mjs';

const json = (data, status = 200) => Response.json(data, {
  status, headers: { 'Cache-Control': 'private, no-store' }
});

function validFunnel(funnel) {
  const validText = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
  return funnel && validText(funnel.name, 80) &&
    typeof funnel.description === 'string' && funnel.description.length <= 240 &&
    ['draft', 'ready', 'paused'].includes(funnel.status) &&
    Array.isArray(funnel.steps) && funnel.steps.length <= 20 &&
    (funnel.status !== 'ready' || funnel.steps.length > 0) &&
    funnel.steps.every(step => validText(step, 100));
}

export async function handleDepositFunnels(request, env) {
  if (!canManageGateway(request, env)) return json({ message: 'Disponível para o administrador responsável.' }, 403);
  try {
    const store = adminSettingsStore(env, 'funnels');
    if (request.method === 'GET') return json(await store.get());
    if (request.method !== 'PUT') return json({ message: 'Método indisponível.' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) {
      return json({ message: 'Origem inválida.' }, 403);
    }
    const raw = await request.text();
    if (raw.length > 300000) return json({ message: 'Configuração muito extensa.' }, 413);
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.funnels) || data.funnels.length > 50 || !data.funnels.every(validFunnel) ||
        (data.updatedAt !== null && typeof data.updatedAt !== 'string')) {
      return json({ message: 'Confira o nome, o status e as etapas de cada funil.' }, 400);
    }
    const funnels = data.funnels.map(({ name, description, status, steps }) =>
      ({ name: name.trim(), description: description.trim(), status, steps: steps.map(step => step.trim()) }));
    const updatedAt = new Date().toISOString() + '/' + crypto.randomUUID();
    if (!await store.save(funnels, data.updatedAt, updatedAt)) return json({ message: 'Os funis mudaram em outra sessão. Reabra a área antes de editar novamente.' }, 409);
    return json({ funnels, updatedAt });
  } catch (error) {
    if (error instanceof SyntaxError && request.method === 'PUT') return json({ message: 'Configuração inválida.' }, 400);
    return json({ message: 'Não foi possível acessar os funis de depósitos.' }, 503);
  }
}
