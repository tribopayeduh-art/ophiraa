import { adminSettingsStore } from './admin-settings-store.mjs';
import { canManageGateway } from './gateway-secrets.mjs';

const json = (data, status = 200) => Response.json(data, {
  status, headers: { 'Cache-Control': 'private, no-store' }
});

function validRule(rule) {
  const money = value => Number.isInteger(value) && value >= 0 && value <= 100_000_000;
  return rule && typeof rule.label === 'string' && rule.label.trim().length > 0 &&
    rule.label.length <= 80 && typeof rule.enabled === 'boolean' &&
    ['fixed', 'percent'].includes(rule.type) && money(rule.value) &&
    (rule.type !== 'percent' || rule.value <= 10000) &&
    ['all', 'first', 'repeat'].includes(rule.occurrence) &&
    money(rule.min) && (rule.max === null || (money(rule.max) && rule.max >= rule.min));
}

export async function handleWithdrawalFees(request, env) {
  if (!canManageGateway(request, env)) return json({ message: 'Disponível para o administrador responsável.' }, 403);
  try {
    const store = adminSettingsStore(env, 'rules');
    if (request.method === 'GET') return json(await store.get());
    if (request.method !== 'PUT') return json({ message: 'Método indisponível.' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) {
      return json({ message: 'Origem inválida.' }, 403);
    }
    const raw = await request.text();
    if (raw.length > 12000) return json({ message: 'Configuração muito extensa.' }, 413);
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.rules) || data.rules.length > 20 || !data.rules.every(validRule) ||
        (data.updatedAt !== null && typeof data.updatedAt !== 'string')) {
      return json({ message: 'Confira os nomes, valores e faixas das taxas.' }, 400);
    }
    const rules = data.rules.map(({ label, enabled, type, value, occurrence, min, max }) =>
      ({ label: label.trim(), enabled, type, value, occurrence, min, max }));
    const updatedAt = new Date().toISOString() + '/' + crypto.randomUUID();
    if (!await store.save(rules, data.updatedAt, updatedAt)) return json({ message: 'As regras mudaram em outra sessão. Reabra a área antes de editar novamente.' }, 409);
    return json({ rules, updatedAt });
  } catch (error) {
    if (error instanceof SyntaxError && request.method === 'PUT') return json({ message: 'Configuração inválida.' }, 400);
    return json({ message: 'Não foi possível acessar as regras de taxas.' }, 503);
  }
}
