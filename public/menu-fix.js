const menuSidebar=document.querySelector('.sidebar'),menuTrigger=document.querySelector('#menu');
menuSidebar.id='platform-menu';menuSidebar.setAttribute('aria-label','Menu principal');menuTrigger.setAttribute('aria-controls','platform-menu');
const mobileMenuShade=document.createElement('button');mobileMenuShade.className='mobile-menu-shade';mobileMenuShade.setAttribute('aria-label','Fechar menu');document.body.append(mobileMenuShade);
function syncMobileMenu(){const open=matchMedia('(max-width:850px)').matches&&menuSidebar.classList.contains('open');document.body.classList.toggle('mobile-menu-open',open);menuTrigger.setAttribute('aria-expanded',open?'true':'false')}
function closeMobileMenu(){menuSidebar.classList.remove('open');syncMobileMenu()}
mobileMenuShade.addEventListener('click',closeMobileMenu);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobileMenu()});new MutationObserver(syncMobileMenu).observe(menuSidebar,{attributes:true,attributeFilter:['class']});window.addEventListener('resize',syncMobileMenu);
