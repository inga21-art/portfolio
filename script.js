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

  // Draggable stickers (pointer events: mouse, touch, pen)
  document.querySelectorAll('.sticker').forEach(function(el){
    var tilt=parseFloat(el.dataset.tilt)||0,sx,sy,ox=0,oy=0,drag=false;
    el.style.transform='rotate('+tilt+'deg)';
    el.addEventListener('pointerdown',function(e){drag=true;sx=e.clientX;sy=e.clientY;el.setPointerCapture(e.pointerId);el.style.zIndex=10});
    el.addEventListener('pointermove',function(e){
      if(!drag)return;
      el.style.transform='translate('+(ox+e.clientX-sx)+'px,'+(oy+e.clientY-sy)+'px) rotate('+(tilt+4)+'deg)';
    });
    function end(e){
      if(!drag)return;drag=false;ox+=e.clientX-sx;oy+=e.clientY-sy;
      el.style.transform='translate('+ox+'px,'+oy+'px) rotate('+tilt+'deg)';
    }
    el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
    el.addEventListener('keydown',function(e){
      var d={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key];
      if(d){e.preventDefault();ox+=d[0];oy+=d[1];el.style.transform='translate('+ox+'px,'+oy+'px) rotate('+tilt+'deg)'}
    });
  });

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
})();
