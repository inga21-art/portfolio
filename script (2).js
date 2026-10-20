(function(){
  var $=function(q,r){return Array.prototype.slice.call((r||document).querySelectorAll(q))};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // Mobile menu
  var toggle=document.querySelector('.nav-toggle'),menu=document.getElementById('menu');
  if(toggle&&menu){
    toggle.addEventListener('click',function(){var o=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',o)});
    menu.addEventListener('click',function(e){if(e.target.tagName==='A'){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}});
  }

  // Logo fallback: if an image is missing, show a text chip instead
  function fallback(img){
    var s=document.createElement('span');s.className='mono';s.textContent=img.getAttribute('data-fallback')||img.alt;
    s.setAttribute('role','img');s.setAttribute('aria-label',img.alt);img.replaceWith(s);
  }
  $('img.logo-img').forEach(function(img){
    if(img.complete&&img.naturalWidth===0){fallback(img)}
    else img.addEventListener('error',function(){fallback(img)});
  });


  // "Back to top" and the name link always scroll to the very top
  $('a[href="#top"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:reduce?'auto':'smooth'})})});

  // Project filter
  var btns=$('.chip-btn'),projects=$('.project');
  btns.forEach(function(b){b.addEventListener('click',function(){
    btns.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    var f=b.dataset.filter;
    projects.forEach(function(p){var show=f==='all'||p.dataset.kind===f;p.hidden=!show;if(show)p.classList.add('in')});
  })});

  // Email links: copy the address, show a note, and open the mail app in a new tab.
  function toast(msg){
    var t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;
    document.body.appendChild(t);setTimeout(function(){t.remove()},3500);
  }
  $('a[href^="mailto:"]').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      var addr=a.getAttribute('href').replace('mailto:','').split('?')[0];
      var done=function(){toast('Opening your email app. Address copied: '+addr)};
      try{
        if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(addr).then(done,function(){toast('Email me at '+addr)})}
        else{toast('Email me at '+addr)}
      }catch(_){toast('Email me at '+addr)}
      try{window.open(a.href,'_blank')}catch(_){}
    });
  });

  // ---------------------------------------------------------------
  // Motion layer
  // ---------------------------------------------------------------
  var root=document.documentElement;
  if(!root.classList.contains('js'))root.classList.add('js');

  // Name: letters rise one at a time
  var h1=document.getElementById('hero-title');
  if(h1){
    var name=h1.textContent;h1.setAttribute('aria-label',name);h1.textContent='';
    name.split('').forEach(function(c,i){var e=document.createElement('span');e.className='ch';e.setAttribute('aria-hidden','true');e.style.setProperty('--i',i);e.textContent=c===' '?' ':c;h1.appendChild(e)});
  }
  // Intro statement: words arrive one by one
  var st=document.querySelector('.statement');
  if(st){
    var words=st.textContent.trim().split(/\s+/);st.textContent='';
    words.forEach(function(w,i){var e=document.createElement('span');e.className='w';e.style.setProperty('--i',i);e.textContent=w;st.appendChild(e);if(i<words.length-1)st.appendChild(document.createTextNode(' '))});
  }
  // Reflection headlines: each word lights up as it scrolls into the reading zone
  $('.quotes h3').forEach(function(h){
    var ws=h.textContent.trim().split(/\s+/);h.textContent='';
    ws.forEach(function(w,i){var e=document.createElement('span');e.className='w';e.textContent=w;h.appendChild(e);if(i<ws.length-1)h.appendChild(document.createTextNode(' '))});
  });

  // What reveals on scroll
  function tag(sel,opts){
    $(sel).forEach(function(el,i){
      el.classList.add('rv');
      if(opts&&opts.cls)el.classList.add(opts.cls);
      if(opts&&opts.stagger)el.style.setProperty('--d',Math.min(i,6));
    });
  }
  tag('.block h2');tag('.lead');tag('.filters');
  tag('.about .prose p',{stagger:1});tag('.facts',{});
  tag('.timeline>li',{});
  tag('.project',{cls:'zoom'});
  $('.skill-grid>div').forEach(function(g,i){g.classList.add('rv');g.style.setProperty('--d',i)});
  tag('.badge-row li',{stagger:1});
  tag('.quotes article',{});
  tag('.contact-list li',{stagger:1});
  var io=null;
  if('IntersectionObserver' in window){
    io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    $('.rv').forEach(function(el){io.observe(el)});
  }else{$('.rv').forEach(function(el){el.classList.add('in')})}

  // Count-up numbers: start at 0 and run up to the real value, each time a tile comes into view
  function count(el){
    var end=parseInt(el.getAttribute('data-end'),10);if(isNaN(end))return;
    if(reduce){el.textContent=end;return}
    if(el._raf)cancelAnimationFrame(el._raf);
    var t0=null,dur=1800+end*30;el.textContent='0';
    function step(t){if(!t0)t0=t;var k=Math.min((t-t0)/dur,1),e=1-Math.pow(1-k,4);el.textContent=Math.round(end*e);if(k<1)el._raf=requestAnimationFrame(step)}
    el._raf=requestAnimationFrame(step);
  }
  $('.bento b').forEach(function(b){b.setAttribute('data-end',parseInt(b.textContent,10));if(!reduce)b.textContent='0'});
  if('IntersectionObserver' in window){
    var cIO=new IntersectionObserver(function(es){es.forEach(function(en){
      var b=en.target;
      if(en.isIntersecting){
        clearTimeout(b._t);
        // on first load wait for the tiles to finish sliding in
        b._t=setTimeout(function(){count(b)},performance.now()<2800?1500:120);
      }else{clearTimeout(b._t);if(!reduce&&b._raf){cancelAnimationFrame(b._raf)}b.textContent='0'}
    })},{threshold:.5});
    $('.bento b').forEach(function(b){cIO.observe(b)});
  }else{$('.bento b').forEach(function(b){b.textContent=b.getAttribute('data-end')})}

  // Scroll-linked: progress bar, timeline line, reflection words, current section
  var bar=document.querySelector('.progress i'),tl=document.querySelector('.timeline');
  var ws=$('.quotes h3 .w'),links=$('.toc a[href^="#"]'),secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
  var ticking=false;
  function frame(){
    ticking=false;
    var y=window.scrollY,h=document.documentElement.scrollHeight-window.innerHeight,vh=window.innerHeight;
    if(bar)bar.style.setProperty('--p',h>0?(y/h).toFixed(4):0);
    if(tl){var r=tl.getBoundingClientRect();tl.style.setProperty('--tl',Math.max(0,Math.min(1,(vh*0.7-r.top)/r.height)).toFixed(3))}
    if(!reduce)ws.forEach(function(w){w.classList.toggle('lit',w.getBoundingClientRect().top<vh*0.78)});
    var cur=0;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<vh*0.4)cur=i});
    links.forEach(function(a,i){a.classList.toggle('on',i===cur)});
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);frame();

  if(fine&&!reduce){
    // Soft violet glow follows the pointer behind the intro
    var intro=document.querySelector('.intro');
    if(intro)intro.addEventListener('pointermove',function(e){var r=intro.getBoundingClientRect();intro.style.setProperty('--mx',(e.clientX-r.left)+'px');intro.style.setProperty('--my',(e.clientY-r.top)+'px')});

    // Project cards: glow follows the pointer
    $('.project').forEach(function(p){p.addEventListener('pointermove',function(e){var r=p.getBoundingClientRect();p.style.setProperty('--mx',(e.clientX-r.left)+'px');p.style.setProperty('--my',(e.clientY-r.top)+'px')})});

    // 3D tilt with light glare on screenshots and badges
    function tilt(el,max){
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        el.style.setProperty('--ry',((x-.5)*max).toFixed(2)+'deg');el.style.setProperty('--rx',((.5-y)*max).toFixed(2)+'deg');
        el.style.setProperty('--gx',(x*100)+'%');el.style.setProperty('--gy',(y*100)+'%');
      });
      el.addEventListener('pointerleave',function(){el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')});
    }
    $('.p-cover').forEach(function(el){tilt(el,8)});
    $('.badge-row li').forEach(function(el){tilt(el,10)});

    // Magnetic buttons
    $('.btn').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.16)+'px,'+((e.clientY-r.top-r.height/2)*.26)+'px)'});
      b.addEventListener('pointerleave',function(){b.style.transform=''});
    });
  }
})();
