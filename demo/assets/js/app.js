/* ==========================================================================
   Tegelloods BV — demo applicatie
   Alle state staat in localStorage. In Shopify vervang je:
   - cart/sample/showroom state  -> /cart AJAX API + cart attributes
   - de PDP-rekenmodule          -> theme section met variant metafields
   ========================================================================== */
(function(){
'use strict';

var TL = window.TL = {};

/* ---------- Bedrijfsgegevens (Shopify: shop settings / metafields) ------- */
var SHOP = TL.shop = {
  naam:'Tegelloods BV',
  adres:'Telgenweg 4, 8111 CM Heeten',
  tel:'06 - 29 02 94 95',
  telRaw:'31629029495',
  mail:'info@tegelloodsbv.nl',
  gratisVerzendVanaf:250,
  verzendkosten:39.95,
  maxGratisSamples:4,
  sampleKosten:4.95
};

/* ---------- Helpers ---------- */
function euro(n){
  var v = (Math.round(n*100)/100).toFixed(2).split('.');
  var heel = v[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return '€ ' + heel + ',' + v[1];
}
function num(n, d){ return n.toFixed(d===undefined?2:d).replace('.', ','); }
TL.euro = euro; TL.num = num;
function $(s, r){ return (r||document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
TL.$ = $; TL.$$ = $$;
function byId(id){ for(var i=0;i<PRODUCTS.length;i++){ if(PRODUCTS[i].id===id) return PRODUCTS[i]; } return null; }
TL.byId = byId;
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
TL.esc = esc;

/* ---------- Iconen ---------- */
var I = TL.icon = function(name, size){
  var s = size||18;
  var p = {
    check:'<polyline points="20 6 9 17 4 12"/>',
    truck:'<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    ruler:'<path d="M2 12l10-10 10 10-10 10z"/><path d="M7 12h2M11 12h2M15 12h2"/>',
    star:'<polygon points="12 2 15.1 8.6 22 9.6 17 14.5 18.2 21.4 12 18.1 5.8 21.4 7 14.5 2 9.6 8.9 8.6"/>',
    search:'<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.7" y2="16.7"/>',
    cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.4 12.2a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.6L21 7H6"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    heart:'<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.4l8.8-8.7a5 5 0 0 0 0-7.1z"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
    clock:'<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    box:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    shield:'<path d="M12 2l8 4v6c0 5-3.4 9.3-8 10-4.6-.7-8-5-8-10V6z"/><polyline points="9 12 11 14 15 10"/>',
    swatch:'<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
    whatsapp:'<path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/><path d="M8.6 7.8c.2-.5.4-.5.7-.5h.6c.2 0 .5 0 .7.5l.8 2c.1.3 0 .5-.1.7l-.5.6c-.2.2-.3.4-.1.7a7 7 0 0 0 3.2 3c.3.2.5.1.7-.1l.6-.7c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.3.4.5 0 .8-.6 1.7-1.4 1.9-1 .3-2.3.2-5-1.5a10 10 0 0 1-3.6-4.2c-.6-1.4-.4-2.6-.2-3z"/>',
    arrow:'<line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>',
    plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    info:'<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r=".6" fill="currentColor"/>',
    flame:'<path d="M12 2s5 4.5 5 9a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5S9 10 10.5 10 12 6 12 2z"/>',
    leaf:'<path d="M4 20c8 0 16-4 16-14C10 6 4 10 4 20z"/><line x1="4" y1="20" x2="12" y2="12"/>'
  }[name] || '';
  return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
};
function stars(score){
  var full = Math.round(score);
  return '<span class="stars" aria-label="'+num(score,1)+' van 5">'+ '★★★★★'.slice(0,full) + '<span style="color:#d9dde2">'+'★★★★★'.slice(0,5-full)+'</span></span>';
}
TL.stars = stars;

/* ---------- State (Shopify: cart API + cart attributes) ---------- */
function load(key, fb){ try{ return JSON.parse(localStorage.getItem(key)) || fb; }catch(e){ return fb; } }
function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
var state = TL.state = {
  cart: load('tl_cart', []),
  samples: load('tl_samples', []),
  showroom: load('tl_showroom', [])
};
function persist(){
  save('tl_cart', state.cart); save('tl_samples', state.samples); save('tl_showroom', state.showroom);
  paintCounts();
}
TL.persist = persist;

function paintCounts(){
  var c = state.cart.reduce(function(a,l){ return a + l.aantal; }, 0);
  $$('[data-count="cart"]').forEach(function(el){ el.textContent = c; el.classList.toggle('hidden', c===0); });
  $$('[data-count="samples"]').forEach(function(el){ el.textContent = state.samples.length; el.classList.toggle('hidden', state.samples.length===0); });
  $$('[data-count="showroom"]').forEach(function(el){ el.textContent = state.showroom.length; el.classList.toggle('hidden', state.showroom.length===0); });
}

/* ---------- Toast ---------- */
function toast(html){
  var wrap = $('.toast-wrap') || (function(){ var w = document.createElement('div'); w.className='toast-wrap'; document.body.appendChild(w); return w; })();
  var t = document.createElement('div'); t.className='toast'; t.innerHTML = I('check',18) + '<div>'+html+'</div>';
  wrap.appendChild(t);
  setTimeout(function(){ t.style.transition='.3s'; t.style.opacity='0'; setTimeout(function(){ t.remove(); }, 320); }, 3200);
}
TL.toast = toast;

/* ---------- Winkelwagen / samples / showroom ---------- */
TL.addToCart = function(item){
  var key = item.id + '|' + item.kleur + '|' + item.maat;
  var found = state.cart.filter(function(l){ return l.key===key; })[0];
  if(found){ found.aantal += item.aantal; } else { item.key = key; state.cart.push(item); }
  persist();
  toast('<b>'+esc(item.naam)+'</b> toegevoegd — '+item.aantal+' '+(item.eenheid||'dozen'));
  openDrawer('cart');
};
TL.addSample = function(p, kleurIdx){
  var k = p.kleuren[kleurIdx||0];
  var key = p.id+'|'+k.naam;
  if(state.samples.some(function(s){ return s.key===key; })){ toast('Dit staal zit al in je samplebox.'); return openDrawer('samples'); }
  if(state.samples.length >= SHOP.maxGratisSamples){
    toast('Maximaal '+SHOP.maxGratisSamples+' gratis stalen per bestelling.'); return openDrawer('samples');
  }
  state.samples.push({key:key, id:p.id, naam:p.naam, kleur:k.naam, tex:k.tex});
  persist();
  toast('Staal <b>'+esc(p.naam)+' — '+esc(k.naam)+'</b> toegevoegd ('+state.samples.length+'/'+SHOP.maxGratisSamples+')');
  openDrawer('samples');
};
TL.addShowroom = function(p, kleurIdx, maatIdx){
  var k = p.kleuren[kleurIdx||0], m = p.maten[maatIdx||0];
  var key = p.id+'|'+k.naam+'|'+m.maat;
  if(state.showroom.some(function(s){ return s.key===key; })){ toast('Staat al op je showroomlijst.'); return openDrawer('showroom'); }
  state.showroom.push({key:key, id:p.id, naam:p.naam, kleur:k.naam, maat:m.maat, tex:k.tex});
  persist();
  toast('<b>'+esc(p.naam)+'</b> op je showroomlijst gezet — wij leggen \'m klaar.');
  openDrawer('showroom');
};
TL.removeLine = function(store, key){
  state[store] = state[store].filter(function(l){ return l.key!==key; });
  persist(); renderDrawer(store==='cart'?'cart':store);
};

/* ---------- Header / footer / FAB's ---------- */
var NAV = [
  {href:'collectie.html?cat=vloertegels', label:'Vloertegels'},
  {href:'collectie.html?cat=wandtegels',  label:'Wandtegels'},
  {href:'collectie.html?look=houtlook',   label:'Houtlook'},
  {href:'collectie.html?look=marmerlook', label:'Marmerlook'},
  {href:'collectie.html?look=betonlook',  label:'Betonlook'},
  {href:'collectie.html?cat=buitentegels',label:'Buiten & tuin'},
  {href:'collectie.html?cat=toebehoren',  label:'Lijm & voeg'},
  {href:'inspiratie.html',                label:'Inspiratie'},
  {href:'showroom.html',                  label:'Showroom & advies', accent:true}
];

TL.renderChrome = function(active){
  var head = document.createElement('div');
  head.innerHTML =
  '<div class="topbar"><div class="wrap">'+
    '<ul class="topbar-usps">'+
      '<li>'+I('check',15)+' Gratis stalen thuisbezorgd</li>'+
      '<li>'+I('check',15)+' Persoonlijk advies uit de showroom</li>'+
      '<li>'+I('check',15)+' Gratis bezorgd vanaf '+euro(SHOP.gratisVerzendVanaf)+'</li>'+
      '<li>'+I('check',15)+' Afhalen in Heeten mogelijk</li>'+
    '</ul>'+
    '<div class="topbar-right"><span>'+stars(4.9)+' <b>4,9</b> op Google</span><a href="tel:+'+SHOP.telRaw+'">'+SHOP.tel+'</a></div>'+
  '</div></div>'+
  '<header class="site-header"><div class="wrap">'+
    '<div class="header-main">'+
      '<a class="logo" href="index.html"><span class="logo-mark">'+I('swatch',20)+'</span><span>Tegelloods<small>BV · sinds 2009</small></span></a>'+
      '<div class="search">'+I('search',18)+'<input type="search" placeholder="Zoek op serie, kleur, formaat of look — bijv. &quot;betonlook 60x60&quot;" aria-label="Zoeken"></div>'+
      '<div class="header-actions">'+
        '<button class="icon-btn" data-open="samples">'+I('swatch',21)+'<span>Stalen</span><span class="count hidden" data-count="samples">0</span></button>'+
        '<button class="icon-btn" data-open="showroom">'+I('calendar',21)+'<span>Showroom</span><span class="count hidden" data-count="showroom">0</span></button>'+
        '<button class="icon-btn" data-open="cart">'+I('cart',21)+'<span>Winkelwagen</span><span class="count hidden" data-count="cart">0</span></button>'+
      '</div>'+
    '</div>'+
    '<nav class="nav"><ul>'+ NAV.map(function(n){
        return '<li><a href="'+n.href+'" class="'+(n.accent?'nav-accent ':'')+(active===n.label?'is-active':'')+'">'+n.label+'</a></li>';
      }).join('') +'</ul></nav>'+
  '</div></header>'+
  '<div class="demo-note"><div class="wrap">'+I('info',16)+'<span>Demo-omgeving — voorbeeldshop voor Tegelloods BV. Prijzen, voorraad en bestellingen zijn fictief.</span></div></div>';
  document.body.insertBefore(head, document.body.firstChild);

  var foot = document.createElement('div');
  foot.innerHTML =
  '<footer class="site-footer"><div class="wrap">'+
    '<div class="footer-top">'+
      '<div><h4>Tegelloods BV</h4><p>Een zorgvuldig samengesteld assortiment wand- en vloertegels van topkwaliteit. Persoonlijk advies, eerlijke prijzen en meer dan 15 jaar ervaring in tegelwerk en afwerking.</p>'+
      '<p class="small">'+SHOP.adres+'<br>'+SHOP.tel+' · '+SHOP.mail+'<br>Showroom open op afspraak</p></div>'+
      '<div><h4>Assortiment</h4><ul>'+ CATEGORIES.map(function(c){ return '<li><a href="collectie.html?cat='+c.slug+'">'+c.naam+'</a></li>'; }).join('') +'</ul></div>'+
      '<div><h4>Service</h4><ul>'+
        '<li><a href="samples.html">Stalen bestellen</a></li>'+
        '<li><a href="showroom.html">Afspraak showroom</a></li>'+
        '<li><a href="showroom.html#offerte">Offerte aanvragen</a></li>'+
        '<li><a href="inspiratie.html">Inspiratie per ruimte</a></li>'+
        '<li><a href="index.html#kennis">Legadvies &amp; onderhoud</a></li>'+
        '<li><a href="index.html#verzenden">Verzenden &amp; afhalen</a></li>'+
      '</ul></div>'+
      '<div><h4>Zeker weten waar je koopt</h4><ul>'+
        '<li>'+I('shield',16)+' 2 jaar productgarantie</li>'+
        '<li>'+I('check',16)+' Uitsluitend 1e sortering</li>'+
        '<li>'+I('truck',16)+' Gratis bezorgd vanaf '+euro(SHOP.gratisVerzendVanaf)+'</li>'+
        '<li>'+I('box',16)+' Restdozen retour binnen 30 dagen</li>'+
        '<li>'+I('star',16)+' 4,9 gemiddeld uit 180+ reviews</li>'+
      '</ul></div>'+
    '</div>'+
    '<div class="footer-bottom"><span>© '+ new Date().getFullYear() +' Tegelloods BV · KvK 00000000 · Alle prijzen incl. 21% btw</span><span>Demo — ontwerp voor Shopify</span></div>'+
  '</div></footer>';
  document.body.appendChild(foot);

  renderFabs();
  renderDrawers();
  paintCounts();

  $$('[data-open]').forEach(function(b){ b.addEventListener('click', function(){ openDrawer(b.dataset.open); }); });
};

/* Sticky actieknoppen */
function renderFabs(){
  var wa = 'https://wa.me/'+SHOP.telRaw+'?text='+encodeURIComponent('Hallo Tegelloods, ik heb een vraag over ');
  var d = document.createElement('div');
  d.className = 'fab-stack';
  d.innerHTML =
    '<button class="fab fab-appt" data-open="showroom" aria-label="Plan een showroomafspraak">'+
      '<svg class="fab-curve" viewBox="0 0 104 104" aria-hidden="true">'+
        '<defs><path id="fabCircle" d="M52,52 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs>'+
        '<text><textPath href="#fabCircle" startOffset="50%" text-anchor="middle">PLAN JE AFSPRAAK ·</textPath></text>'+
      '</svg>'+
      '<span class="fab-icon">'+I('calendar',28)+'</span>'+
      '<span class="fab-count hidden" data-count="showroom">0</span>'+
      '<span class="fab-tip">Showroombezoek plannen</span>'+
    '</button>'+
    '<a class="fab fab-wa" href="'+wa+'" target="_blank" rel="noopener" aria-label="Stel je vraag via WhatsApp">'+
      I('whatsapp',30)+'<span class="fab-tip">Vraag of offerte via WhatsApp</span></a>';
  document.body.appendChild(d);
}

/* ---------- Drawers ---------- */
function renderDrawers(){
  var d = document.createElement('div');
  d.innerHTML =
    '<div class="drawer-backdrop" data-close></div>'+
    ['cart','samples','showroom'].map(function(k){
      return '<aside class="drawer" id="drawer-'+k+'" aria-hidden="true">'+
        '<div class="drawer-head"><h3></h3><button class="close-x" data-close aria-label="Sluiten">&times;</button></div>'+
        '<div class="drawer-body"></div><div class="drawer-foot"></div></aside>';
    }).join('');
  document.body.appendChild(d);
  $$('[data-close]').forEach(function(b){ b.addEventListener('click', closeDrawers); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeDrawers(); });
}
function closeDrawers(){
  $$('.drawer').forEach(function(el){ el.classList.remove('is-open'); el.setAttribute('aria-hidden','true'); });
  $('.drawer-backdrop').classList.remove('is-open');
}
function openDrawer(kind){
  renderDrawer(kind);
  var el = $('#drawer-'+kind); if(!el) return;
  $$('.drawer').forEach(function(d){ d.classList.remove('is-open'); });
  el.classList.add('is-open'); el.setAttribute('aria-hidden','false');
  $('.drawer-backdrop').classList.add('is-open');
}
TL.openDrawer = openDrawer;

function lineItem(store, l, right, meta){
  return '<div class="line-item">'+
    '<div class="li-thumb" style="background-image:'+l.tex+'"></div>'+
    '<div style="flex:1"><div class="li-title">'+esc(l.naam)+'</div>'+
    '<div class="li-meta">'+esc(meta)+'</div>'+
    '<button class="li-remove" data-rm="'+store+'|'+esc(l.key)+'">Verwijderen</button></div>'+
    (right?'<div style="text-align:right;font-weight:700">'+right+'</div>':'')+
  '</div>';
}

function renderDrawer(kind){
  var el = $('#drawer-'+kind); if(!el) return;
  var head = $('.drawer-head h3', el), body = $('.drawer-body', el), foot = $('.drawer-foot', el);

  if(kind==='cart'){
    head.textContent = 'Winkelwagen';
    if(!state.cart.length){
      body.innerHTML = '<div class="empty-state">'+I('cart',34)+'<p>Je winkelwagen is leeg.</p><a class="btn btn-ghost" href="collectie.html">Bekijk de collectie</a></div>';
      foot.innerHTML = '';
    } else {
      var sub = state.cart.reduce(function(a,l){ return a + l.aantal * l.prijsPerEenheid; }, 0);
      var m2  = state.cart.reduce(function(a,l){ return a + (l.m2 || 0); }, 0);
      var verzend = sub >= SHOP.gratisVerzendVanaf ? 0 : SHOP.verzendkosten;
      body.innerHTML = state.cart.map(function(l){
        return lineItem('cart', l, euro(l.aantal*l.prijsPerEenheid),
          l.kleur+' · '+l.maat+' · '+l.aantal+' '+(l.eenheid||'dozen')+(l.m2?' ('+num(l.m2)+' m²)':''));
      }).join('');
      foot.innerHTML =
        '<div style="display:flex;justify-content:space-between"><span>Subtotaal'+(m2?' ('+num(m2)+' m²)':'')+'</span><b>'+euro(sub)+'</b></div>'+
        '<div style="display:flex;justify-content:space-between;font-size:.9rem;color:var(--text-2);margin:.3rem 0 .1rem"><span>Bezorging</span><span>'+(verzend?euro(verzend):'Gratis')+'</span></div>'+
        (verzend? '<div class="small" style="color:var(--clay-600);margin-bottom:.6rem">Nog '+euro(SHOP.gratisVerzendVanaf-sub)+' tot gratis bezorging</div>' : '')+
        '<div style="display:flex;justify-content:space-between;font-size:1.15rem;margin:.5rem 0 .9rem"><b>Totaal</b><b>'+euro(sub+verzend)+'</b></div>'+
        '<a class="btn btn-primary btn-block btn-lg" href="winkelwagen.html">Naar afrekenen</a>'+
        '<p class="small muted center" style="margin:.7rem 0 0">Twijfel je nog over de kleur? '+
        '<a href="samples.html" style="text-decoration:underline">Bestel eerst gratis stalen</a>.</p>';
    }
  }

  if(kind==='samples'){
    head.textContent = 'Samplebox ('+state.samples.length+'/'+SHOP.maxGratisSamples+')';
    if(!state.samples.length){
      body.innerHTML = '<div class="empty-state">'+I('swatch',34)+'<p>Nog geen stalen gekozen.<br>Kies er maximaal '+SHOP.maxGratisSamples+' — wij sturen ze gratis op.</p><a class="btn btn-ghost" href="collectie.html">Kies je tegels</a></div>';
      foot.innerHTML='';
    } else {
      body.innerHTML = state.samples.map(function(l){ return lineItem('samples', l, 'Gratis', l.kleur+' · staal 20x20 cm'); }).join('') +
        '<p class="small muted" style="margin-top:1rem">'+I('info',14)+' Stalen zijn 20x20 cm en worden binnen 2 werkdagen verstuurd. Je hoeft ze niet terug te sturen.</p>';
      foot.innerHTML = '<a class="btn btn-primary btn-block btn-lg" href="samples.html">Gratis stalen aanvragen</a>';
    }
  }

  if(kind==='showroom'){
    head.textContent = 'Showroombezoek';
    if(!state.showroom.length){
      body.innerHTML = '<div class="empty-state">'+I('calendar',34)+'<p>Je showroomlijst is leeg.<br>Zet tegels op je lijst — wij leggen ze klaar op grootformaat vóór je komt.</p><a class="btn btn-ghost" href="showroom.html">Direct een afspraak plannen</a></div>';
      foot.innerHTML = '<a class="btn btn-navy btn-block btn-lg" href="showroom.html">'+I('calendar',18)+' Afspraak maken</a>';
    } else {
      body.innerHTML = state.showroom.map(function(l){ return lineItem('showroom', l, '', l.kleur+' · '+l.maat); }).join('') +
        '<p class="small muted" style="margin-top:1rem">'+I('info',14)+' Wij leggen deze tegels klaar in de showroom aan de '+SHOP.adres+', zodat je ze op formaat en bij daglicht ziet.</p>';
      foot.innerHTML = '<a class="btn btn-navy btn-block btn-lg" href="showroom.html">'+I('calendar',18)+' Kies datum &amp; tijd</a>';
    }
  }

  $$('[data-rm]', el).forEach(function(b){
    b.addEventListener('click', function(){
      var parts = b.dataset.rm.split('|');
      TL.removeLine(parts[0], parts.slice(1).join('|'));
    });
  });
}

/* ---------- Productkaart ---------- */
TL.productCard = function(p){
  var m = p.maten[0], k = p.kleuren[0];
  var korting = m.oud ? Math.round((1 - m.prijs/m.oud)*100) : 0;
  var extraBadges = (p.badge||[]).filter(function(b){ return b.indexOf('%')<0 && !(p.nieuw && b==='Nieuw'); });
  return '<article class="product-card"><div class="pc-media-wrap">'+
    '<a class="pc-media" href="product.html?id='+p.id+'" style="background-image:'+k.tex+'">'+
      '<span class="pc-badges">'+
        (korting?'<span class="badge badge-sale">-'+korting+'%</span>':'')+
        (p.nieuw?'<span class="badge badge-new">Nieuw</span>':'')+
        extraBadges.slice(0,1).map(function(b){ return '<span class="badge badge-navy">'+b+'</span>'; }).join('')+
      '</span>'+
    '</a>'+
    '<button class="pc-sample" data-sample="'+p.id+'">'+I('swatch',14)+' Gratis staal</button></div>'+
    '<div class="pc-body">'+
      '<div class="pc-meta">'+p.merk+' · '+p.look+'</div>'+
      '<a class="pc-title" href="product.html?id='+p.id+'">'+esc(p.naam)+'</a>'+
      '<div class="pc-specs">'+p.maten.map(function(x){return x.maat;}).join(' · ')+'</div>'+
      '<div class="pc-price"><span class="now">'+euro(m.prijs)+'</span><span class="unit">'+(p.perStuk?'per '+p.eenheid:'per m²')+'</span>'+
        (m.oud?'<span class="was">'+euro(m.oud)+'</span>':'')+'</div>'+
      '<div class="pc-foot">'+ stars(p.rating) +'<span class="badge badge-stock">'+(p.voorraad==='op voorraad'?'Op voorraad':'Op bestelling')+'</span></div>'+
    '</div>'+
  '</article>';
};
TL.bindCards = function(root){
  $$('[data-sample]', root||document).forEach(function(b){
    b.addEventListener('click', function(e){ e.preventDefault(); TL.addSample(byId(b.dataset.sample), 0); });
  });
};

/* ---------- Query params ---------- */
TL.qp = function(name){
  var m = new RegExp('[?&]'+name+'=([^&]*)').exec(location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g,' ')) : null;
};

})();
