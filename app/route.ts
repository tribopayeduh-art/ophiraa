import html from '../public/index.html?raw';
export function GET(request:Request){const personal=new URL(request.url).searchParams.has('secao');return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache',...(personal?{'X-Robots-Tag':'noindex, follow'}:{})}})}
