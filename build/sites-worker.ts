import { handlePixupSettings } from "../lib/pixup-settings.mjs";
import { handleDepositFunnels } from "../lib/deposit-funnels.mjs";
import { handleWithdrawalFees } from "../lib/withdrawal-fees.mjs";
import { saveDotfyKey, generateDotfyConnectionCharge } from "../lib/gateway-secrets.mjs";
import { handlePixDeposit } from "../lib/pix-deposits.mjs";
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

function requireSession(request: Request): Response | null {
  if (request.headers.get("oai-authenticated-user-id") &&
      request.headers.get("oai-authenticated-user-email")) return null;

  const url = new URL(request.url);
  const responseHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };
  if (request.method !== "GET" || url.pathname.startsWith("/api/") ||
      request.headers.get("sec-fetch-dest") && request.headers.get("sec-fetch-dest") !== "document" &&
      request.headers.get("sec-fetch-dest") !== "iframe") {
    return Response.json({ message: "Entre para continuar." }, { status: 401, headers: responseHeaders });
  }
  const returnTo = encodeURIComponent(url.pathname + url.search);
  return new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Entrar · BLITZ.BET</title>
<style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#141019;color:#fff;font:16px system-ui;padding:20px;box-sizing:border-box}main{width:min(100%,420px);box-sizing:border-box;background:#211929;border:1px solid #533949;border-radius:20px;padding:30px}strong{color:#ffae39;letter-spacing:.1em}p{color:#c9bbd1;line-height:1.6}a{display:block;text-align:center;padding:14px;border-radius:10px;background:#ffa31a;color:#241404;font-weight:750;text-decoration:none}a:focus-visible{outline:3px solid white;outline-offset:4px}</style>
<main><strong>BLITZ.BET</strong><h1>Entre para continuar</h1><p>Use sua conta ChatGPT para acessar a plataforma.</p><a href="/signin-with-chatgpt?return_to=${returnTo}" target="_top">Entrar com ChatGPT</a></main></html>`, {
    status: 401,
    headers: { ...responseHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const blocked = requireSession(request);
    if (blocked) return blocked;
    const path = new URL(request.url).pathname;
    if (path === "/api/admin/withdrawal-fees") return handleWithdrawalFees(request, env);
    if (path === "/api/admin/deposit-funnels") return handleDepositFunnels(request, env);
    if (path === "/api/admin/gateways/dotfy/connection-charge") return generateDotfyConnectionCharge(request, env);
    if (path === "/api/admin/gateways/dotfy/key") return saveDotfyKey(request, env);
    if (path === "/api/admin/gateways/pixup") return handlePixupSettings(request, env);
    if (path === "/api/pix/deposits") return handlePixDeposit(request, env);
    const assets = (env as Cloudflare.Env & { ASSETS?: Fetcher }).ASSETS;
    // Let application routes control HTML and API responses.
    const appPage = /^\/(?:admin|slots|bonus-buy|cassino-ao-vivo|blackjack|baccarat|promocoes)?\/?$/.test(path);
    if (assets && !appPage && (request.method === "GET" || request.method === "HEAD")) {
      const asset = await assets.fetch(request);
      if (asset.status !== 404) return asset;
    }
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
};
