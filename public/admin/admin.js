(()=>{'use strict';const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const paths={dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',wallet:'M21 8V5H3v15h18V8H3 M21 10h-6v6h6 M17 13h1',pay:'M12 3v18 M7 7l5-5 5 5 M5 13H2v8h20v-8h-3',gateway:'M3 5h18v14H3z M3 10h18 M7 15h3 M14 15h3',shield:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6z M8 12l3 3 5-6',games:'M6 7h12a4 4 0 0 1 4 4v7a2 2 0 0 1-3 1l-3-3H8l-3 3a2 2 0 0 1-3-1v-7a4 4 0 0 1 4-4z M6 10v5 M3.5 12.5h5 M16 11h.01 M19 14h.01',banner:'M3 3h18v18H3z M3 16l6-6 5 5 3-3 4 4 M16 7h.01',affiliate:'M10 13a5 5 0 0 0 7 0l4-4a5 5 0 0 0-7-7l-2 2 M14 11a5 5 0 0 0-7 0l-4 4a5 5 0 0 0 7 7l2-2',report:'M4 21V10h4v11 M10 21V3h4v18 M16 21V7h4v14',support:'M3 14v-3a9 9 0 0 1 18 0v3 M3 12h4v8H3z M17 12h4v8h-4z M17 20l-3 2h-3',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M9 2h6l1 4 4 1 2 5-3 3v5l-5 2-3-3H6l-4-5 3-3V6z',audit:'M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5',search:'m21 21-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',menu:'M3 6h18 M3 12h18 M3 18h18',close:'m6 6 12 12 M6 18 18 6',arrow:'M5 12h14 m-5-5 5 5-5 5',download:'M12 3v12 m-5-5 5 5 5-5 M3 15v6h18v-6',plus:'M12 4v16 M4 12h16',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',check:'m5 12 4 4 10-10',clock:'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',lock:'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4',info:'M12 11v6 M12 7h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'};const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n]||paths.dashboard}"/></svg>`;
const sections=[['dashboard','Dashboard','dashboard','Visão geral'],['queue','Central de pendências','clock'],['users','Usuários','users','Operação'],['wallets','Carteiras e transações','wallet'],['payments','Depósitos e saques','pay'],['gateways','Gateways e integrações','gateway'],['funnels','Funis de depósitos','pay'],['conversions','Funil e conversão','report'],['fees','Taxas e condições','pay'],['risk','Verificação e risco','shield'],['games','Jogos e provedores','games','Crescimento'],['banners','Banners e promoções','banner'],['affiliates','Afiliados e comissões','affiliate'],['reports','Relatórios e análises','report'],['support','Central de suporte','support','Gestão'],['settings','Configurações e acessos','settings'],['audit','Auditoria e logs','audit']];
const defaults={conversions:[],playerDemo:{},activeGateway:null,aliases:{pixup:'PixUp principal',dotfy:'Dotfy principal'},audit:[],userStatus:{},payments:{},games:{},campaigns:[],team:[],tickets:{},settings:{brand:'BLITZ.BET',color:'#ff9900',twoFactor:true}};let state;try{state={...structuredClone(defaults),...JSON.parse(localStorage.getItem('blitz-admin-demo-v2')||'{}')}}catch{state=structuredClone(defaults)}if(!['pixup','dotfy',null].includes(state.activeGateway))state.activeGateway=null;
let view='dashboard',tab='',query='',filter='',page=1,ticket=0,settingsTab='Equipe e permissões',focusReturn;const perPage=6;
const users=['Carlos M. Silva','Mariana O. Santos','Rafael A. Costa','Fernanda P. Lima','Lucas G. Almeida','Juliana R. Melo','Bruno C. Rocha','Patrícia N. Alves','Pedro S. Lima','Camila F. Souza','Ana P. Nunes','João V. Silva'].map((name,i)=>({id:8743-i*123,name,email:name.split(' ')[0].toLowerCase()+'***@exemplo.com',kyc:i%3?'Verificado':'Pendente',status:i===3?'Suspenso':i===7?'Inativo':'Ativo',date:`${10+i}/10/2026`,balance:[850,1200,450,2100,96,320][i%6]}));
const transactions=users.map((u,i)=>({id:'TX-'+(2048+i),user:u,type:i%3===0?'Saque PIX':i%3===1?'Depósito PIX':'Ajuste demonstrativo',value:[500,250,150,1200,800,75][i%6],status:i%3===0?'Em análise':'Aprovado'}));
const games=['Fortune Tiger','Fortune Ox','Fortune Dragon','Fortune Rabbit','Fortune Mouse','Bikini Paradise','Jungle Delight','Ganesha Gold','Double Fortune','Dragon Tiger Luck','Butterfly Blossom'];const tickets=[['Saque não creditado','João Santos','Alta'],['Bônus não aplicado','Mariana Alves','Média'],['Alteração de cadastro','Rafael Lima','Baixa'],['Dúvida sobre regras','Carlos Mendes','Baixa']];
const money=v=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),badge=(t,c='gray')=>`<span class="badge ${c}">${esc(t)}</span>`,status=t=>badge(t,['Ativo','Aprovado','Verificado','Publicado','Respondido'].includes(t)?'green':['Em análise','Pendente','Rascunho'].includes(t)?'amber':['Recusado','Bloqueado','Suspenso'].includes(t)?'red':'gray'),btn=(text,action,ic='',cls='')=>`<button type="button" class="btn ${cls}" data-action="${action}">${ic?icon(ic):''}${text}</button>`,notice=s=>`<div class="notice">${icon('info')}<div>${s}</div></div>`,heading=(title,desc,actions='')=>`<div class="heading"><div><p class="eyebrow">BLITZ WORKSPACE</p><h1>${title}</h1><p class="sub">${desc}</p></div><div class="actions">${actions}</div></div>`,card=(title,body,action='')=>`<section class="card"><div class="card-head"><h2>${title}</h2>${action}</div>${body}</section>`,metric=(label,value,ic,foot='Dados de exemplo')=>`<div class="metric"><div class="metric-label"><span>${label}</span><span class="tile-icon">${icon(ic)}</span></div><b>${value}</b><small>${foot}</small></div>`;
function table(head,rows){return `<div class="table-wrap"><table role="table"><thead role="rowgroup"><tr role="row">${head.map(x=>`<th role="columnheader" scope="col">${x}</th>`).join('')}</tr></thead><tbody role="rowgroup">${rows.length?rows.map(r=>`<tr role="row">${r.map((c,i)=>`<td role="cell"><span class="mobile-cell-label" aria-hidden="true">${esc(head[i])}</span><div class="cell-value">${c}</div></td>`).join('')}</tr>`).join(''):`<tr><td class="empty" colspan="${head.length}">Nenhum resultado.</td></tr>`}</tbody></table></div>`}const person=u=>`<div class="person"><span class="avatar">${u.name[0]}${u.name.split(' ').at(-1)[0]}</span><div><b>${esc(u.name)}</b><small>ID: #${u.id}</small></div></div>`,detail=(label,value)=>`<div class="detail-line"><span>${label}</span><b>${value}</b></div>`,eye=(action,label='Ver detalhes')=>`<button type="button" class="textlink" data-action="${action}" aria-label="${esc(label)}">${icon('eye')}</button>`;
function save(action,detail){state.audit.unshift({date:new Date().toISOString(),action,detail});state.audit=state.audit.slice(0,100);try{localStorage.setItem('blitz-admin-demo-v2',JSON.stringify(state));return true}catch{toast('Não foi possível salvar neste navegador.');return false}}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),4000)}
function toolbar(placeholder,opts){return `<div class="toolbar"><input id="filterSearch" type="search" aria-label="${placeholder}" placeholder="${placeholder}" value="${esc(query)}"><select id="statusFilter" aria-label="Filtrar por status"><option value="">Todos os status</option>${opts.map(x=>`<option ${x===filter?'selected':''}>${x}</option>`).join('')}</select>${btn('Exportar CSV','export','download')}</div>`}
function pagination(n){return `<div class="pagination"><span>${n?`Exibindo ${(page-1)*perPage+1}–${Math.min(page*perPage,n)} de ${n}`:'Nenhum registro'}</span><div class="actions"><button type="button" class="btn" data-action="prev" ${page===1?'disabled':''}>←</button><span>Página ${page} de ${Math.max(1,Math.ceil(n/perPage))}</span><button type="button" class="btn" data-action="next" ${page*perPage>=n?'disabled':''}>→</button></div></div>`}
function chart(){return `<div class="chart"><div class="legend"><span><i></i>Receita líquida</span><span><i class="orange"></i>Depósitos</span></div><svg viewBox="0 0 650 230" preserveAspectRatio="none" role="img" aria-label="Gráfico ilustrativo de receita e depósitos no mês de outubro"><defs><linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a97aff" stop-opacity=".24"/><stop offset="1" stop-color="#a97aff" stop-opacity="0"/></linearGradient></defs>${[40,85,130,175,220].map((y,i)=>`<path d="M45 ${y}H640" stroke="#313b4b" stroke-dasharray="3 4"/><text x="0" y="${y}" font-size="9" fill="#73849d">${20-i*5} mil</text>`).join('')}<path d="M45 190C90 195 100 140 150 155S220 120 260 135 330 80 365 105 420 60 465 80 530 40 565 60 610 20 640 25V220H45Z" fill="url(#chartArea)"/><path d="M45 190C90 195 100 140 150 155S220 120 260 135 330 80 365 105 420 60 465 80 530 40 565 60 610 20 640 25" fill="none" stroke="#b68aff" stroke-width="3"/><path d="M45 210C110 200 130 175 180 180S250 140 300 155 370 120 420 130 500 85 550 90 610 60 640 70" fill="none" stroke="#ffac46" stroke-width="2"/></svg><div class="chart-labels"><span>01 out</span><span>05 out</span><span>10 out</span><span>15 out</span><span>20 out</span><span>25 out</span><span>30 out</span></div></div>`}
function go(id){view=sections.some(s=>s[0]===id)?id:'dashboard';tab='';query='';filter='';page=1;history.replaceState(null,'',`#${view}`);render();document.body.classList.remove('menu-open');$('#menu').setAttribute('aria-expanded','false');window.scrollTo(0,0)}
function conversions() {
  const rate = (sales, visits) => visits ? (sales / visits).toLocaleString('pt-BR', {style:'percent',maximumFractionDigits:1}) : '—';
  const rows = state.conversions;
  return heading('Funil e conversão','Registre os resultados de cada etapa por período.') +
    card('Resultados por etapa', `<div class="pad">
      <p class="sub">Conversão = vendas ÷ pessoas que chegaram à etapa. Registros manuais salvos neste navegador.</p>
      <form id="conversion-form" class="fee-fields">
        <label class="form-field">Funil<input name="funnel" maxlength="80" required placeholder="Ex.: Funil de idioma"></label>
        <label class="form-field">Etapa<input name="step" maxlength="80" required placeholder="Ex.: Revisão do depósito"></label>
        <label class="form-field">Início do período<input type="date" name="start" required></label>
        <label class="form-field">Fim do período<input type="date" name="end" required></label>
        <label class="form-field">Pessoas na etapa<input type="number" min="0" max="1000000000" step="1" name="visits" required></label>
        <label class="form-field">Vendas<input type="number" min="0" max="1000000000" step="1" name="sales" required></label>
        <div class="actions"><button type="submit" class="btn primary">Salvar resultado</button></div>
        <p class="form-note" role="status" id="conversion-status"></p>
      </form></div>` + table(['Funil','Etapa','Período','Pessoas','Vendas','Conversão','Ações'],
        rows.map((row, i) => [
          esc(row.funnel), esc(row.step), [row.start,row.end].map(date=>esc(date.split('-').reverse().join('/'))).join(' a '),
          row.visits.toLocaleString('pt-BR'), row.sales.toLocaleString('pt-BR'), rate(row.sales,row.visits),
          btn('Editar','conversion-edit:'+i)
        ])));
}
document.addEventListener('submit', event => {
  if (event.target.id !== 'conversion-form') return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const row = { ...data, funnel:data.funnel.trim(), step:data.step.trim(), visits:Number(data.visits), sales:Number(data.sales) };
  if (!row.funnel || !row.step || row.start > row.end || row.sales > row.visits) {
    $('#conversion-status').textContent = 'Preencha o funil e a etapa, confira as datas e informe vendas até o total de pessoas.';
    return;
  }
  const editing = event.target.dataset.editing;
  const index = state.conversions.findIndex(item =>
    item.funnel.toLowerCase() === row.funnel.toLowerCase() && item.step.toLowerCase() === row.step.toLowerCase() &&
    item.start === row.start && item.end === row.end);
  if (editing !== undefined && index !== -1 && index !== Number(editing)) {
    $('#conversion-status').textContent = 'Já existe um registro para esta etapa e período.';
    return;
  }
  if (editing !== undefined) state.conversions[Number(editing)] = row;
  else if (index !== -1) state.conversions[index] = row;
  else state.conversions.unshift(row);
  if (save('Conversão registrada', row.funnel + ' · ' + row.step)) {
    render();
    $('#conversion-status').textContent = 'Resultado salvo.';
  }
});

function render(){document.body.dataset.view=view;document.querySelectorAll('.mobile-nav [data-nav]').forEach(link => { if(link.dataset.nav===view)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current'); });$('#crumb').textContent=sections.find(s=>s[0]===view)[1];$('#nav').innerHTML=sections.map(s=>`${s[3]?`<div class="nav-label">${s[3]}</div>`:''}<a href="#${s[0]}" data-nav="${s[0]}" class="nav-link ${s[0]===view?'active':''}" ${s[0]===view?'aria-current="page"':''}>${icon(s[2])}<span>${s[1]}</span>${s[0]==='gateways'?'<em>2</em>':''}</a>`).join('');$('#content').innerHTML=({dashboard,queue:pendingQueue,users:usersView,wallets,payments,gateways,funnels,conversions,fees,risk,games:gamesView,banners,affiliates,reports,support,settings,audit}[view])()}
function funnels() {
  queueMicrotask(loadFunnels);
  return heading('Funis de depósitos', 'Cadastre e organize as etapas de cada jornada de depósito.') +
    notice('Os funis são configurações do painel. O status Pronto indica que o fluxo está documentado para revisão.') +
    '<div id="deposit-funnels" aria-busy="true"><p role="status">Carregando funis…</p></div>';
}

async function loadFunnels() {
  const region = $('#deposit-funnels');
  if (!region) return;
  const endpoint = '/api/admin/deposit-funnels';
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    renderFunnels(region, endpoint, data);
  } catch (error) {
    region.textContent = error.message || 'Não foi possível carregar os funis.';
  } finally {
    region.removeAttribute('aria-busy');
  }
}

function renderFunnels(region, endpoint, { funnels, updatedAt }) {
  region.innerHTML = `<form class="card fee-panel funnel-manager">
    <div class="card-head"><h2>Seus funis</h2><button type="button" class="btn" data-new-funnel>+ Novo funil</button></div>
    <p class="sub" data-funnel-count></p>
    <div data-funnel-list></div>
    <div class="actions"><button type="submit" class="btn primary">Salvar funis</button></div>
    <p role="status" data-funnel-message></p>
  </form>`;
  const form = region.querySelector('form');
  const list = form.querySelector('[data-funnel-list]');
  const message = form.querySelector('[data-funnel-message]');
  const add = form.querySelector('[data-new-funnel]');
  const statusLabels = { draft: 'Rascunho', ready: 'Pronto', paused: 'Pausado' };

  function updateCount() {
    const count = list.children.length;
    form.querySelector('[data-funnel-count]').textContent = count
      ? `${count} de 50 funis`
      : 'Nenhum funil cadastrado. Use Novo funil para começar.';
    add.disabled = count >= 50;
  }

  function appendFunnel(funnel, open = false) {
    const card = document.createElement('details');
    card.className = 'fee-rule';
    card.open = open;
    card.innerHTML = `<summary><strong></strong><span class="badge gray"></span></summary>
      <div class="fee-fields">
        <label>Nome do funil<input name="name" maxlength="80" required value="${esc(funnel.name)}"></label>
        <label>Status<select name="status">${Object.entries(statusLabels).map(([value, label]) =>
          `<option value="${value}">${label}</option>`).join('')}</select></label>
        <label class="funnel-wide">Descrição<textarea name="description" maxlength="240" rows="2">${esc(funnel.description)}</textarea></label>
        <label class="funnel-wide">Etapas em ordem<textarea name="steps" rows="5" placeholder="Escolher valor&#10;Revisar depósito&#10;Gerar Pix">${esc(funnel.steps.join('\n'))}</textarea><small>Uma etapa por linha. Até 20 etapas de 100 caracteres.</small></label>
      </div>
      <button type="button" class="btn" data-remove-funnel>Remover funil</button>`;
    const name = card.querySelector('[name=name]');
    const status = card.querySelector('[name=status]');
    status.value = funnel.status;
    const syncSummary = () => {
      card.querySelector('summary strong').textContent = name.value.trim() || 'Novo funil';
      card.querySelector('summary span').textContent = statusLabels[status.value];
    };
    card.addEventListener('input', syncSummary);
    card.addEventListener('invalid', () => { card.open = true; }, true);
    card.querySelector('[data-remove-funnel]').addEventListener('click', () => {
      card.remove();
      updateCount();
      add.focus();
      message.textContent = 'Funil removido da edição. Salve para confirmar.';
    });
    syncSummary();
    list.append(card);
    return name;
  }

  funnels.forEach(funnel => appendFunnel(funnel));
  updateCount();
  add.addEventListener('click', () => {
    appendFunnel({ name: '', description: '', status: 'draft', steps: [] }, true).focus();
    updateCount();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const draft = [...list.children].map(card => {
      const value = name => card.querySelector('[name="' + name + '"]').value.trim();
      return { name: value('name'), description: value('description'), status: value('status'),
        steps: value('steps').split('\n').map(step => step.trim()).filter(Boolean) };
    });
    const invalid = draft.findIndex(funnel => !funnel.name || funnel.steps.length > 20 ||
      funnel.steps.some(step => step.length > 100) || (funnel.status === 'ready' && !funnel.steps.length));
    if (invalid !== -1) {
      list.children[invalid].open = true;
      message.textContent = 'Confira o nome e os limites das etapas. Um funil pronto precisa ter pelo menos uma etapa.';
      return;
    }
    const controls = form.querySelectorAll('input, select, textarea, button');
    controls.forEach(control => { control.disabled = true; });
    message.textContent = 'Salvando funis…';
    try {
      const response = await fetch(endpoint, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funnels: draft, updatedAt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      updatedAt = data.updatedAt;
      message.textContent = 'Funis salvos com sucesso.';
    } catch (error) {
      message.textContent = error.message || 'Não foi possível salvar os funis.';
    } finally {
      controls.forEach(control => { control.disabled = false; });
      updateCount();
    }
  });
}
function fees() {
  queueMicrotask(loadFees);
  return heading('Taxas e condições', 'Configure regras de saque em reais e confira o valor líquido antes de salvar.') +
    notice('As regras salvas são usadas no simulador do painel. O saque real ainda não está integrado.') +
    '<div id="fee-settings" aria-busy="true"><p role="status">Carregando regras de taxas…</p></div>';
}

async function loadFees() {
  const region = $('#fee-settings');
  if (!region) return;
  const endpoint = '/api/admin/withdrawal-fees';
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    renderFeeSettings(region, endpoint, data);
  } catch (error) {
    region.textContent = error.message || 'Não foi possível carregar as taxas.';
  } finally {
    region.removeAttribute('aria-busy');
  }
}

function renderFeeSettings(region, endpoint, { rules, updatedAt }) {
  region.innerHTML = `<form class="fees-layout">
    <section class="card fee-panel">
      <h2>Regras de saque</h2>
      <p class="sub">Escolha um valor fixo ou percentual. As regras ativas que atendem às condições são somadas.</p>
      <div data-fee-list></div>
      <div class="actions">
        <button type="button" class="btn" data-add-fee>+ Nova taxa</button>
        <button type="submit" class="btn primary">Salvar regras</button>
      </div>
      <p role="status" data-fee-status></p>
    </section>
    <section class="card fee-panel fee-simulator">
      <h2>Simulador de saque</h2>
      <label>Valor solicitado (R$)<input name="simulateAmount" type="number" min="0" max="1000000" step="0.01" value="200"></label>
      <label>Tipo de saque<select name="simulateOccurrence"><option value="first">Primeiro saque</option><option value="repeat">Saque recorrente</option></select></label>
      <div data-fee-result aria-live="polite"></div>
    </section>
  </form>`;
  const form = region.querySelector('form');
  const list = form.querySelector('[data-fee-list]');
  const status = form.querySelector('[data-fee-status]');
  const add = form.querySelector('[data-add-fee]');
  const saveButton = form.querySelector('[type=submit]');
  const fields = () => [...list.querySelectorAll('fieldset')];
  const cents = input => Math.round(input.valueAsNumber * 100);
  const read = field => {
    const get = name => field.querySelector('[name="' + name + '"]');
    return {
      label: get('label').value.trim(), enabled: get('enabled').checked,
      type: get('type').value, value: cents(get('value')), occurrence: get('occurrence').value,
      min: cents(get('min')), max: get('max').value === '' ? null : cents(get('max'))
    };
  };
  function simulate() {
    const amount = cents(form.elements.simulateAmount);
    const occurrence = form.elements.simulateOccurrence.value;
    const result = form.querySelector('[data-fee-result]');
    add.disabled = fields().length >= 20 || saveButton.disabled;
    if (!form.elements.simulateAmount.validity.valid || !Number.isFinite(amount)) {
      result.textContent = 'Informe um valor válido para simular.';
      return;
    }
    const applicable = fields().map(read).filter(rule => rule.enabled && rule.value > 0 &&
      (rule.occurrence === 'all' || rule.occurrence === occurrence) &&
      amount >= rule.min && (rule.max === null || amount <= rule.max));
    let remaining = amount;
    const applied = applicable.map(rule => {
      const value = Math.min(remaining, rule.type === 'fixed' ? rule.value : Math.round(amount * rule.value / 10000));
      remaining -= value;
      return { ...rule, value };
    }).filter(rule => rule.value > 0);
    result.innerHTML = applied.map(rule => detail(esc(rule.label || 'Taxa sem nome'), money(rule.value / 100))).join('') +
      detail('Total de taxas', money((amount - remaining) / 100)) +
      detail('Líquido a receber', money(remaining / 100));
  }

  function appendRule(rule) {
    const field = document.createElement('fieldset');
    field.className = 'fee-rule';
    field.innerHTML = `<legend>Regra de saque</legend>
      <div class="fee-rule-header">
        <label><input name="enabled" type="checkbox" ${rule.enabled ? 'checked' : ''}> Ativa</label>
        <button type="button" class="btn" data-remove-fee>Remover</button>
      </div>
      <div class="fee-fields">
        <label>Nome da taxa<input name="label" required maxlength="80" value="${esc(rule.label)}"></label>
        <label>Tipo<select name="type"><option value="fixed">Fixa (R$)</option><option value="percent">Percentual (%)</option></select></label>
        <label><span data-value-label>Valor</span><input name="value" type="number" min="0" step="0.01" required value="${rule.value / 100}"></label>
        <label>Quando aplicar<select name="occurrence"><option value="all">Todos os saques</option><option value="first">Primeiro saque</option><option value="repeat">Saques recorrentes</option></select></label>
        <label>Saque mínimo (R$)<input name="min" type="number" min="0" max="1000000" step="0.01" required value="${rule.min / 100}"></label>
        <label>Saque máximo (R$)<input name="max" type="number" min="0" max="1000000" step="0.01" placeholder="Sem máximo" value="${rule.max === null ? '' : rule.max / 100}"></label>
      </div>`;
    const type = field.querySelector('[name=type]');
    type.value = rule.type;
    field.querySelector('[name=occurrence]').value = rule.occurrence;
    const syncType = () => {
      const percent = type.value === 'percent';
      field.querySelector('[data-value-label]').textContent = percent ? 'Percentual (%)' : 'Valor (R$)';
      field.querySelector('[name=value]').max = percent ? 100 : 1000000;
    };
    syncType();
    type.addEventListener('input', syncType);
    field.querySelector('[data-remove-fee]').addEventListener('click', () => {
      field.remove();
      simulate();
      add.focus();
    });
    list.append(field);
    return field;
  }

  rules.forEach(appendRule);
  add.addEventListener('click', () => {
    appendRule({ label: '', enabled: false, type: 'fixed', value: 0, occurrence: 'all', min: 0, max: null })
      .querySelector('[name=label]').focus();
    simulate();
  });
  form.addEventListener('input', simulate);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const draft = fields().map(read);
    if (draft.some(rule => !rule.label || (rule.max !== null && rule.max < rule.min))) {
      status.textContent = 'Confira o nome e a faixa de valores de cada regra.';
      return;
    }
    const editable = form.querySelectorAll('input, select, button');
    editable.forEach(control => { control.disabled = true; });
    status.textContent = 'Salvando regras…';
    try {
      const response = await fetch(endpoint, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: draft, updatedAt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      updatedAt = data.updatedAt;
      status.textContent = 'Regras salvas com sucesso.';
    } catch (error) {
      status.textContent = error.message || 'Não foi possível salvar as regras.';
    } finally {
      editable.forEach(control => { control.disabled = false; });
      simulate();
    }
  });
  simulate();
}
function dashboardShortcuts() {
  const withdrawals = transactions.filter(t => t.type === 'Saque PIX' && (state.payments[t.id] || t.status) === 'Em análise').length;
  const accounts = users.filter(u => u.kyc === 'Pendente').length;
  const shortcuts = [
    ['queue', 'clock', 'Central de pendências', (withdrawals + accounts) + ' itens para revisar'],
    ['users', 'users', 'Usuários', 'Cadastros e situação das contas'],
    ['gateways', 'gateway', 'Gateways', state.activeGateway ? gatewayName(state.activeGateway) + ' selecionado' : 'Selecionar provedor']
  ];
  return `<nav class="dashboard-shortcuts" aria-label="Atalhos de operação">${shortcuts.map(([route, glyph, title, description]) =>
    `<a href="#${route}" data-nav="${route}"><span class="shortcut-icon">${icon(glyph)}</span><span><strong>${title}</strong><small>${esc(description)}</small></span><span class="shortcut-arrow" aria-hidden="true">${icon('arrow')}</span></a>`
  ).join('')}</nav>`;
}
function dashboard(){return heading('Dashboard','Visão consolidada da operação. Tudo que importa, em um só lugar.',`<select id="period" aria-label="Período"><option>Últimos 30 dias</option><option>Últimos 7 dias</option><option>Hoje</option></select>${btn('Exportar relatório','export','download')}`)+notice('<b>Ambiente de demonstração.</b> Indicadores e usuários fictícios. As ações deste painel não alteram saldos ou pagamentos reais.')+dashboardShortcuts()+`<div class="metrics">${metric('Depósitos',money(128450),'pay','<span>▲ 12,4%</span> vs. período anterior · ilustrativo')}${metric('Saques',money(82300),'wallet','<span>▲ 8,9%</span> vs. período anterior · ilustrativo')}${metric('Usuários ativos','1.284','users','<span>▲ 5,7%</span> vs. período anterior · ilustrativo')}${metric('Receita líquida',money(18420),'report','<span>▲ 14,2%</span> vs. período anterior · ilustrativo')}</div><div class="grid">${card('Evolução financeira',chart(),`<span class="chart-total"><small>Receita líquida no período</small><strong>${money(18420)}</strong></span>`)}${card('Status dos pagamentos',`<div class="donut-wrap"><div class="donut"><div><b>2.874</b><small>transações de exemplo</small></div></div><div class="donut-legend"><span>Aprovados<b>82,0%</b></span><span>Em análise<b>12,0%</b></span><span>Recusados<b>6,0%</b></span></div></div>`)}</div><div class="grid">${card('Atividades recentes',table(['Data e hora','Usuário','Operação','Valor','Status'],users.slice(0,5).map((u,i)=>[`10 nov 2026 · 14:${27-i*4}`,person(u),i%2?'Saque PIX':'Depósito PIX',money(100+i*125),status(i%2?'Em análise':'Aprovado')])),`<button class="textlink" data-nav="wallets">Ver transações →</button>`)}${card('Central de aprovações',`<div class="pad pending">${badge('Acompanhamento','amber')}<b>${transactions.filter(t=>(state.payments[t.id]||t.status)==='Em análise').length}</b><p>Solicitações ilustrativas aguardando revisão.</p>${btn('Revisar solicitações','queue','arrow','primary')}${detail('Gateway selecionado',state.activeGateway?gatewayName(state.activeGateway):'Nenhum')}<button class="textlink" data-nav="gateways">Gerenciar gateways →</button></div>`)}</div>`}
function pendingQueue(){
  const verification = tab === 'Verificação';
  const withdrawals = transactions.filter(t => t.type === 'Saque PIX' && (state.payments[t.id] || t.status) === 'Em análise');
  const accounts = users.filter(u => u.kyc === 'Pendente');
  const items = verification ? accounts.map(u => ({
    title: u.name, description: 'Cadastro #' + u.id, value: 'KYC pendente', action: 'user:' + u.id
  })) : withdrawals.map(t => ({
    title: t.user.name, description: t.id + ' · Saque PIX', value: money(t.value), action: 'payment:' + t.id
  }));
  return heading('Central de pendências','Revise saques e consulte cadastros que aguardam verificação.') +
    `<div class="tabs">
      <button type="button" data-tab="Saques" class="${verification?'':'active'}" aria-pressed="${!verification}">Saques · ${withdrawals.length}</button>
      <button type="button" data-tab="Verificação" class="${verification?'active':''}" aria-pressed="${verification}">Verificação · ${accounts.length}</button>
    </div><div class="queue-grid">${items.length ? items.map(item => `
      <article class="card queue-item">
        <div><h2>${esc(item.title)}</h2><p class="sub">${esc(item.description)}</p></div>
        <strong>${esc(item.value)}</strong>
        ${btn(verification ? 'Consultar cadastro' : 'Revisar saque',item.action,'eye','primary')}
      </article>`).join('') : '<p class="empty">Nenhuma pendência nesta fila.</p>'}</div>`;
}
function usersView(){const all=users.filter(u=>(u.name+u.id+u.email).toLowerCase().includes(query.toLowerCase())&&(!filter||(state.userStatus[u.id]||u.status)===filter));return heading('Usuários','Cadastros, verificação e gestão de contas.',btn('Novo usuário','new-user','plus','primary'))+`<div class="operation-layout"><section class="card">${toolbar('Buscar por nome, ID ou e-mail…',['Ativo','Suspenso','Bloqueado','Inativo'])}${table(['Usuário','E-mail','Cadastro','Verificação','Status','Ações'],all.slice((page-1)*perPage,page*perPage).map(u=>[person(u),u.email,u.date,status(u.kyc),status(state.userStatus[u.id]||u.status),eye('user:'+u.id,'Ver '+u.name)]))}${pagination(all.length)}</section><aside class="card context-card"><div class="card-head"><h2>Perfil selecionado</h2>${badge('Prévia','amber')}</div><div class="pad"><div class="profile-preview">${person(all[(page-1)*perPage]||users[0])}</div><div class="tabs small-tabs"><span class="active">Dados</span><span>KYC</span><span>Histórico</span></div>${detail('CPF mascarado','***.382.***-**')}${detail('E-mail',(all[(page-1)*perPage]||users[0]).email)}${detail('Cadastro',(all[(page-1)*perPage]||users[0]).date)}${detail('Verificação',status((all[(page-1)*perPage]||users[0]).kyc))}<h3 class="context-label">Controles da conta</h3><p class="form-note">Abra o perfil para revisar os dados e registrar uma alteração com justificativa.</p>${btn('Gerenciar usuário','user:'+(all[(page-1)*perPage]||users[0]).id,'users','primary')}</div></aside></div>`}
function wallets(){const all=transactions.filter(t=>(t.id+t.user.name+t.type).toLowerCase().includes(query.toLowerCase())&&(!filter||t.status===filter));return heading('Carteiras e transações','Movimentações, ajustes auditados e conciliação.',btn('Solicitar ajuste','adjust','plus','primary'))+notice('Carteiras demonstrativas. Ajustes são registrados no histórico local e não alteram dinheiro real.')+`<div class="metrics">${metric('Saldo ilustrativo',money(42680),'wallet')}${metric('Entradas',money(128450),'pay')}${metric('Saídas',money(82300),'pay')}${metric('Ajustes solicitados',state.audit.filter(a=>a.action==='Ajuste solicitado').length,'audit')}</div><div class="operation-layout"><section class="card">${toolbar('Buscar transação, usuário ou tipo…',['Aprovado','Em análise'])}${table(['ID / Data','Usuário','Tipo','Valor','Status','Ações'],all.slice((page-1)*perPage,page*perPage).map(t=>[`${t.id}<br><small class="sub">10/11/2026 · 14:27</small>`,person(t.user),t.type,money(t.value),status(t.status),eye('transaction:'+t.id)]))}${pagination(all.length)}</section><aside class="card context-card"><div class="card-head"><h2>Aprovação e conciliação</h2></div><div class="pad">${detail('Pendências ilustrativas',badge('12','amber'))}${detail('Ajustes solicitados',String(state.audit.filter(a=>a.action==='Ajuste solicitado').length))}<br>${btn('Ver fila de aprovações','queue','arrow','primary')}<div class="context-divider"></div><h3>Ajuste de carteira</h3><form data-form="adjust"><label class="form-field">Usuário<select name="user">${users.map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}</select></label><div class="form-grid"><label class="form-field">Valor (BRL)<input name="amount" type="number" min="0.01" step="0.01" placeholder="0,00" required></label><label class="form-field">Tipo<select name="type"><option>Crédito demonstrativo</option><option>Débito demonstrativo</option></select></label></div><label class="form-field">Motivo obrigatório<textarea name="reason" maxlength="300" required placeholder="Informe o motivo do ajuste"></textarea></label><label class="check"><input type="checkbox" required> Ciente de que este ajuste é demonstrativo.</label>${btn('Solicitar ajuste','submit','check','primary')}</form></div></aside></div>`}
function payments(){const current=tab||'Saques',all=transactions.filter(t=>current==='Conciliação'||(current==='Saques'?t.type==='Saque PIX':t.type==='Depósito PIX')).filter(t=>(t.id+t.user.name).toLowerCase().includes(query.toLowerCase())&&(!filter||(state.payments[t.id]||t.status)===filter));return heading('Depósitos e saques','Acompanhe solicitações e registre decisões de demonstração.',btn('Exportar fila','export','download'))+`<div class="metrics">${metric('Volume ilustrativo',money(76420),'wallet')}${metric('Em análise',transactions.filter(t=>(state.payments[t.id]||t.status)==='Em análise').length,'clock')}${metric('Revisões registradas',Object.keys(state.payments).length,'check')}${metric('Gateway selecionado',state.activeGateway?gatewayName(state.activeGateway):'Nenhum','gateway','Seleção local · sem conexão financeira')}</div><div class="tabs">${['Depósitos','Saques','Conciliação'].map(x=>`<button data-tab="${x}" class="${current===x?'active':''}">${x}</button>`).join('')}</div><div class="operation-layout payment-layout"><section class="card">${toolbar('Buscar ID ou usuário…',['Em análise','Aprovado','Recusado'])}${table(['Solicitação','Usuário','Método','Valor','Verificação','Situação','Ações'],all.slice((page-1)*perPage,page*perPage).map(t=>[t.id,person(t.user),'PIX · ***.789-**',money(t.value),status(t.user.kyc),status(state.payments[t.id]||t.status),eye('payment:'+t.id,'Revisar '+t.id)]))}${pagination(all.length)}</section><aside class="card context-card payment-context"><div class="card-head"><div><h2>Revisar solicitação</h2><p class="sub">${(all[0]||transactions[0]).id}</p></div>${badge('Demonstração','amber')}</div><div class="pad">${person((all[0]||transactions[0]).user)}<div class="review-value"><small>Valor solicitado</small><b>${money((all[0]||transactions[0]).value)}</b></div>${detail('Método','PIX')}${detail('Chave mascarada','***.456.789-**')}${detail('Verificação',status((all[0]||transactions[0]).user.kyc))}<h3 class="context-label">Checklist de análise</h3><div class="review-check">${icon('check')} Titularidade da conta</div><div class="review-check">${icon('check')} Documentos e dados cadastrais</div><div class="review-check">${icon('check')} Registro da decisão</div><p class="form-note">Confira a solicitação completa antes de registrar uma decisão demonstrativa.</p>${btn('Abrir revisão detalhada','payment:'+(all[0]||transactions[0]).id,'eye','primary')}</div></aside></div>`}
const gatewayName=id=>id==='pixup'?'PixUp':'Dotfy';
function pixupSettings() {
  return `<section class="gateway-test"><div class="gateway-test-title"><h3>Configurações Pixup</h3><span>PIX · BRL</span></div>
    <p class="form-note" role="status" id="pixup-settings-status">Consultando configuração…</p>
    <form id="pixup-settings-form" hidden autocomplete="off">
      <label class="form-field">Client ID<input name="clientId" required maxlength="256" spellcheck="false"></label>
      <label class="form-field">Client Secret<input name="secret" type="password" required maxlength="512" spellcheck="false" autocomplete="new-password"></label>
      <p class="form-note">As credenciais são criptografadas no servidor.</p>
      <button type="submit" class="btn primary">Salvar credenciais</button>
    </form>
    <button id="pixup-check-connection" type="button" class="btn" hidden>Testar conexão e consultar saldo</button>
  </section>`;
}
async function mountPixupSettings() {
  const status = document.querySelector('#pixup-settings-status');
  const form = document.querySelector('#pixup-settings-form');
  const test = document.querySelector('#pixup-check-connection');
  if (!status || !form || !test) return;
  const saveButton = form.querySelector('button');
  const call = async (method, body) => {
    const response = await fetch('/api/admin/gateways/pixup', {
      method, ...(body ? { headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) } : {})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Pixup indisponível.');
    return data;
  };
  try {
    const config = await call('GET');
    status.textContent = config.configured ? 'Credenciais cadastradas. Teste a conexão.' : 'Informe as credenciais da sua conta Pixup.';
    form.hidden = false;
    test.hidden = !config.configured;
  } catch (error) {
    status.textContent = error.message;
    return;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    saveButton.disabled = test.disabled = true;
    try {
      const data = await call('PUT', { id: form.elements.clientId.value.trim(), secret: form.elements.secret.value.trim() });
      form.reset();
      test.hidden = false;
      status.textContent = data.message;
    } catch (error) {
      status.textContent = error.message;
    } finally {
      saveButton.disabled = test.disabled = false;
    }
  });
  test.addEventListener('click', async () => {
    saveButton.disabled = test.disabled = true;
    status.textContent = 'Testando conexão Pixup…';
    try {
      const data = await call('POST');
      status.textContent = data.availableBRL === null ? data.message : data.message + ' Disponível: ' + money(data.availableBRL);
    } catch (error) {
      status.textContent = error.message;
    } finally {
      saveButton.disabled = test.disabled = false;
    }
  });
}

let pixBackendStatus;
function renderPixBackend() {
  const region = document.querySelector('#pixBackendStatus');
  if (!region) return;
  if (pixBackendStatus) {
    region.textContent = pixBackendStatus;
    return;
  }
  fetch('/api/pix/deposits', { cache: 'no-store' }).then(response => {
    if (!response.ok) throw new Error('Status indisponível');
    return response.json();
  }).then(data => {
    pixBackendStatus = data.providers.map(provider => provider.name + ': ' + provider.status).join(' · ') +
      ' · Moeda: ' + data.currency + ' · Crédito em carteira: desativado.';
    region.textContent = pixBackendStatus;
  }).catch(() => {
    region.textContent = 'Status dos gateways indisponível. Reabra esta área para tentar novamente.';
  });
}
function gateways(){queueMicrotask(renderPixBackend);return heading('Gateways e integrações','Escolha o provedor de pagamento e organize suas configurações.',btn('Histórico de alterações','gateway-history','audit'))+card('Backend de depósitos Pix','<div class="pad"><p id="pixBackendStatus" role="status">Consultando integração…</p></div>')+notice('<b>Seleção demonstrativa, salva neste navegador.</b> PixUp e Dotfy ainda não estão conectados à API. Não informe chaves secretas nesta prévia. A operação real depende de integração no servidor.')+`<section class="card active-route"><span class="tile-icon">${icon('gateway')}</span><div><h2>${state.activeGateway?'Gateway selecionado: '+gatewayName(state.activeGateway):'Selecione seu gateway principal'}</h2><p>${state.activeGateway?'Preferência local de demonstração. Nenhuma cobrança real é criada.':'Escolha uma das opções abaixo. Apenas um provedor pode ficar selecionado.'}</p></div>${badge(state.activeGateway?'Seleção ativa · demo':'Sem seleção',state.activeGateway?'amber':'gray')}</section><div class="grid equal">${['pixup','dotfy'].map(id=>`<section class="card gateway ${state.activeGateway===id?'selected':''}"><div class="gateway-top"><div class="gateway-logo ${id}"><img src="/admin/assets/${id==='pixup'?'pixup.png':'dotfy.svg'}" alt="${gatewayName(id)}"></div><span class="radio" aria-label="${state.activeGateway===id?'Selecionado':'Não selecionado'}"></span></div><div><h2>${gatewayName(id)}</h2><p>${esc(state.aliases[id])}</p><div class="actions">${badge(state.activeGateway===id?'Selecionado na demonstração':'Disponível para seleção',state.activeGateway===id?'amber':'gray')}${badge('API não conectada')}</div></div><div class="gateway-spec"><div><small>Ambiente</small><b>Demonstração local</b></div><div><small>Método previsto</small><b>PIX</b></div><div><small>Credenciais</small><b>Não configuradas</b></div><div><small>Webhooks</small><b>Aguardando integração</b></div></div><div class="actions">${btn('Configurar','gateway-config:'+id,'settings')}${state.activeGateway===id?btn('Remover seleção','gateway-off'):btn('Selecionar gateway','gateway-select:'+id,'check','primary')}</div></section>`).join('')}</div><div class="grid">${card('Como funciona a seleção',`<div class="pad">${[['gateway','Um gateway por vez','Selecionar outro provedor substitui a preferência anterior.'],['shield','Integração segura no servidor','Credenciais e callbacks devem ser tratados no backend.'],['audit','Histórico de alterações','Cada troca é registrada na auditoria demonstrativa.']].map(x=>`<div class="activity"><span class="tile-icon">${icon(x[0])}</span><div><b>${x[1]}</b><p>${x[2]}</p></div></div>`).join('')}</div>`)}${card('Status da integração',`<div class="pad">${detail('Provedor selecionado',state.activeGateway?gatewayName(state.activeGateway):'Nenhum')}${detail('Conexão',badge('Não integrada'))}${detail('Último webhook','—')}${detail('Pagamentos reais',badge('Desabilitados'))}</div>`)}</div>`}
function risk(){return heading('Verificação e risco','Análise humana, limites e jogo responsável.',btn('Exportar dados','export','download'))+notice('Documentos e verificações fictícios. Não envie documentos pessoais reais para esta demonstração.')+`<div class="grid">${card('Fila de verificação (KYC)',table(['Usuário','Documento','Estado','Ações'],users.slice(0,6).map(u=>[person(u),'***.321.654-**',status(u.kyc),btn('Analisar','user:'+u.id,'eye')])))}${card('Limites e controles',`<div class="pad"><form data-form="limits"><label class="form-field">Limite de depósito diário (BRL)<input name="deposit" type="number" min="0" value="${state.limits?.deposit||2000}" required></label><label class="form-field">Limite de saque diário (BRL)<input name="withdraw" type="number" min="0" value="${state.limits?.withdraw||5000}" required></label><label class="check"><input type="checkbox" checked> Revisão humana dos alertas</label>${btn('Salvar limites','submit','','primary')}</form></div>`)}</div><div class="grid equal">${card('Alertas para revisão',`<div class="pad">${['Dados cadastrais divergentes','Tentativas de acesso repetidas','Verificação de titularidade pendente'].map(x=>`<div class="activity"><span class="tile-icon">${icon('shield')}</span><div><b>${x}</b><p>Exemplo fictício · análise humana necessária</p></div>${badge('Revisar','amber')}</div>`).join('')}</div>`)}${card('Jogo responsável',`<div class="pad">${detail('Solicitações de autoexclusão','5 exemplos')}${detail('Limites definidos pelo usuário','18 exemplos')}${detail('Pausa da conta','Disponível no perfil')}<br>${btn('Abrir usuário para revisão','user:'+users[0].id,'users')}</div>`)}</div>`}
function gamesView(){const all=games.map((name,i)=>({name,i})).filter(g=>g.name.toLowerCase().includes(query.toLowerCase())&&(!filter||(state.games[g.i]||'Visível')===filter));return heading('Jogos e provedores','Catálogo PG SOFT, organização e disponibilidade na prévia.',btn('Saúde da integração','game-health','gateway'))+notice('A visibilidade abaixo altera somente a demonstração do admin. O catálogo público é independente. Os clientes de jogos ainda estão em validação.')+`<section class="card">${toolbar('Buscar jogo PG SOFT…',['Visível','Oculto'])}<div class="pad"><div class="actions">${badge('PG SOFT','amber')}${badge('11 clientes no projeto')}${badge('Demonstração')}</div><div class="game-grid">${all.slice(0,4).map(g=>`<article class="game-card"><img src="/assets/pg-icon-${12+g.i}.webp" alt="${g.name}"><b>${g.name}</b><small>PG SOFT</small></article>`).join('')}</div></div>${table(['Jogo','Provedor','Categoria','Visibilidade local','Ações'],all.map(g=>[`<div class="person"><img class="mini-cover" src="/assets/pg-icon-${12+g.i}.webp" alt=""><b>${g.name}</b></div>`,'PG SOFT','Slots',status(state.games[g.i]||'Visível'),btn(state.games[g.i]==='Oculto'?'Mostrar':'Ocultar','game-toggle:'+g.i,'eye')]))}</section>`}
function banners(){const all=[{name:'Seu depósito vale mais',status:'Publicado'},...state.campaigns];return heading('Banners e promoções','Planeje campanhas, pré-visualize artes e organize publicações.',btn('Nova campanha','new-campaign','plus','primary'))+`<div class="grid equal">${card('Prévia do banner',`<div class="pad"><div class="banner-preview"><img src="/assets/deposit-rewards-complete.webp" alt="Seu depósito vale mais"></div><p class="form-note">Prévia ilustrativa. Novas campanhas ficam somente neste painel.</p>${btn('Criar variação','new-campaign','plus')}</div>`)}${card('Campanhas cadastradas',`<div class="pad">${all.map(c=>`<div class="campaign"><img src="/assets/deposit-rewards-complete.webp" alt=""><div><b>${esc(c.name)}</b><small>${esc(c.start||'Campanha de exemplo')} · ${esc(c.end||'sem término')}</small></div>${status(c.status)}</div>`).join('')}</div>`)}</div><div class="grid equal">${card('Regras e condições',`<div class="pad">${detail('Carteira de bônus','Separada do saldo disponível')}${detail('Condições','Exibir antes da participação')}${detail('Publicação','Somente demonstrativa')}</div>`)}${card('Agenda de campanhas',`<div class="pad"><p class="sub">Defina início e término ao criar campanhas. O agendamento real depende de integração no servidor.</p><br>${btn('Criar rascunho agendado','new-campaign','clock','primary')}</div>`)}</div>`}
function affiliates(){return heading('Afiliados e comissões','Parceiros, atribuição de indicações e revisão de repasses.',btn('Exportar relatório','export','download'))+`<div class="metrics">${metric('Parceiros ativos','328','affiliate')}${metric('Indicações','2.947','users')}${metric('Comissões ilustrativas',money(24860.5),'wallet')}${metric('Em revisão','12','clock')}</div><div class="grid">${card('Parceiros cadastrados',table(['Parceiro','Código','Indicações','Comissão','Ações'],users.slice(0,6).map((u,i)=>[person(u),'BLZ'+u.id,412-i*43,money(6230-i*621),eye('partner:'+u.id)])))}${card('Regras de comissão',`<div class="pad"><form data-form="commission"><label class="form-field">Modelo<select name="model"><option>Receita líquida elegível</option><option>CPA (cadastro qualificado)</option></select></label><label class="form-field">Percentual demonstrativo (%)<input type="number" name="rate" min="0" max="100" value="${state.commission?.rate||10}" required></label><p class="form-note">Nenhum repasse é realizado neste painel.</p>${btn('Salvar regra','submit','','primary')}</form></div>`)}</div>${card('Atribuição de indicações',chart(),badge('Dados ilustrativos'))}`}
function reports(){return heading('Relatórios e análises','Indicadores financeiros e operacionais para acompanhar a plataforma.',btn('Exportar CSV','export','download'))+notice('Os arquivos exportados contêm somente os dados ilustrativos do painel.')+`<div class="metrics">${metric('Receita bruta',money(542890),'report')}${metric('Depósitos',money(128450),'pay')}${metric('Saques',money(82300),'wallet')}${metric('Sessões ilustrativas','24.817','games')}</div><div class="grid">${card('Receita e depósitos',chart())}${card('Desempenho por provedor',table(['Provedor','Sessões','Estado'],[['PG SOFT','51.238',badge('Em validação','amber')],['Pragmatic Play','18.241',badge('Sem integração')],['Evolution','7.894',badge('Sem integração')]]))}</div>${card('Relatórios disponíveis',[['Financeiro consolidado','Movimentações e estados de pagamento','transactions'],['Usuários e verificações','Cadastros fictícios e KYC','users'],['Auditoria administrativa','Ações locais realizadas neste painel','audit']].map(r=>`<div class="report"><span class="tile-icon">${icon('report')}</span><div><b>${r[0]}</b><p>${r[1]}</p></div>${btn('Baixar CSV','report:'+r[2],'download')}</div>`).join(''))}`}
function support(){return heading('Central de suporte','Organize atendimentos, responsáveis e respostas.',btn('Nova solicitação','new-ticket','plus','primary'))+`<div class="tabs">${['Todos','Em aberto','Respondido','Resolvido'].map(t=>`<button data-tab="${t}" class="${(tab||'Todos')===t?'active':''}">${t}</button>`).join('')}</div><section class="card ticket-layout"><div class="ticket-list">${tickets.map((t,i)=>tab&&tab!=='Todos'&&tab!==(state.tickets[i]?.status||'Em aberto')?'':`<button class="ticket-item ${i===ticket?'active':''}" data-ticket="${i}"><b>#${2817-i} · ${t[0]}</b><small>${t[1]} · ${state.tickets[i]?.status||'Em aberto'}</small></button>`).join('')}</div><div class="conversation"><div class="actions"><h2>#${2817-ticket} · ${tickets[ticket][0]}</h2>${status(state.tickets[ticket]?.status||'Em aberto')}</div><div class="bubble"><small>${tickets[ticket][1]} · mensagem de exemplo</small>Olá! Preciso de ajuda com ${tickets[ticket][0].toLowerCase()}. Poderia verificar minha solicitação?</div>${(state.tickets[ticket]?.replies||[]).map(r=>`<div class="bubble reply"><small>Admin · resposta local</small>${esc(r)}</div>`).join('')}<form class="composer" data-form="reply"><label class="form-field">Sua resposta<textarea name="reply" required maxlength="1000" placeholder="Escreva uma resposta demonstrativa…"></textarea></label><div class="actions">${btn('Enviar resposta','submit','arrow','primary')}${btn('Resolver ticket','resolve-ticket','check')}</div></form></div><aside class="ticket-context"><h3>Contexto do usuário</h3>${detail('Nome',tickets[ticket][1])}${detail('Prioridade',badge(tickets[ticket][2],'amber'))}${detail('Ambiente','Demonstração')}<p class="form-note">As respostas ficam somente neste navegador. Nenhuma mensagem é enviada.</p></aside></section>`}
function settings(){const tabs=['Geral','Identidade','Domínios e SEO','Equipe e permissões','Segurança','Notificações'];let content;if(settingsTab==='Equipe e permissões')content=card('Equipe e permissões',table(['Permissão','Administrador','Financeiro','Suporte','Conteúdo'],['Ver usuários','Aprovar saques','Editar banners','Gerenciar integrações'].map((p,i)=>[p,...[0,1,2,3].map(r=>`<span class="${r===0||i===0||(r===1&&i===1)||(r===3&&i===2)?'ok':'locked'}">${icon(r===0||i===0||(r===1&&i===1)||(r===3&&i===2)?'check':'lock')}</span>`)])))+'<br>'+card('Membros da equipe',table(['Nome','E-mail','Perfil','Estado'],[['Admin','admin@example.com',badge('Administrador'),badge('Demonstração','amber')],...state.team.map(t=>[esc(t.name),esc(t.email),badge(t.role),badge('Convite local')])]),btn('Convidar membro','invite','plus','primary'));else if(settingsTab==='Segurança')content=card('Segurança e sessões',`<div class="pad">${notice('Não existe autenticação administrativa conectada. Não use este painel para armazenar informações reais.')}<form data-form="security"><label class="switch"><span><b>Exigir autenticação em dois fatores</b><small>Preferência para a futura integração.</small></span><input name="twoFactor" type="checkbox" ${state.settings.twoFactor?'checked':''}></label>${detail('Controle real de sessões',badge('Não conectado'))}<br>${btn('Salvar preferência','submit','','primary')}</form></div>`);else if(settingsTab==='Notificações')content=card('Preferências de notificações',`<div class="pad"><form data-form="notifications">${['Saques pendentes','Falhas de integração','Tickets prioritários'].map((x,i)=>`<label class="switch"><span><b>${x}</b><small>Não envia e-mails ou push nesta prévia.</small></span><input name="n${i}" type="checkbox" ${state.notifications?.['n'+i]===false?'':'checked'}></label>`).join('')}<br>${btn('Salvar preferências','submit','','primary')}</form></div>`);else content=card(settingsTab,`<div class="pad"><form data-form="brand"><label class="form-field">Nome da plataforma<input name="brand" value="${esc(state.settings.brand)}" maxlength="40" required></label><label class="form-field">Cor principal<input name="color" type="color" value="${esc(/^#[a-f0-9]{6}$/i.test(state.settings.color)?state.settings.color:'#ff9900')}"></label><label class="form-field">Título SEO de exemplo<input name="seo" value="${esc(state.settings.seo||'BLITZ.BET | Jogos e promoções')}" maxlength="80"></label><p class="form-note">Somente preferências locais do admin. Não modifica a marca, o domínio ou o SEO da plataforma pública.</p>${btn('Salvar configurações','submit','','primary')}</form></div>`);return heading('Configurações e acessos','Identidade, equipe e preferências do workspace.')+`<div class="settings-layout"><aside class="card settings-nav">${tabs.map(t=>`<button data-settings="${t}" class="${settingsTab===t?'active':''}">${icon(t==='Segurança'?'shield':'settings')}${t}</button>`).join('')}</aside><div class="settings-content">${content}</div><aside class="settings-context"><section class="card"><div class="card-head"><h2>Identidade da marca</h2></div><div class="pad"><div class="identity-preview"><img src="/assets/blitz-logo.png" alt="BLITZ.BET"></div>${detail('Cor principal','<span class="color-dot"></span> #ff9900')}${detail('Workspace','BLITZ.BET ADMIN')}<button type="button" class="btn context-wide" data-settings="Identidade">${icon('settings')} Personalizar identidade</button></div></section><section class="card"><div class="card-head"><h2>Segurança</h2></div><div class="pad">${detail('Ambiente',badge('Demonstração','amber'))}${detail('Autenticação real',badge('Não conectada'))}${detail('Preferência 2FA',state.settings.twoFactor?'Obrigatória na prévia':'Opcional na prévia')}<button type="button" class="textlink" data-settings="Segurança">Gerenciar segurança →</button></div></section><section class="card"><div class="card-head"><h2>Auditoria</h2></div><div class="pad">${state.audit.length?state.audit.slice(0,3).map(a=>`<div class="audit-mini"><span class="audit-dot"></span><div><b>${esc(a.action)}</b><small>${new Date(a.date).toLocaleDateString('pt-BR')} · Admin demo</small></div></div>`).join(''):'<p class="form-note">Suas alterações locais aparecerão aqui.</p>'}<button type="button" class="textlink" data-nav="audit">Ver auditoria completa →</button></div></section></aside></div>`}
function audit(){const all=state.audit.filter(a=>(a.action+a.detail).toLowerCase().includes(query.toLowerCase()));return heading('Auditoria e logs','Acompanhe as alterações realizadas na demonstração.',btn('Exportar histórico','export','download'))+notice('Registro local demonstrativo. Não substitui auditoria protegida e persistida no servidor.')+`<section class="card"><div class="toolbar"><input id="filterSearch" placeholder="Buscar ação ou detalhe…" aria-label="Buscar na auditoria" value="${esc(query)}"></div>${table(['Data e hora','Administrador','Ação','Detalhes','Resultado'],all.slice((page-1)*perPage,page*perPage).map(a=>[new Date(a.date).toLocaleString('pt-BR'),'Admin · demonstração',esc(a.action),esc(a.detail),badge('Registrado','green')]))}${pagination(all.length)}</section>`}
function drawer(title,body){focusReturn=document.activeElement;$('#drawer').innerHTML=`<div class="drawer-head"><h2 id="drawerTitle">${title}</h2><button type="button" class="iconbtn" data-action="close-drawer" aria-label="Fechar painel">${icon('close')}</button></div><div class="drawer-body">${body}</div>`;if(!$('#drawer').open)$('#drawer').showModal()}
function confirm(title,text,action,label){focusReturn=document.activeElement;$('#confirm').innerHTML=`<span class="tile-icon">${icon('gateway')}</span><h2 id="confirmTitle">${title}</h2><p>${text}</p><div class="actions">${btn('Cancelar','close-confirm')}${btn(label,action,'check','primary')}</div>`;$('#confirm').showModal()}
function close(){if($('#drawer').open)$('#drawer').close();if($('#confirm').open)$('#confirm').close()}
function field(label,name,type='text',placeholder=''){return `<label class="form-field">${label}<input name="${name}" type="${type}" placeholder="${placeholder}" required maxlength="150"></label>`}const formEnd=text=>`<div class="actions">${btn('Cancelar','close-drawer')}${btn(text,'submit','check','primary')}</div></form>`;
function playerDemoForm(u) {
  const profile = state.playerDemo[u.id] || {};
  const pending = profile.pending;
  return `<section class="gateway-test">
    <h3>Gerenciar conta de demonstração</h3>
    <form data-demo-profile="${u.id}">
      <label class="form-field">Nome de exibição<input name="playerName" value="${esc(profile.name ?? u.name)}" maxlength="80" required></label>
      <label class="form-field">Saldo de demonstração (BRL)<input name="balance" type="number" min="0" max="1000000" step="0.01" value="${profile.balance ?? u.balance}" required></label>
      <label class="form-field">Observação interna<textarea name="notes" maxlength="300">${esc(profile.notes ?? '')}</textarea></label>
      <label><input type="checkbox" name="influencer" ${profile.influencer ? 'checked' : ''}> Marcar como influenciador</label>
      <p class="form-note">${profile.influencer ? 'Influenciador · Taxa de simulação R$ 0,00' : 'Jogador'}</p>
      <button class="btn primary" type="submit">Salvar perfil</button>
    </form>
    ${profile.influencer ? `<form data-demo-deposit="${u.id}">
      <label class="form-field">Valor do depósito simulado (BRL)<input name="amount" type="number" min="1" max="100000" step="0.01" value="80" required></label>
      <button class="btn" type="submit" ${pending ? 'disabled' : ''}>Gerar Pix de demonstração</button>
      <p role="status" class="form-note">${pending ? 'Pix de demonstração gerado · Aguardando confirmação simulada…' : profile.lastDeposit ? 'Último depósito: ' + money(profile.lastDeposit) + ' · Pago (simulação)' : 'A confirmação simulada ocorre em 7 segundos.'}</p>
    </form>` : ''}
    <p class="form-note">Demonstração local. Sem QR pagável, cobrança ou movimentação de saldo real.</p>
  </section>`;
}

let demoDepositTimer;
function processDemoDeposits() {
  clearTimeout(demoDepositTimer);
  let next = Infinity;
  for (const [id, profile] of Object.entries(state.playerDemo)) {
    const deposit = profile.pending;
    if (!deposit) continue;
    if (deposit.due > Date.now()) {
      next = Math.min(next, deposit.due);
      continue;
    }
    delete profile.pending;
    if (profile.influencer) {
      profile.balance = (Math.round(profile.balance * 100) + Math.round(deposit.amount * 100)) / 100;
      profile.lastDeposit = deposit.amount;
      save('Depósito simulado confirmado', '#' + id + ' · ' + money(deposit.amount));
    }
    if ($('#drawer').open && $('#drawer [data-demo-profile]')?.dataset.demoProfile === id) userDrawer(id);
  }
  if (Number.isFinite(next)) demoDepositTimer = setTimeout(processDemoDeposits, Math.max(0, next - Date.now()));
}

document.addEventListener('submit', event => {
  const form = event.target;
  if (!form.matches('[data-demo-profile], [data-demo-deposit]')) return;
  event.preventDefault();
  const id = form.dataset.demoProfile || form.dataset.demoDeposit;
  const user = users.find(user => user.id === Number(id));
  if (!user || !form.reportValidity()) return;
  const fields = new FormData(form);
  const previous = state.playerDemo[id] || {};
  if (form.hasAttribute('data-demo-profile')) {
    const name = String(fields.get('playerName')).trim();
    const balance = Number(fields.get('balance'));
    if (!name || !Number.isFinite(balance) || balance < 0 || balance > 1000000) return;
    const influencer = fields.has('influencer');
    state.playerDemo[id] = { ...previous, name, balance, influencer, notes: String(fields.get('notes')).trim() };
    if (!influencer) delete state.playerDemo[id].pending;
    save('Perfil de demonstração atualizado', '#' + id);
    render();
  } else {
    const amount = Number(fields.get('amount'));
    if (!previous.influencer || previous.pending || !Number.isFinite(amount) || amount < 1 || amount > 100000) return;
    previous.pending = { amount, due: Date.now() + 7000 };
    save('Depósito simulado iniciado', '#' + id + ' · ' + money(amount));
  }
  userDrawer(id);
  processDemoDeposits();
});
queueMicrotask(processDemoDeposits);

function userDrawer(id){const user=users.find(u=>u.id===+id);if(!user)return;const u={...user,...state.playerDemo[id]};drawer('Perfil do usuário',`<div class="drawer-user">${person(u)}</div>${status(state.userStatus[id]||u.status)}${detail('E-mail mascarado',u.email)}${detail('CPF mascarado','***.382.***-**')}${detail('Cadastro',u.date)}${detail('Verificação',status(u.kyc))}${detail('Saldo ilustrativo',money(u.balance))}${notice('Conta fictícia. As alterações ficam somente nesta demonstração.')}${playerDemoForm(u)}<label class="form-field">Motivo da alteração<textarea id="userReason" maxlength="300" placeholder="Motivo obrigatório"></textarea></label><div class="actions">${btn('Ativar','user-status:'+id+':Ativo','check')}${btn('Suspender','user-status:'+id+':Suspenso','shield')}${btn('Bloquear','user-status:'+id+':Bloqueado','lock','danger')}</div>`)}
function paymentDrawer(id){const t=transactions.find(t=>t.id===id);drawer('Revisar '+id,`<div class="drawer-user">${person(t.user)}</div>${detail('Valor',money(t.value))}${detail('Tipo',t.type)}${detail('Chave PIX mascarada','***.456.789-**')}${detail('Verificação',status(t.user.kyc))}${detail('Estado atual',status(state.payments[id]||t.status))}${notice('Revisão demonstrativa. Nenhuma decisão movimenta dinheiro ou contata o gateway.')}<label class="check"><input type="checkbox" id="reviewCheck"> Conferi os dados ilustrativos e a titularidade.</label><label class="form-field">Motivo da decisão<textarea id="reviewReason" maxlength="300" placeholder="Motivo obrigatório"></textarea></label><div class="actions">${btn('Aprovar na demo','payment-status:'+id+':Aprovado','check','primary')}${btn('Recusar na demo','payment-status:'+id+':Recusado','close','danger')}</div>`)}
function exportCSV(kind){let rows;if(kind==='audit'||view==='audit')rows=[['Data','Administrador','Ação','Detalhes'],...state.audit.map(a=>[a.date,'Admin demo',a.action,a.detail])];else if(kind==='users'||view==='users')rows=[['ID','Nome fictício','Email mascarado','Verificação','Status'],...users.map(u=>[u.id,u.name,u.email,u.kyc,state.userStatus[u.id]||u.status])];else if(view==='affiliates')rows=[['Parceiro fictício','Código','Indicações','Comissão ilustrativa'],...users.slice(0,6).map((u,i)=>[u.name,'BLZ'+u.id,412-i*43,6230-i*621])];else rows=[['ID','Usuário fictício','Tipo','Valor BRL','Estado'],...transactions.map(t=>[t.id,t.user.name,t.type,t.value,state.payments[t.id]||t.status])];const csv='\uFEFF'+rows.map(r=>r.map(x=>'"'+String(x).replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"').join(';')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`blitz-${kind||view}-demonstracao.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('CSV de demonstração exportado.');}
function act(a){const [name,id,value]=a.split(':');switch(name){case 'conversion-edit': {
  const row = state.conversions[Number(id)];
  const form = $('#conversion-form');
  if (!row || !form) break;
  for (const [key, value] of Object.entries(row)) form.elements.namedItem(key).value = value;
  form.dataset.editing = id;
  form.elements.funnel.focus();
  break;
}case 'close-drawer':$('#drawer').close();break;case 'close-confirm':$('#confirm').close();break;case 'prev':page=Math.max(1,page-1);render();break;case 'next':page++;render();break;case 'export':exportCSV();break;case 'report':exportCSV(id);break;case 'queue':go('queue');break;case 'user':userDrawer(id);break;case 'user-status':{const reason=$('#userReason').value.trim();if(!reason)return toast('Informe o motivo da alteração.');state.userStatus[id]=value;save('Estado do usuário alterado',`#${id}: ${value}. ${reason}`);close();render();toast('Estado atualizado na demonstração.');break;}case 'payment':paymentDrawer(id);break;case 'payment-status':{const reason=$('#reviewReason').value.trim();if(!reason||!$('#reviewCheck').checked)return toast('Confira os dados e preencha o motivo.');state.payments[id]=value;save('Revisão de pagamento',`${id}: ${value}. ${reason}`);close();render();toast('Decisão registrada na demo. Nenhum pagamento realizado.');break;}case 'transaction':{const t=transactions.find(t=>t.id===id);drawer('Detalhes da transação',`<h3>${id}</h3>${person(t.user)}${detail('Tipo',t.type)}${detail('Valor ilustrativo',money(t.value))}${detail('Estado',status(state.payments[id]||t.status))}${notice('Transação fictícia, sem movimentação bancária real.')}`);break;}
case 'gateway-select':confirm('Selecionar '+gatewayName(id)+'?',`A seleção atual (${state.activeGateway?gatewayName(state.activeGateway):'nenhuma'}) será substituída. A preferência será salva neste navegador, apenas para demonstração. As APIs continuam desconectadas.`,'gateway-activate:'+id,'Selecionar na demo');break;case 'gateway-activate':if(!['pixup','dotfy'].includes(id))return;{const old=state.activeGateway;state.activeGateway=id;save('Gateway selecionado',`${old||'Nenhum'} → ${id} (demonstração)`);close();render();toast(gatewayName(id)+' selecionado. API ainda não conectada.');break;}case 'gateway-off':confirm('Remover seleção do gateway?','A demonstração ficará sem gateway principal. Nenhum pagamento real será afetado.','gateway-disable','Remover seleção');break;case 'gateway-disable':state.activeGateway=null;save('Seleção de gateway removida','Nenhum selecionado');close();render();toast('Seleção removida.');break;case 'gateway-history':go('audit');break;
case 'gateway-config':drawer('Configurar '+gatewayName(id),`<div class="gateway-logo ${id}"><img src="/admin/assets/${id==='pixup'?'pixup.png':'dotfy.svg'}" alt="${gatewayName(id)}"></div><form class="gateway-settings" data-form="gateway" data-gateway="${id}"><label class="form-field">Nome da configuração<input name="alias" value="${esc(state.aliases[id])}" maxlength="60" required></label>${formEnd('Salvar nome')}${id==='dotfy'?'<section class="gateway-test"><div class="gateway-test-title"><h3>Chave de produção</h3><span>Dotfy</span></div><p class="form-note" id="dotfy-production-status" role="status">Consultando configuração…</p><form id="dotfy-production-form" hidden><label class="form-field">Nova chave <input type="password" name="liveKey" autocomplete="off" spellcheck="false" placeholder="Cole a chave vk_live_" required maxlength="512"></label><p class="form-note">A chave fica criptografada no servidor. A troca atualiza a credencial cadastrada pelo painel.</p><button type="submit" class="btn primary">Salvar chave de produção</button></form><div id="dotfy-connection-test" hidden><p class="form-note">Gera uma cobrança real de R$ 10 na Dotfy para conferir a conexão, sem crédito automático na carteira.</p><button type="button" class="btn" id="dotfy-generate-charge">Gerar Pix de R$ 10</button><p role="status" class="form-note"></p><label class="form-field" hidden>Pix copia e cola<textarea rows="3" readonly></textarea></label></div></section>':pixupSettings()}`);if (id === 'pixup') mountPixupSettings();
if (id === 'dotfy') {
  const status = document.querySelector('#dotfy-production-status');
  fetch('/api/pix/deposits', {cache: 'no-store'})
    .then(response => {
      if (!response.ok) throw new Error('Status indisponível');
      return response.json();
    })
    .then(data => {
      status.textContent = data.dotfyProductionConfigured ? 'Chave de produção configurada no servidor.' : 'Chave de produção pendente.';
      const form = status.parentElement.querySelector('form');
      form.hidden = !data.canManageDotfy;
      status.parentElement.querySelector('#dotfy-connection-test').hidden = !data.canManageDotfy || !data.dotfyProductionConfigured;
      if (!data.canManageDotfy) status.textContent += ' A edição requer uma conta autorizada e armazenamento configurado.';

    })
    .catch(() => { status.textContent = 'Não foi possível consultar o status.'; });
}break;
case 'adjust':drawer('Solicitar ajuste de carteira',`<form data-form="adjust"><label class="form-field">Usuário<select name="user">${users.map(u=>`<option value="${u.id}">${u.name} · #${u.id}</option>`).join('')}</select></label><label class="form-field">Tipo<select name="type"><option>Crédito demonstrativo</option><option>Débito demonstrativo</option></select></label><label class="form-field">Valor (BRL)<input name="amount" type="number" min="0.01" step="0.01" required></label><label class="form-field">Motivo<textarea name="reason" maxlength="300" required></textarea></label><label class="check"><input type="checkbox" required> Ciente de que esta solicitação não altera saldos reais.</label>${formEnd('Registrar solicitação')}`);break;
case 'new-user':drawer('Novo usuário — prévia',notice('Somente registro de solicitação local, sem criar conta de acesso.')+`<form data-form="new-user">${field('Nome de exemplo','name')}${field('E-mail de exemplo','email','email','nome@example.com')}${formEnd('Registrar solicitação')}`);break;
case 'game-toggle':state.games[id]=state.games[id]==='Oculto'?'Visível':'Oculto';save('Visibilidade local do jogo',games[id]+': '+state.games[id]);render();toast('Visibilidade local atualizada.');break;case 'game-health':drawer('Saúde da integração',notice('Fortune Tiger apresenta G1006 em 32% de carregamento. Nenhuma rodada jogável foi validada.')+detail('PG SOFT',badge('Em validação','amber'))+detail('Clientes no projeto','11')+detail('Pagamentos reais',badge('Desabilitados')));break;
case 'new-campaign':drawer('Nova campanha',`<form data-form="campaign">${field('Nome da campanha','name')}${field('Texto do botão','cta','text','Saiba mais')}<div class="form-grid">${field('Início','start','date')}${field('Término','end','date')}</div><label class="form-field">Estado<select name="status"><option>Rascunho</option><option>Agendado</option></select></label>${notice('A campanha será salva somente no admin. Não altera os banners públicos.')}${formEnd('Salvar rascunho')}`);break;
case 'partner':{const u=users.find(u=>u.id===+id);drawer('Detalhes do parceiro',person(u)+detail('Código','BLZ'+id)+detail('Percentual ilustrativo',(state.commission?.rate||10)+'%')+notice('Comissões fictícias. Nenhum repasse é realizado.'));break;}
case 'invite':drawer('Convidar membro',`<form data-form="invite">${field('Nome de exemplo','name')}${field('E-mail de exemplo','email','email')}<label class="form-field">Perfil<select name="role"><option>Suporte</option><option>Financeiro</option><option>Conteúdo</option><option>Administrador</option></select></label>${notice('Convite local, sem envio de e-mail ou concessão de acesso real.')}${formEnd('Registrar convite local')}`);break;
case 'resolve-ticket':state.tickets[ticket]={...state.tickets[ticket],status:'Resolvido'};save('Ticket resolvido na demo','#'+(2817-ticket));render();toast('Ticket resolvido na demonstração.');break;case 'new-ticket':drawer('Registrar solicitação de suporte',`<form data-form="new-ticket">${field('Assunto ilustrativo','subject')}<label class="form-field">Descrição<textarea name="description" required maxlength="1000"></textarea></label>${notice('A solicitação será registrada somente na auditoria local, sem envio externo.')}${formEnd('Registrar na demonstração')}`);break;}}
document.addEventListener('click',e=>{const nav=e.target.closest('[data-nav]');if(nav){e.preventDefault();go(nav.dataset.nav);return}const b=e.target.closest('[data-action]');if(b){if(b.dataset.action==='submit'){e.preventDefault();b.closest('form')?.requestSubmit();return}act(b.dataset.action)}const t=e.target.closest('[data-tab]');if(t){tab=t.dataset.tab;page=1;filter='';query='';render()}const st=e.target.closest('[data-settings]');if(st){settingsTab=st.dataset.settings;render()}const ti=e.target.closest('[data-ticket]');if(ti){ticket=+ti.dataset.ticket;render()}});
document.addEventListener('change',e=>{if(e.target.id==='statusFilter'){filter=e.target.value;page=1;render()}if(e.target.id==='period')toast('Período selecionado. O gráfico mantém os dados ilustrativos desta prévia.')});document.addEventListener('input',e=>{if(e.target.id==='filterSearch'){const pos=e.target.selectionStart;query=e.target.value;page=1;render();$('#filterSearch').focus();$('#filterSearch').setSelectionRange(pos,pos)}if(e.target.id==='globalSearch'){const q=e.target.value.toLowerCase();document.querySelectorAll('.nav-link').forEach(a=>a.hidden=!a.textContent.toLowerCase().includes(q))}});
$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){const a=[...document.querySelectorAll('.nav-link')].find(a=>!a.hidden);if(a){go(a.dataset.nav);e.target.value=''}}if(e.key==='Escape'){e.target.value='';document.querySelectorAll('.nav-link').forEach(a=>a.hidden=false);e.target.blur()}});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();const d=Object.fromEntries(new FormData(f));switch(f.dataset.form){case 'gateway':state.aliases[f.dataset.gateway]=d.alias.trim();save('Configuração de gateway atualizada',f.dataset.gateway+': '+d.alias);break;case 'adjust':save('Ajuste solicitado',`#${d.user} · ${d.type} · ${money(d.amount)} · ${d.reason}`);break;case 'new-user':save('Solicitação de cadastro local',`${d.name} · ${d.email}`);break;case 'limits':state.limits={deposit:+d.deposit,withdraw:+d.withdraw};save('Limites demonstrativos salvos',`Depósito ${money(d.deposit)}, saque ${money(d.withdraw)}`);break;case 'commission':state.commission=d;save('Regra demonstrativa de comissão',`${d.model} · ${d.rate}%`);break;case 'campaign':if(d.end<d.start)return toast('Término deve ser igual ou posterior ao início.');state.campaigns.push(d);save('Campanha criada na demo',d.name+' · '+d.status);break;case 'invite':state.team.push(d);save('Convite local registrado',d.name+' · '+d.role);break;case 'security':state.settings.twoFactor=!!d.twoFactor;save('Preferência de segurança salva','2FA visual: '+!!d.twoFactor);break;case 'notifications':state.notifications={n0:!!d.n0,n1:!!d.n1,n2:!!d.n2};save('Preferências de notificações salvas','Alteração local');break;case 'brand':state.settings={...state.settings,...d};save('Configuração local atualizada',d.brand);break;case 'reply':state.tickets[ticket]={...state.tickets[ticket],status:'Respondido',replies:[...(state.tickets[ticket]?.replies||[]),d.reply]};save('Resposta local de suporte','#'+(2817-ticket));break;case 'new-ticket':save('Solicitação local de suporte',d.subject+': '+d.description);break;}close();render();toast('Alteração registrada nesta demonstração.');});
$('#menu').innerHTML=icon('menu');$('#searchIcon').innerHTML=icon('search');$('#notifications').innerHTML=icon('bell');$('#menu').onclick=()=>{const open=document.body.classList.toggle('menu-open');$('#menu').setAttribute('aria-expanded',String(open))};$('#notifications').onclick=()=>drawer('Notificações',`<div class="activity"><span class="tile-icon">${icon('gateway')}</span><div><b>Gateways aguardando integração</b><p>PixUp e Dotfy disponíveis na configuração visual.</p></div></div>${notice('Nenhuma operação financeira real está habilitada.')}`);$('#profile').onclick=()=>{settingsTab='Equipe e permissões';go('settings')};
for(const el of [$('#drawer'),$('#confirm')]){el.addEventListener('click',e=>{if(e.target===el){const r=el.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)el.close()}});el.addEventListener('close',()=>focusReturn?.isConnected&&focusReturn.focus())}document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#globalSearch').focus()}if(e.key==='Escape'){document.body.classList.remove('menu-open');$('#menu').setAttribute('aria-expanded','false')}});const mobileMenu = $('#mobileMenu');
mobileMenu.innerHTML = icon('menu') + '<span>Menu</span>';
mobileMenu.addEventListener('click', () => $('#menu').click());
new MutationObserver(() => {
  mobileMenu.setAttribute('aria-expanded', $('#menu').getAttribute('aria-expanded'));
}).observe($('#menu'), {attributes:true, attributeFilter:['aria-expanded']});
for (const link of document.querySelectorAll('.mobile-nav a')) {
  const glyph = link.dataset.nav === 'dashboard' ? 'dashboard' : 'audit';
  link.innerHTML = icon(glyph) + '<span>' + link.textContent + '</span>';
}
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(sections.some(s=>s[0]===id)&&id!==view)go(id)});go(location.hash.slice(1)||'dashboard');
})();

document.addEventListener('submit', async event => {
  const form = event.target;
  if (form.id !== 'dotfy-production-form') return;
  event.preventDefault();
  const input = form.elements.liveKey;
  const button = form.querySelector('button');
  const status = form.parentElement.querySelector('[role="status"]');
  const key = input.value.trim();
  if (!/^vk_live_[A-Za-z0-9_-]+$/.test(key)) {
    status.textContent = 'Cole uma chave que comece com vk_live_.';
    return;
  }
  button.disabled = true;
  input.disabled = true;
  input.value = '';
  status.textContent = 'Salvando chave…';
  try {
    const response = await fetch('/api/admin/gateways/dotfy/key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    const result = await response.json();
    status.textContent = result.message;
    if (response.ok) form.parentElement.querySelector("#dotfy-connection-test").hidden = false;
  } catch {
    status.textContent = 'Não foi possível confirmar o salvamento. Reabra a configuração para consultar o status.';
  } finally {
    button.disabled = false;
    input.disabled = false;
  }
});

document.querySelector('#drawer').addEventListener('close', () => {
  document.querySelector('#dotfy-production-form')?.reset();
});

document.addEventListener('click', async event => {
  const button = event.target.closest('#dotfy-generate-charge');
  if (!button || button.disabled) return;
  const section = button.closest('#dotfy-connection-test');
  const status = section.querySelector('[role="status"]');
  const output = section.querySelector('textarea');
  button.disabled = true;
  output.value = '';
  output.parentElement.hidden = true;
  status.textContent = 'Gerando cobrança…';
  try {
    const response = await fetch('/api/admin/gateways/dotfy/connection-charge', { method: 'POST' });
    const result = await response.json();
    status.textContent = result.message;
    if (response.ok) {
      output.value = result.code;
      output.parentElement.hidden = false;
    }
  } catch {
    status.textContent = 'Resposta indisponível. Confira as cobranças na Dotfy antes de tentar novamente.';
  }
});
