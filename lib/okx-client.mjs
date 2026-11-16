const base = 'https://okx-panel-host.eduhhotmart.chatgpt.site';

export function createOkxClient(env, transport = fetch) {
  if (!env.OKX_HOUSE_TOKEN?.trim()) throw new Error('Configure OKX_HOUSE_TOKEN no servidor.');
  const headers = { Authorization: 'Bearer ' + env.OKX_HOUSE_TOKEN.trim() };
  if (env.OKX_SITE_TOKEN?.trim()) headers['OAI-Sites-Authorization'] = 'Bearer ' + env.OKX_SITE_TOKEN.trim();

  async function request(path, body) {
    const response = await transport(base + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? headers : { ...headers, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const error = new Error('OKX retornou HTTP ' + response.status);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  return {
    reportSettledRound({ roundId, game, currency, stake, payout }) {
      if (typeof roundId !== 'string' || !roundId.trim() || !validSlug(game) ||
          !/^[A-Z]{3}$/.test(currency) || !Number.isSafeInteger(stake) || stake < 0 ||
          !Number.isSafeInteger(payout) || payout < 0) throw new TypeError('Rodada inválida.');
      return request('/v1/rounds', { roundId, game, currency, stake, payout });
    },
    getRtp(game) {
      if (!validSlug(game)) throw new TypeError('Slug inválido.');
      return request('/v1/rtp/' + encodeURIComponent(game));
    },
    getCommunications: () => request('/v1/communications'),
  };
}

function validSlug(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
