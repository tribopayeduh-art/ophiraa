const boostedDepositRates = {30: 50, 50: 100, 80: 300, 100: 500, 200: 800};
function depositOfferRate(amount, baseRate) {
  try {
    return localStorage.getItem('blitz-promo-500-redeemed') === 'true' ? (boostedDepositRates[amount] ?? baseRate) : baseRate;
  } catch { return baseRate; }
}
const depositOffers=[{amount:30,rate:15,chest:'bronze',name:'Bronze'},{amount:50,rate:20,chest:'silver',name:'Silver'},{amount:80,rate:50,chest:'emerald',name:'Emerald'},{amount:100,rate:80,chest:'royal',name:'Royal'},{amount:200,rate:300,chest:'gold',name:'Gold'}].map(offer => {
  const { rate: baseRate, ...details } = offer;
  return { ...details, get rate() { return depositOfferRate(details.amount, baseRate); } };
});
let depositState={amount:80,method:'PIX',view:'deposit',review:false};const usd=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v);const depositBRL=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);function depositMath(amount){const n=Number(amount);const valid=Number.isFinite(n)&&n>=10&&n<=100000;const rate=valid?(depositOffers.find(o=>o.amount===n)?.rate||0):0;return{amount:valid?n:0,rate,bonus:valid?Math.round(n*rate)/100:0,valid}}
function depositSummary(){const m=depositMath(depositState.amount);return `<div class="depo-summary" aria-live="polite"><div><span>Valor do depósito</span><b>${depositBRL(m.amount)}</b></div><div><span>Bônus <small>${m.rate}%</small></span><b class="bonus-value">+${depositBRL(m.bonus)}</b></div><div class="depo-total"><strong>Depósito + bônus</strong><b>${depositBRL(m.amount+m.bonus)}</b></div><p><span>ⓘ</span> O bônus não representa saldo disponível para saque.</p></div>`}
function depositScreen(){const d=depositState;return `<div class="depo-header"><span class="depo-title-icon">${mi('wallet')}</span><div><span class="eyebrow">BLITZ WALLET</span><h2 id="modalTitle">${d.view==='history'?'Meus depósitos':'Depositar'}</h2></div></div><p class="depo-subtitle">Seu depósito, com cada detalhe à vista.</p><div class="depo-tabs"><button class="${d.view==='deposit'?'selected':''}" data-depo-view="deposit">${mi('wallet')} Depositar</button><button class="${d.view==='history'?'selected':''}" data-depo-view="history">${mi('flag')} Histórico</button><button data-depo-withdraw>${mi('wallet')} Saques</button></div>${d.view==='history'?`<div class="depo-empty">${mi('wallet')}<h3>Nenhum depósito por aqui</h3><p>Seus depósitos aparecerão nesta área quando um provedor de pagamentos estiver conectado.</p><button class="orange" data-depo-view="deposit">Explorar depósitos →</button></div>`:`<div class="depo-layout"><div class="depo-main"><section class="deposit-hero"><div><span class="deposit-hero-label">OFERTAS DE DEPÓSITO</span><h3>Seu depósito.<br>Seu próximo baú.</h3><p>Explore bônus de <b>15% a ${depositOffers.at(-1).rate}%</b>.</p><span class="deposit-preview-chip">Até ${depositOffers.at(-1).rate}% de bônus</span></div><img src="assets/legendary-gold.webp" alt="Baú dourado de bônus"></section>${d.review?`<div class="depo-review"><span class="review-seal">${mi('gift')}</span><h3>Confira seu depósito</h3><p>Revise o valor, o bônus e o método escolhido antes de continuar.</p><div class="depo-review-method"><span>Método selecionado</span><b>${d.method}</b></div>${depositSummary()}<div class="depo-unavailable"><b>Pagamento ainda não disponível</b><p>A cobrança não foi gerada. É necessário conectar um gateway e definir as regras de bônus antes de receber depósitos.</p></div><button class="orange depo-primary" data-depo-back>← Alterar valor</button></div>`:`<div class="depo-section-heading"><div><h3>Escolha um valor</h3><p>Selecione o valor e veja o total na hora.</p></div><span class="currency-pill">BRL</span></div><div class="chest-grid">${depositOffers.map((o,i)=>`<button class="chest-option ${d.amount===o.amount?'selected':''} chest-${o.chest}" data-chest-amount="${o.amount}" aria-pressed="${d.amount===o.amount}" aria-label="Depositar ${o.amount} reais com ${o.rate}% de bônus"><span class="chest-badge"><b>${o.rate}%</b><small>bônus</small></span><img src="assets/legendary-${o.chest}.webp" alt="Baú ${o.name}"><strong>${depositBRL(o.amount)}</strong><span class="chest-bonus">+${depositBRL(o.amount*o.rate/100)} <small>de bônus</small></span><span class="chest-check">✓</span></button>`).join('')}</div><details class="deposit-custom"><summary>Prefiro digitar outro valor <span>＋</span></summary><label class="depo-field-label" for="depositCustom">Ou digite outro valor <span>BRL</span></label><div class="depo-amount-input"><span>R$</span><input type="number" id="depositCustom" min="10" max="100000" step="0.01" value="${Number(d.amount)||''}" aria-label="Valor do depósito em reais"><small>BRL</small></div><p class="depo-input-note" id="depositAmountNote">Os bônus se aplicam aos cinco valores destacados acima.</p></details><div class="depo-section-heading payment-heading"><div><h3>Depósito via PIX</h3><p>PIX em reais. Carteira exibida em dólares.</p></div></div><div class="depo-payment-options">${['PIX'].map(p=>`<button class="${d.method===p?'selected':''}" data-depo-method="${p}" aria-pressed="${d.method===p}"><span class="${p==='PIX'?'pix-mark':'card-mark'}">${p==='PIX'?'<svg viewBox="0 0 24 24" class="ui-icon pix-svg" aria-hidden="true"><path d="m12 2 6 6-6 6-6-6Z M12 10l6 6-6 6-6-6Z M2 12l4-4 4 4-4 4Z M14 12l4-4 4 4-4 4Z"/></svg>':mi('cards')}</span><b>${p}</b><small>Integração pendente</small><i>${d.method===p?'✓':''}</i></button>`).join('')}</div><details class="bonus-terms"><summary>Entenda o bônus antes de continuar <span>＋</span></summary><p>O bônus só se aplica aos valores destacados e fica separado do depósito. Condições de uso, requisitos de aposta e retirada ainda não estão configurados. Valores personalizados não recebem bônus nesta prévia.</p></details><div class="depo-mobile-summary" id="depoMobileSummary">${depositSummary()}</div><div class="deposit-action-bar"><div class="action-total"><small>Depósito selecionado</small><b id="depositActionAmount">${depositBRL(depositMath(d.amount).amount)}</b></div><button class="orange depo-primary" id="depositReview">Revisar depósito <span>→</span></button><p>Você poderá conferir tudo na próxima etapa.</p></div>`}</div><aside class="depo-side"><div class="deposit-balance-card"><span class="eyebrow">SUA CARTEIRA</span><span class="balance-currency">$</span><small>Saldo disponível</small><strong>$2,043.14</strong><span class="balance-status">USD <i></i> Saldo demonstrativo</span></div><div class="summary-heading"><h3>Resumo do depósito</h3><span>BRL</span></div><div id="depoDesktopSummary">${depositSummary()}</div><div class="depo-explain"><span>${mi('gift')}</span><div><b>Como funciona o bônus?</b><p>O bônus é mostrado separadamente. Requisitos de uso e retirada ainda precisam ser definidos.</p></div></div><div class="depo-explain"><span>${mi('wallet')}</span><div><b>Depósito em reais</b><p>Os valores das ofertas e da cobrança PIX são apresentados em reais.</p></div></div></aside></div>`}<p class="depo-disclaimer">Prévia visual. Pagamentos e regras de bônus aguardam configuração. Nenhum valor será cobrado.</p>`}
const modalBeforeDeposits=modal;modal=function(type){if(type!=='wallet'){modalBeforeDeposits(type);return}depositState={amount:80,method:'PIX',view:'deposit',review:false};renderDeposit(true);if(!dialog.open)dialog.showModal()};function renderDeposit(reset=false){const previousScroll=reset?0:dialog.scrollTop;dialog.dataset.kind='deposit';dialog.setAttribute('aria-labelledby','modalTitle');document.querySelector('#dialogContent').innerHTML=depositScreen();dialog.scrollTop=previousScroll;}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-depo-withdraw')){modalBeforeDeposits('wallet');dialog.dataset.kind='wallet';document.querySelector('#dialogContent').innerHTML=walletBody('withdraw');return}if(b.dataset.chestAmount){depositState.amount=+b.dataset.chestAmount;depositState.review=false;renderDeposit()}if(b.dataset.depoMethod){depositState.method=b.dataset.depoMethod;renderDeposit()}if(b.dataset.depoView){depositState.view=b.dataset.depoView;depositState.review=false;renderDeposit(true)}if(b.id==='depositReview'){const m=depositMath(depositState.amount);if(!m.valid){const n=document.querySelector('#depositAmountNote');n.textContent='Digite um valor entre R$ 10 e R$ 100.000.';n.classList.add('invalid');document.querySelector('#depositCustom').focus();return}depositState.review=true;renderDeposit(true)}if(b.hasAttribute('data-depo-back')){depositState.review=false;renderDeposit()}});document.addEventListener('input',e=>{if(e.target.id!=='depositCustom')return;depositState.amount=+e.target.value;document.querySelectorAll('[data-chest-amount]').forEach(b=>{const active=+b.dataset.chestAmount===depositState.amount;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active)});for(const id of ['depoMobileSummary','depoDesktopSummary']){const t=document.getElementById(id);if(t)t.innerHTML=depositSummary()}const action=document.querySelector('#depositActionAmount');if(action)action.textContent=depositBRL(depositMath(depositState.amount).amount);const n=document.querySelector('#depositAmountNote');n.classList.remove('invalid');n.textContent=depositMath(depositState.amount).rate?`${depositMath(depositState.amount).rate}% de bônus nesta opção.`:'Os bônus se aplicam aos cinco valores destacados acima.'});
function mountDepositBanners() {
  if (page !== 'lobby' || document.querySelector('.deposit-carousel')) return;
  const winners = document.querySelector('.winners');
  if (!winners) return;
  const titles = ['Escolha seu baú', 'Explore seus bônus', 'Confira as ofertas'];
  const carousel = document.createElement('section');
  carousel.className = 'deposit-carousel';
  carousel.setAttribute('aria-label', 'Promoções de depósito');
  carousel.innerHTML = `<button type="button" class="deposit-carousel-slide" data-modal="wallet"><img alt="" width="850" height="500"></button>
    <div class="deposit-carousel-controls">
      ${titles.map((title, index) => `<button type="button" data-slide="${index}" aria-label="${title}"></button>`).join('')}
      <button type="button" data-rotation aria-label="Pausar carrossel">Ⅱ</button>
    </div>`;
  const slide = carousel.querySelector('.deposit-carousel-slide');
  const image = slide.querySelector('img');
  const dots = [...carousel.querySelectorAll('[data-slide]')];
  const rotation = carousel.querySelector('[data-rotation]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  let paused = motion.matches;
  let hovered = false;
  let focused = false;

  function show(index) {
    current = index;
    slide.setAttribute('aria-label', titles[index] + ' · Ver bônus');
    image.src = '/assets/deposit-promo-' + (index + 1) + '.webp';
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
  }

  function schedule() {
    clearTimeout(timer);
    rotation.textContent = paused ? '▶' : 'Ⅱ';
    rotation.setAttribute('aria-label', paused ? 'Reproduzir carrossel' : 'Pausar carrossel');
    if (!paused && !hovered && !focused && !document.hidden) {
      timer = setTimeout(() => {
        show((current + 1) % titles.length);
        schedule();
      }, 6500);
    }
  }

  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    paused = true;
    show(index);
    schedule();
  }));
  rotation.addEventListener('click', () => { paused = !paused; schedule(); });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => {
    focused = carousel.contains(event.relatedTarget);
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', event => { paused = event.matches; schedule(); });
  show(0);
  winners.after(carousel);
  schedule();
}
mountDepositBanners();
new MutationObserver(mountDepositBanners).observe(document.querySelector('main'), { childList: true, subtree: true });
