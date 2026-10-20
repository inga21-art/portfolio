(function(){
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
  document.querySelectorAll('img.logo-img').forEach(function(img){
    if(img.complete&&img.naturalWidth===0){fallback(img)}
    else img.addEventListener('error',function(){fallback(img)});
  });

  // Project filter
  var btns=document.querySelectorAll('.chip-btn'),projects=document.querySelectorAll('.project');
  btns.forEach(function(b){b.addEventListener('click',function(){
    btns.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    var f=b.dataset.filter,i=0;
    projects.forEach(function(p){
      var show=f==='all'||p.dataset.kind===f;p.hidden=!show;
      if(show){p.classList.toggle('flip',i%2===1);i++}
    });
  })});

  // Email links: copy the address, show a note, and open the mail app in a new tab.
  // (Some preview panes block mailto links, so the copied address is the safety net.)
  function toast(msg){
    var t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;
    document.body.appendChild(t);setTimeout(function(){t.remove()},3500);
  }
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){
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
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $=function(q,r){return Array.prototype.slice.call((r||document).querySelectorAll(q))};
  var root=document.documentElement;
  if(!root.classList.contains('js'))root.classList.add('js');

  // Hero name: split into letters so they can rise one at a time
  $('.hero h1 .line span').forEach(function(sp){
    var t=sp.textContent;sp.textContent='';sp.setAttribute('aria-hidden','true');
    t.split('').forEach(function(c,i){var e=document.createElement('span');e.className='ch';e.style.setProperty('--i',i+(sp.parentNode.nextElementSibling?0:4));e.textContent=c;sp.appendChild(e)});
  });
  var h1=document.getElementById('hero-title');
  if(h1){h1.setAttribute('aria-label','Inga Plati')}

  // Reflection headlines: wrap each word so it can light up with scroll
  $('.quotes h3').forEach(function(h){
    var words=h.textContent.trim().split(/\s+/);h.textContent='';
    words.forEach(function(w,i){var e=document.createElement('span');e.className='w';e.textContent=w;h.appendChild(e);if(i<words.length-1)h.appendChild(document.createTextNode(' '))});
  });

  // Mark what should reveal on scroll, with stagger delays
  function tag(sel,opts){
    $(sel).forEach(function(el,i){
      el.classList.add('rv');
      if(opts&&opts.cls)el.classList.add(opts.cls);
      if(opts&&opts.stagger)el.style.setProperty('--d',Math.min(i,8));
      if(opts&&opts.alt)el.classList.add(i%2?'from-r':'from-l');
    });
  }
  tag('.block h2');tag('.lead');tag('.filters');
  tag('.stats li',{stagger:1});
  tag('.about .prose p',{stagger:1});
  tag('.facts div',{stagger:1});
  tag('.timeline>li',{stagger:0});
  $('.project').forEach(function(p){
    var flip=p.classList.contains('flip');
    var t=p.querySelector('.p-text'),c=p.querySelector('.p-cover');
    if(t){t.classList.add('rv',flip?'from-r':'from-l')}
    if(c){c.classList.add('rv','zoom');c.style.setProperty('--d',2)}
  });
  $('.skills .skill-grid>div').forEach(function(g,i){g.classList.add('rv');g.style.setProperty('--d',i)});
  $('.skills .chips').forEach(function(ul){$('li',ul).forEach(function(li,i){li.style.transitionDelay=(i*35)+'ms'})});
  tag('.badge-row li',{stagger:1});
  tag('.quotes article',{stagger:0});
  tag('.contact-list li',{stagger:1});

  // Reveal when scrolled into view
  var io=null;
  if('IntersectionObserver' in window){
    io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
    },{threshold:.15,rootMargin:'0px 0px -6% 0px'});
    $('.rv').forEach(function(el){io.observe(el)});
  }else{$('.rv').forEach(function(el){el.classList.add('in')})}
  // projects re-shown by the filter must not stay hidden
  $('.chip-btn').forEach(function(b){b.addEventListener('click',function(){$('.project .rv').forEach(function(e){e.classList.add('in')})})});

  // Count-up numbers
  function count(el){
    var end=parseInt(el.textContent,10);if(isNaN(end)||reduce){return}
    var t0=null,dur=1400;el.textContent='0';
    function step(t){if(!t0)t0=t;var k=Math.min((t-t0)/dur,1),e=1-Math.pow(1-k,3);el.textContent=Math.round(end*e);if(k<1)requestAnimationFrame(step)}
    requestAnimationFrame(step);
  }
  var cIO=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){count(en.target);cIO.unobserve(en.target)}})},{threshold:.6}):null;
  $('.stats b').forEach(function(b){if(cIO)cIO.observe(b)});

  // Scroll-linked pieces: progress bar, nav hide/show, timeline line, word fill, current section
  var bar=document.querySelector('.progress i'),nav=document.querySelector('.nav'),tl=document.querySelector('.timeline');
  var words=$('.quotes h3 .w'),links=$('.nav-links a[href^="#"]:not(.nav-cta)'),secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
  var lastY=window.scrollY,ticking=false;
  function frame(){
    ticking=false;
    var y=window.scrollY,h=document.documentElement.scrollHeight-window.innerHeight;
    if(bar)bar.style.setProperty('--p',h>0?(y/h).toFixed(4):0);
    if(nav&&!reduce){
      var menuOpen=document.getElementById('menu')&&document.getElementById('menu').classList.contains('open');
      if(y>lastY+6&&y>200&&!menuOpen)nav.classList.add('hide');else if(y<lastY-6||y<200)nav.classList.remove('hide');
    }
    lastY=y;
    var vh=window.innerHeight;
    if(tl){var r=tl.getBoundingClientRect();tl.style.setProperty('--tl',Math.max(0,Math.min(1,(vh*0.7-r.top)/r.height)).toFixed(3))}
    if(!reduce){
      words.forEach(function(w){var r=w.getBoundingClientRect();w.classList.toggle('lit',r.top<vh*0.78)});
    }
    var cur=-1;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<vh*0.4)cur=i});
    links.forEach(function(a,i){a.classList.toggle('on',i===cur)});
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);frame();

  if(fine&&!reduce){
    // Pointer spotlight on the hero
    var top=document.querySelector('.dark.top');
    if(top)top.addEventListener('pointermove',function(e){var r=top.getBoundingClientRect();top.style.setProperty('--mx',(e.clientX-r.left)+'px');top.style.setProperty('--my',(e.clientY-r.top)+'px')});

    // Photo drifts slightly against the pointer
    var art=document.querySelector('.hero-art');
    if(art){
      var arch=art.querySelector('.arch'),sun=art.querySelector('.shape-sun'),mint=art.querySelector('.shape-mint');
      art.addEventListener('pointermove',function(e){var r=art.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        arch.style.transform='translate('+(x*-10)+'px,'+(y*-10)+'px)';sun.style.transform='translate('+(x*26)+'px,'+(y*26)+'px)';mint.style.transform='translate('+(x*-22)+'px,'+(y*-22)+'px)'});
      art.addEventListener('pointerleave',function(){[arch,sun,mint].forEach(function(e){e.style.transform=''})});
    }

    // 3D tilt with a light glare on project covers and badges
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
    $('.hero-actions .btn,.nav-cta').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.28)+'px)'});
      b.addEventListener('pointerleave',function(){b.style.transform=''});
    });
  }
})();
