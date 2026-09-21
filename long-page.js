/* One continuous document. The original sections and content remain the source. */
function longPageMarkup(){
 const p=D.sections.about.paragraphs;
 const sections={art:()=>museumMarkup(),photography:()=>galleryPage('photography'),poetry:()=>galleryPage('poetry'),writing:writingPage,journey:journeyPage,pantheon:pantheonPage,contact:contactPage,friend:friendPage};
 return `<div class="intro-sequence"><div class="intro-backdrop" aria-hidden="true"><div class="intro-atmosphere"></div><img class="intro-portrait" src="${E(D.sections.home.images[0])}" alt="" fetchpriority="high"><div class="intro-shade"></div></div><div class="intro-story"><section id="section-home" class="intro-scene merged-intro" data-section="home" aria-label="让我想想说什么比较好"><div class="intro-copy"><div class="focus-copy intro-welcome"><h1 id="welcome-title">${E(D.sections.home.headings[0])}</h1><p>花径不曾缘客扫，蓬门今始为君开</p></div><div class="intro-about"><div class="focus-copy intro-about-title"><h2>${E(p[0])}</h2><p>${E(p[2])}</p></div><p class="focus-copy">${E(p[3])}</p><div class="focus-copy intro-bio"><h3>${E(p[4])}</h3>${p.slice(5).map(t=>`<p>${E(t)}</p>`).join('')}</div></div></div></section></div></div>${navigation.filter(n=>sections[n.id]).map(n=>`${sectionBridge(navigation[navigation.findIndex(x=>x.id===n.id)-1].id,n.id)}<section id="section-${n.id}" class="long-section ${n.id==='pantheon'?'pantheon-page':''}" data-section="${n.id}" aria-label="${E(n.label)}"><div class="section-content">${sections[n.id]()}</div></section>`).join('')}`;
}

class LongPageController {
 constructor(){
  this.sections=[...document.querySelectorAll('[data-section]')];this.copies=[...document.querySelectorAll('.focus-copy')];this.reduced=matchMedia('(prefers-reduced-motion: reduce)');this.listeners=[];this.frame=0;this.scrollFrame=0;this.current='';this.target=scrollY;
  this.listen(window,'scroll',()=>this.request(),{passive:true});this.listen(window,'resize',()=>{this.cancel();this.request();},{passive:true});
  this.listen(window,'wheel',e=>this.wheel(e),{passive:false});
  this.listen(window,'touchstart',()=>this.cancel(),{passive:true});
  this.listen(window,'pointerdown',()=>this.cancel(),{passive:true});
  this.listen(window,'keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))this.cancel();});
  this.listen(this.reduced,'change',()=>{this.cancel();this.request();});
  this.request();
 }
 listen(el,event,fn,opts){el.addEventListener(event,fn,opts);this.listeners.push(()=>el.removeEventListener(event,fn,opts));}
 request(){if(!this.frame)this.frame=requestAnimationFrame(()=>{this.frame=0;this.paint();});}
 paint(){
  const center=innerHeight*.5;
  this.copies.forEach(el=>{const r=el.getBoundingClientRect();const distance=Math.abs(r.top+r.height/2-center);const focus=Math.max(0,1-distance/(innerHeight*.48));const opacity=focus>.86?1:Math.max(.025,Math.pow(focus,2.6));el.style.opacity=this.reduced.matches?1:opacity.toFixed(3);el.style.filter=this.reduced.matches?'none':`blur(${((1-focus)*.55).toFixed(2)}px)`;});
  let active=this.sections[0];for(const section of this.sections){if(section.getBoundingClientRect().top<=innerHeight*.40)active=section;}
  const intro=document.querySelector('.intro-sequence');document.body.classList.toggle('intro-active',intro.getBoundingClientRect().bottom>innerHeight*.4);
  document.body.classList.toggle('sky-active',active.dataset.section==='pantheon');document.body.classList.toggle('journey-active',active.dataset.section==='journey');
  if(!this.navigating&&active.dataset.section!==this.current)this.activate(active.dataset.section,true);
  for(const section of this.sections){if(section.classList.contains('intro-scene'))continue;const r=section.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)continue;const progress=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight*.68)));section.style.setProperty('--section-arrival',this.reduced.matches?1:progress);}
 }
 activate(id,updateHash=false){document.body.classList.toggle('journey-active',id==='journey');this.current=id;activeRoute=id;document.querySelectorAll('#navigation a').forEach(a=>{const on=a.getAttribute('href')==='#/'+id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});document.title=displayTitles[id]+' · 十里 · 内陆帝国';if(updateHash)history.replaceState(null,'','#/'+id);}
 cancel(){cancelAnimationFrame(this.scrollFrame);this.scrollFrame=0;this.navigating=false;this.target=scrollY;}
 scrollToSection(id,animate=true,restore){
  const el=document.querySelector('#section-'+id);if(!el)return;
  closeMenu();this.activate(id);const y=restore??Math.max(0,el.getBoundingClientRect().top+scrollY-(id==='about'?innerHeight*.22:0));
  this.cancel();this.navigating=true;
  if(!animate||this.reduced.matches){scrollTo(0,y);this.target=y;this.navigating=false;this.request();return;}
  const start=scrollY,distance=y-start,duration=Math.min(1700,950+Math.abs(distance)*.055);let begin;
  const step=t=>{begin??=t;const p=Math.min(1,(t-begin)/duration);const ease=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;scrollTo(0,start+distance*ease);if(p<1)this.scrollFrame=requestAnimationFrame(step);else{this.scrollFrame=0;this.navigating=false;this.target=scrollY;this.request();}};this.scrollFrame=requestAnimationFrame(step);
 }
 wheel(e){
  if(this.reduced.matches||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]')||document.body.classList.contains('menu-open')||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  if(e.target.closest('input,textarea,select,[contenteditable],.poetry-pages,.reading-toc,.medal-orbit'))return;
  // Respect any independently scrollable area; do not trap gallery or form input.
  for(let el=e.target;el&&el!==document.body;el=el.parentElement){const s=getComputedStyle(el);if(/auto|scroll/.test(s.overflowY)&&el.scrollHeight>el.clientHeight+2)return;}
  e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?18:e.deltaMode===2?innerHeight:1);
  if(this.navigating)this.cancel();if(!this.scrollFrame)this.target=scrollY;
  this.target=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,this.target+delta));
  if(this.scrollFrame)return;let last,position=scrollY;
  const step=t=>{const dt=last?Math.min(t-last,40):16;last=t;position+=(this.target-position)*(1-Math.exp(-dt/115));scrollTo(0,position);if(Math.abs(this.target-position)>.5)this.scrollFrame=requestAnimationFrame(step);else{scrollTo(0,this.target);this.scrollFrame=0;}};this.scrollFrame=requestAnimationFrame(step);
 }
 destroy(){this.cancel();cancelAnimationFrame(this.frame);this.listeners.forEach(off=>off());document.body.classList.remove('intro-active','sky-active','journey-active');}
}
function sectionBridge(from,to){return `<div class="section-bridge" data-from="${from}" data-to="${to}" aria-hidden="true"></div>`;}
