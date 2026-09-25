/* BelaMonte — premium effects */
(function(){
  'use strict';
  document.documentElement.classList.add('bm-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }

  /* Image fade-in on load */
  function fadeImages(){
    var imgs=document.querySelectorAll('.cat-card img,.prod-card__media img,.look-card img,.catcar__circle img');
    imgs.forEach(function(img){
      img.classList.add('bm-img-fade');
      if(img.complete && img.naturalWidth>0) img.classList.add('is-loaded');
      else img.addEventListener('load',function(){ img.classList.add('is-loaded'); },{once:true});
    });
  }

  /* Extended reveal + stagger (selectors not covered by global.js) */
  function reveal(){
    if(reduce) return;
    var singles=document.querySelectorAll('.catcar__head');
    var staggers=document.querySelectorAll('.usp__grid,.catcar__track,.style-pills,.editorial__stats');
    if(!('IntersectionObserver' in window)){
      singles.forEach(function(e){e.classList.add('bm-reveal','is-visible');});
      staggers.forEach(function(e){e.classList.add('bm-stagger','is-visible');});
      return;
    }
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('is-visible');io.unobserve(x.target);}});},{threshold:0.1,rootMargin:'0px 0px -6% 0px'});
    singles.forEach(function(e){e.classList.add('bm-reveal');io.observe(e);});
    staggers.forEach(function(e){e.classList.add('bm-stagger');io.observe(e);});
  }

  /* Parallax depth on large media */
  function parallax(){
    if(reduce) return;
    var media=document.querySelectorAll('.editorial__media img,.gift__media img');
    if(!media.length) return;
    media.forEach(function(m){ m.classList.add('bm-parallax-media'); });
    var ticking=false;
    function update(){
      var vh=window.innerHeight;
      media.forEach(function(m){
        var p=m.parentElement.getBoundingClientRect();
        if(p.bottom<0||p.top>vh) return;
        var prog=((p.top+p.height/2)-vh/2)/((vh/2)+(p.height/2));
        var max=p.height*0.08;
        m.style.transform='translate3d(0,'+(prog*-max).toFixed(1)+'px,0)';
      });
      ticking=false;
    }
    function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(update); } }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});
    update();
  }

  ready(function(){ fadeImages(); reveal(); parallax(); });
})();
